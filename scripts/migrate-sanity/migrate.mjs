/**
 * Sanity → Convex migration for GFNC content.
 * See docs/SANITY_TO_CONVEX_MIGRATION.md (Phase 2).
 *
 * Pipeline: fetch GROQ docs → archive original assets → optimize copies
 * (sharp for images, ffmpeg for large videos) → upload to Convex storage →
 * upsert media/members/projects → verify.
 *
 * Idempotent: safe to re-run. Already-migrated assets (matched by Sanity
 * asset id) are skipped; documents are replaced in place.
 *
 * Usage: node scripts/migrate-sanity/migrate.mjs [--convex-url <url>]
 * Reads NEXT_PUBLIC_CONVEX_URL and MIGRATION_SECRET from .env.local unless
 * set in the environment. MIGRATION_SECRET must also be set on the Convex
 * deployment (npx convex env set MIGRATION_SECRET <value>).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { copyFile, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ConvexHttpClient } from 'convex/browser'
import sharp from 'sharp'

import { api } from '../../convex/_generated/api.js'

const SANITY_PROJECT_ID = 'ojzttvlq'
const SANITY_DATASET = 'production'
const SANITY_API_VERSION = '2024-03-07'

const VIDEO_REENCODE_THRESHOLD = 10 * 1024 * 1024 // bytes
const IMAGE_MAX_EDGE = 2560
const IMAGE_PASSTHROUGH_EXTENSIONS = new Set(['svg', 'gif'])

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../..')
const archiveDir = path.join(scriptDir, 'archive')
const optimizedDir = path.join(scriptDir, 'optimized')

// --- config ---------------------------------------------------------------

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local')
  if (!existsSync(envPath)) return {}
  const entries = readFileSync(envPath, 'utf8')
    .split('\n')
    .map(line => line.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^"|"$/g, '')])
  return Object.fromEntries(entries)
}

const envLocal = loadEnvLocal()
const urlFlagIndex = process.argv.indexOf('--convex-url')
const convexUrl =
  (urlFlagIndex !== -1 && process.argv[urlFlagIndex + 1]) ||
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  envLocal.NEXT_PUBLIC_CONVEX_URL
const migrationSecret = process.env.MIGRATION_SECRET || envLocal.MIGRATION_SECRET

if (!convexUrl) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
if (!migrationSecret) throw new Error('MIGRATION_SECRET is not set')

const convex = new ConvexHttpClient(convexUrl)
const secret = migrationSecret

// --- helpers ---------------------------------------------------------------

async function groq(query) {
  const url = new URL(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`
  )
  url.searchParams.set('query', query)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`)
  return (await res.json()).result
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++
        results[index] = await fn(items[index], index)
      }
    })
  )
  return results
}

const pick = (obj, keys) =>
  Object.fromEntries(keys.filter(k => obj[k] !== undefined && obj[k] !== null).map(k => [k, obj[k]]))

const mb = bytes => `${(bytes / 1e6).toFixed(1)} MB`

// --- 1. fetch --------------------------------------------------------------

console.log(`Fetching GFNC documents from Sanity (${SANITY_PROJECT_ID}/${SANITY_DATASET})…`)
const [projects, members, assets] = await Promise.all([
  groq(`*[_type == "GFNC_project" && !(_id in path("drafts.**"))]`),
  groq(`*[_type == "GFNC_member" && !(_id in path("drafts.**"))]`),
  groq(
    `*[_type in ["sanity.imageAsset", "sanity.fileAsset"]
       && count(*[_type in ["GFNC_project", "GFNC_member"] && references(^._id)]) > 0] {
      _id, _type, url, size, mimeType, extension, originalFilename,
      metadata { lqip, dimensions { width, height } }
    }`
  ),
])
console.log(`  ${projects.length} projects, ${members.length} members, ${assets.length} assets`)

// --- 2. archive originals ---------------------------------------------------

mkdirSync(archiveDir, { recursive: true })
mkdirSync(optimizedDir, { recursive: true })

console.log('Archiving original assets…')
let downloaded = 0
await mapWithConcurrency(assets, 6, async asset => {
  const dest = path.join(archiveDir, `${asset._id}.${asset.extension}`)
  if (existsSync(dest) && (await stat(dest)).size === asset.size) return
  const res = await fetch(asset.url)
  if (!res.ok) throw new Error(`Download failed for ${asset._id} (${res.status})`)
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  downloaded++
})
console.log(`  ${downloaded} downloaded, ${assets.length - downloaded} already archived`)

// --- 3. optimize -------------------------------------------------------------

async function makeLqip(filePath) {
  const buffer = await sharp(filePath).resize(20).jpeg({ quality: 50 }).toBuffer()
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

/** Returns { filePath, extension, mimeType, width?, height?, lqip? }. */
async function optimizeAsset(asset) {
  const source = path.join(archiveDir, `${asset._id}.${asset.extension}`)

  if (asset._type === 'sanity.imageAsset') {
    if (IMAGE_PASSTHROUGH_EXTENSIONS.has(asset.extension)) {
      const dest = path.join(optimizedDir, `${asset._id}.${asset.extension}`)
      await copyFile(source, dest)
      return {
        filePath: dest,
        extension: asset.extension,
        mimeType: asset.mimeType,
        width: asset.metadata?.dimensions?.width,
        height: asset.metadata?.dimensions?.height,
        lqip: asset.metadata?.lqip ?? undefined,
      }
    }
    const dest = path.join(optimizedDir, `${asset._id}.webp`)
    if (!existsSync(dest)) {
      await sharp(source, { limitInputPixels: false })
        .rotate() // apply EXIF orientation so stored dimensions match display
        .resize({
          width: IMAGE_MAX_EDGE,
          height: IMAGE_MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 4 })
        .toFile(dest)
    }
    const meta = await sharp(dest).metadata()
    return {
      filePath: dest,
      extension: 'webp',
      mimeType: 'image/webp',
      width: meta.width,
      height: meta.height,
      lqip: await makeLqip(dest),
    }
  }

  // File assets: re-encode large videos, pass everything else through.
  if (asset.mimeType.startsWith('video/') && asset.size > VIDEO_REENCODE_THRESHOLD) {
    const dest = path.join(optimizedDir, `${asset._id}.mp4`)
    if (!existsSync(dest)) {
      execFileSync(
        'ffmpeg',
        // prettier-ignore
        [
          '-y', '-i', source,
          '-c:v', 'libx264', '-crf', '23', '-preset', 'medium',
          '-vf', "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
          '-c:a', 'aac', '-b:a', '128k',
          '-movflags', '+faststart',
          dest,
        ],
        { stdio: ['ignore', 'ignore', 'pipe'] }
      )
    }
    return { filePath: dest, extension: 'mp4', mimeType: 'video/mp4' }
  }

  const dest = path.join(optimizedDir, `${asset._id}.${asset.extension}`)
  await copyFile(source, dest)
  return { filePath: dest, extension: asset.extension, mimeType: asset.mimeType }
}

