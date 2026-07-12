/**
 * Image URL builder for CMS images (stored in Convex file storage).
 *
 * Keeps the chainable `getImageUrl(img).width(n).quality(q).url()` contract
 * the components were written against when images lived on Sanity's CDN.
 * Resizing now goes through Next's image optimizer (/_next/image), which
 * caches transformed variants on the Vercel CDN. Every width/quality used in
 * code must be allowlisted in next.config.mjs (images.deviceSizes /
 * images.qualities) or the optimizer rejects the request.
 *
 * Calling url() without width() returns the stored file untouched — used for
 * GIFs (the optimizer would flatten animation) and full-size media.
 */

type ImageSource = {
  asset: {
    url: string
  }
}

class ImageUrlBuilder {
  private source: ImageSource
  private targetWidth?: number
  private targetQuality?: number

  constructor(source: ImageSource) {
    this.source = source
  }

  width(width: number) {
    this.targetWidth = width
    return this
  }

  quality(quality: number) {
    this.targetQuality = quality
    return this
  }

  url() {
    if (!this.targetWidth) {
      return this.source.asset.url
    }
    const params = new URLSearchParams({
      url: this.source.asset.url,
      w: String(this.targetWidth),
      q: String(this.targetQuality ?? 75),
    })
    return `/_next/image?${params.toString()}`
  }
}

export function getImageUrl(source: ImageSource) {
  return new ImageUrlBuilder(source)
}
