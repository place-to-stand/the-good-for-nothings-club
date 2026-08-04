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

const byStorageId: Record<string, GifVideoAsset> = {
  // 16 Channel Switcher build animation (was 6.7 MB)
  'e63ea29e-bcd9-43a6-b4d0-274d49166fc0': {
    src: '/gif-videos/e63ea29e-bcd9-43a6-b4d0-274d49166fc0.mp4',
    poster: '/gif-videos/e63ea29e-bcd9-43a6-b4d0-274d49166fc0.jpg',
    width: 1080,
    height: 1440,
  },
  // Is Weed Legal Here screen capture (was 1.9 MB)
  '2d002193-89ec-422d-a335-4a1cff7869cc': {
    src: '/gif-videos/2d002193-89ec-422d-a335-4a1cff7869cc.mp4',
    poster: '/gif-videos/2d002193-89ec-422d-a335-4a1cff7869cc.jpg',
    width: 1440,
    height: 810,
  },
  // Same file on the dev deployment (quirky-dalmatian-453)
  '3e9ec1bb-8d54-41b0-84bc-12c98ef31aa7': {
    src: '/gif-videos/2d002193-89ec-422d-a335-4a1cff7869cc.mp4',
    poster: '/gif-videos/2d002193-89ec-422d-a335-4a1cff7869cc.jpg',
    width: 1440,
    height: 810,
  },
  '401b2c23-5122-4054-b890-9bf06663221a': {
    src: '/gif-videos/401b2c23-5122-4054-b890-9bf06663221a.mp4',
    poster: '/gif-videos/401b2c23-5122-4054-b890-9bf06663221a.jpg',
    width: 1080,
    height: 1440,
  },
  'fe645271-8daf-44dc-8036-9b88e94e7312': {
    src: '/gif-videos/fe645271-8daf-44dc-8036-9b88e94e7312.mp4',
    poster: '/gif-videos/fe645271-8daf-44dc-8036-9b88e94e7312.jpg',
    width: 1080,
    height: 1440,
  },
  'f9629347-e0d1-4336-a76a-9c9029003b97': {
    src: '/gif-videos/f9629347-e0d1-4336-a76a-9c9029003b97.mp4',
    poster: '/gif-videos/f9629347-e0d1-4336-a76a-9c9029003b97.jpg',
    width: 1080,
    height: 1440,
  },
  'f9ff458b-334d-481a-9f11-6871b5a608eb': {
    src: '/gif-videos/f9ff458b-334d-481a-9f11-6871b5a608eb.mp4',
    poster: '/gif-videos/f9ff458b-334d-481a-9f11-6871b5a608eb.jpg',
    width: 1080,
    height: 1440,
  },
}

/** Look up a video replacement by the asset's Convex storage URL. */
export function getGifVideo(assetUrl: string): GifVideoAsset | undefined {
  const storageId = assetUrl.split('/').at(-1)
  return storageId ? byStorageId[storageId] : undefined
}