// --- 4. upload + upsert media ------------------------------------------------

console.log('Checking already-migrated state…')
const existing = await convex.query(api.migration.existingState, { secret })
const existingMedia = new Map(existing.media.map(m => [m.sanityAssetId, m]))

console.log('Optimizing and uploading assets…')
/** sanityAssetId → { mediaId, url, width, height, extension, lqip } */
const mediaMap = new Map()
const sizeReport = []
let uploaded = 0
let skipped = 0

await mapWithConcurrency(assets, 4, async asset => {
  const already = existingMedia.get(asset._id)
  if (already) {
    mediaMap.set(asset._id, already)
    skipped++
    return
  }
  const optimized = await optimizeAsset(asset)
  const bytes = await readFile(optimized.filePath)

  const uploadUrl = await convex.mutation(api.migration.generateUploadUrl, { secret })
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': optimized.mimeType },
    body: bytes,
  })
  if (!res.ok) throw new Error(`Upload failed for ${asset._id} (${res.status})`)
  const { storageId } = await res.json()

  const { mediaId, url } = await convex.mutation(api.migration.upsertMedia, {
    secret,
    media: {
      sanityAssetId: asset._id,
      storageId,
      kind: asset._type === 'sanity.imageAsset' ? 'image' : 'file',
      mimeType: optimized.mimeType,
      extension: optimized.extension,
      size: bytes.length,
      originalSize: asset.size,
      ...pick(asset, ['originalFilename']),
      ...pick(optimized, ['width', 'height', 'lqip']),
    },
  })
  mediaMap.set(asset._id, { mediaId, url, ...pick(optimized, ['width', 'height', 'extension', 'lqip']) })
  sizeReport.push({ asset: asset._id, before: asset.size, after: bytes.length })
  uploaded++
  if (uploaded % 25 === 0) console.log(`  ${uploaded} uploaded…`)
})
console.log(`  ${uploaded} uploaded, ${skipped} already migrated`)

// --- 5. transform + upsert documents ----------------------------------------

