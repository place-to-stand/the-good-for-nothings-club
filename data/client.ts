/**
 * Image URL access for CMS images (stored in Convex file storage).
 *
 * Keeps the chainable `getImageUrl(img).width(n).quality(q).url()` contract
 * from the Sanity days, but resizing is now handled by next/image itself
 * (the components render <Image> with the raw storage URL and Next's
 * optimizer produces sized variants, cached on the Vercel CDN). width() and
 * quality() are accepted for API compatibility and ignored — url() always
 * returns the stored file's URL. The optimizer automatically passes
 * animated GIFs through untouched.
 */

type ImageSource = {
  asset: {
    url: string
  }
}

class ImageUrlBuilder {
  private source: ImageSource

  constructor(source: ImageSource) {
    this.source = source
  }

  width(_width: number) {
    return this
  }

  quality(_quality: number) {
    return this
  }

  url() {
    return this.source.asset.url
  }
}

export function getImageUrl(source: ImageSource) {
  return new ImageUrlBuilder(source)
}
