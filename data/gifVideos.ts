/**
 * Local video replacements for animated GIFs stored in Convex.
 *
 * next/image passes animated GIFs through untouched, so the full
 * multi-megabyte original ships to every visitor (the worst was 6.7 MB).
 * Each entry here is a pre-compressed H.264 render of a CMS GIF, committed
 * to /public/gif-videos with a poster frame, keyed by the Convex storage ID
 * at the end of the asset URL. Components render these with <GifVideo>;
 * unmapped GIFs fall back to the original <Image> path.
 *
 * The six source GIFs: five are member hover profile pictures shown on
 * /about (4-frame 1500×2000 photo loops) and one is the Is Weed Legal Here
 * project card (2296×1290 screen capture). The same files exist on both the
 * prod (resolute-badger-392) and dev (quirky-dalmatian-453) deployments
 * under different storage IDs, so each asset is keyed by both.
 *
 * Staleness: no durable key survives a re-upload (a new upload mints a new
 * storage file AND a new media doc, so mediaId is no better than the
 * storage ID). If an asset here is re-uploaded, getGifVideo misses and the
 * page falls back to the raw GIF — scripts/seo-check.mjs catches that
 * loudly (it crawls every sitemap URL and fails on any media response over
 * 500 KB, and on 4XX for a renamed /gif-videos file). The durable fix is
 * converting GIFs at upload time in the admin; do that if a seventh entry
 * ever lands here.
 *
 * Regenerate with ffmpeg if a source GIF changes:
 *   ffmpeg -i in.gif -vf "scale=1080:-2" -c:v libx264 -crf 28 \
 *     -preset veryslow -pix_fmt yuv420p -movflags +faststart -an out.mp4
 *   ffmpeg -i in.gif -vf "scale=1080:-2" -frames:v 1 -q:v 6 poster.jpg
 */

export type GifVideoAsset = {
  src: string
  poster: string
  width: number
  height: number
}

const asset = (id: string, width: number, height: number): GifVideoAsset => ({
  src: `/gif-videos/${id}.mp4`,
  poster: `/gif-videos/${id}.jpg`,
  width,
  height,
})

// Member hover profile pictures (was 6.7 MB / 1.7 MB / 1.7 MB / 1.7 MB / 1.6 MB)
const hoverA = asset('e63ea29e-bcd9-43a6-b4d0-274d49166fc0', 1080, 1440)
const hoverB = asset('401b2c23-5122-4054-b890-9bf06663221a', 1080, 1440)
const hoverC = asset('fe645271-8daf-44dc-8036-9b88e94e7312', 1080, 1440)
const hoverD = asset('f9629347-e0d1-4336-a76a-9c9029003b97', 1080, 1440)
const hoverE = asset('f9ff458b-334d-481a-9f11-6871b5a608eb', 1080, 1440)
// Is Weed Legal Here project card screen capture (was 1.9 MB)
const weedTracker = asset('2d002193-89ec-422d-a335-4a1cff7869cc', 1440, 810)

const byStorageId: Record<string, GifVideoAsset> = {
  // prod (resolute-badger-392) storage IDs
  'e63ea29e-bcd9-43a6-b4d0-274d49166fc0': hoverA,
  '401b2c23-5122-4054-b890-9bf06663221a': hoverB,
  'fe645271-8daf-44dc-8036-9b88e94e7312': hoverC,
  'f9629347-e0d1-4336-a76a-9c9029003b97': hoverD,
  'f9ff458b-334d-481a-9f11-6871b5a608eb': hoverE,
  '2d002193-89ec-422d-a335-4a1cff7869cc': weedTracker,
  // dev (quirky-dalmatian-453) storage IDs for the same files
  '48c2f8c9-0f32-435a-a004-24ccfbe0a9e9': hoverA,
  '228b2a57-5bf7-4764-8029-c375481923a0': hoverB,
  '2d7b2094-a604-4b0b-9757-83128b6b3520': hoverC,
  '5b6ffc0c-aa47-4b43-863c-0cd0f1fe910a': hoverD,
  '6a9bcdf6-86db-4729-ad7c-ff2b0fd94937': hoverE,
  '3e9ec1bb-8d54-41b0-84bc-12c98ef31aa7': weedTracker,
}

/** Look up a video replacement by the asset's Convex storage URL. */
export function getGifVideo(assetUrl: string): GifVideoAsset | undefined {
  const storageId = assetUrl.split('/').at(-1)
  return storageId ? byStorageId[storageId] : undefined
}