function imageField(field, context) {
  const asset = mediaMap.get(field.asset?._ref)
  if (!asset) throw new Error(`Unresolved image asset in ${context}`)
  return {
    mediaId: asset.mediaId,
    url: asset.url,
    width: asset.width,
    height: asset.height,
    extension: asset.extension,
    ...(asset.lqip ? { lqip: asset.lqip } : {}),
    ...(field.caption ? { caption: field.caption } : {}),
    ...(field.hotspot ? { hotspot: pick(field.hotspot, ['x', 'y', 'height', 'width']) } : {}),
    ...(field.crop ? { crop: pick(field.crop, ['top', 'bottom', 'left', 'right']) } : {}),
  }
}

function videoField(field, context) {
  const asset = mediaMap.get(field.asset?._ref)
  if (!asset) throw new Error(`Unresolved video asset in ${context}`)
  return {
    mediaId: asset.mediaId,
    url: asset.url,
    ...pick(field, ['caption', 'playing', 'loop', 'controls']),
  }
}

/** Rewrite image/videoFile blocks inside Portable Text to carry inline media. */
function rewriteBlocks(blocks, context) {
  return blocks?.map(block => {
    if (block._type === 'image') {
      return { _type: 'image', _key: block._key, ...imageField(block, context) }
    }
    if (block._type === 'videoFile') {
      return { _type: 'videoFile', _key: block._key, ...videoField(block, context) }
    }
    return block
  })
}

console.log('Upserting members…')
/** Sanity member _id → Convex members _id */
const memberIdMap = new Map()
for (const member of members.sort((a, b) => a.memberNumber - b.memberNumber)) {
  const { memberId } = await convex.mutation(api.migration.upsertMember, {
    secret,
    member: {
      sanityId: member._id,
      sanityUpdatedAt: member._updatedAt,
      fullName: member.fullName,
      slug: member.slug.current,
      profilePicture: imageField(member.profilePicture, member.slug.current),
      hoverProfilePicture: imageField(member.hoverProfilePicture, member.slug.current),
      roles: member.roles,
      startDate: member.startDate,
      memberNumber: member.memberNumber,
    },
  })
  memberIdMap.set(member._id, memberId)
  console.log(`  #${member.memberNumber} ${member.fullName}`)
}

console.log('Upserting projects…')
for (const project of projects) {
  const slug = project.slug.current
  await convex.mutation(api.migration.upsertProject, {
    secret,
    project: {
      sanityId: project._id,
      sanityUpdatedAt: project._updatedAt,
      title: project.title,
      clientName: project.clientName,
      slug,
      type: project.type,
      status: project.status,
      ...pick(project, ['mainLink', 'dateStarted', 'dateCompleted', 'featured']),
      membersInvolved: (project.membersInvolved ?? []).map(ref => {
        const id = memberIdMap.get(ref._ref)
        if (!id) throw new Error(`${slug}: unknown member ${ref._ref}`)
        return id
      }),
      mainMedia: (project.mainMedia ?? []).map(item =>
        item._type === 'image'
          ? { kind: 'image', image: imageField(item, `${slug}.mainMedia`) }
          : { kind: 'video', video: videoField(item, `${slug}.mainMedia`) }
      ),
      summary: rewriteBlocks(project.summary, `${slug}.summary`),
      overview: rewriteBlocks(project.overview, `${slug}.overview`),
      ...(project.photoGallery
        ? { photoGallery: project.photoGallery.map(i => imageField(i, `${slug}.photoGallery`)) }
        : {}),
      ...(project.caseStudy ? { caseStudy: rewriteBlocks(project.caseStudy, `${slug}.caseStudy`) } : {}),
    },
  })
  console.log(`  ${slug}`)
}

// --- 6. verify ----------------------------------------------------------------

console.log('\nVerifying…')
const report = await convex.query(api.migration.verify, { secret })
const expected = { projects: projects.length, members: members.length, media: assets.length }

console.log(`  counts: ${JSON.stringify(report.counts)} (expected ${JSON.stringify(expected)})`)
console.log(`  media size: ${mb(report.totalMediaBytes)} (originals: ${mb(report.totalOriginalBytes)})`)
if (report.problems.length) {
  console.error(`  PROBLEMS:\n${report.problems.map(p => `    - ${p}`).join('\n')}`)
} else {
  console.log('  no referential-integrity problems')
}

const countsMatch =
  report.counts.projects === expected.projects &&
  report.counts.members === expected.members &&
  report.counts.media === expected.media

writeFileSync(
  path.join(scriptDir, 'report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), expected, ...report, sizeReport }, null, 2)
)
console.log('Full report written to scripts/migrate-sanity/report.json')

if (!countsMatch || report.problems.length) {
  console.error('\nMigration completed WITH PROBLEMS — see above.')
  process.exit(1)
}
console.log('\nMigration complete ✔')
