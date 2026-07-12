'use client'

import 'react-photo-album/masonry.css'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'

import { useState } from 'react'
import Image from 'next/image'
import MasonryPhotoAlbum, {
  Photo,
  RenderPhotoContext,
  RenderPhotoProps,
} from 'react-photo-album'
import Lightbox, {
  RenderSlideProps,
  useLightboxState,
} from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import { getImageUrl } from '../data/client'
import type { Image as CMSImage } from '../types'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'

type PhotoGalleryProps = {
  photos: CMSImage[]
}

type GalleryPhotoProps = Photo & {
  placeholder: PlaceholderValue
  alt: string
}

const LightboxSlide = ({
  slide,
  rect,
  photos,
}: RenderSlideProps & PhotoGalleryProps) => {
  const { currentIndex } = useLightboxState()
  if (!slide.height || !slide.width) return null

  const width = Math.min(rect.width, (rect.height / slide.height) * slide.width)

  const height = Math.min(
    rect.height,
    (rect.width / slide.width) * slide.height
  )

  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        src={slide.src}
        loading='eager'
        draggable={false}
        width={width}
        height={height}
        alt={slide.alt || ''}
        style={{
          objectFit: 'contain',
        }}
        placeholder={photos[currentIndex].asset.metadata.lqip}
        // sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
      />
    </div>
  )
}

const GalleryPhoto = (
  { onClick }: RenderPhotoProps,
  { photo, width, height, index }: RenderPhotoContext<GalleryPhotoProps>
) => {
  return (
    <div className='relative overflow-hidden' key={index}>
      <Image
        src={photo.src}
        width={width}
        height={height}
        alt={photo.alt || ''}
        className={`w-full cursor-pointer transition-all duration-1000 hover:scale-105`}
        onClick={onClick}
        placeholder={photo.placeholder}
        // sizes='(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
      />
    </div>
  )
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxIndex, setLighboxIndex] = useState(-1)

  const photoAlbumPhotos = photos.map(photo => ({
    src: getImageUrl(photo).width(1400).quality(90).url(),
    alt: photo.caption,
    width: photo.asset.metadata.dimensions.width,
    height: photo.asset.metadata.dimensions.height,
    placeholder: photo.asset.metadata.lqip,
  }))

  return (
    <>
      <MasonryPhotoAlbum
        photos={photoAlbumPhotos}
        layout='masonry'
        columns={containerWidth => {
          if (containerWidth > 1280) return 3
          if (containerWidth > 768) return 2
          return 1
        }}
        spacing={containerWidth => (containerWidth > 768 ? 32 : 16)}
        onClick={({ index: current }) => setLighboxIndex(current)}
        defaultContainerWidth={1281}
        render={{ photo: GalleryPhoto }}
      />
      <Lightbox
        open={lightboxIndex > -1}
        close={() => setLighboxIndex(-1)}
        index={lightboxIndex}
        plugins={[Counter, Zoom]}
        slides={photos.map(photo => ({
          src: getImageUrl(photo).width(2400).quality(90).url(),
          alt: photo.caption,
          height: photo.asset.metadata.dimensions.height,
          width: photo.asset.metadata.dimensions.width,
          placeholder: photo.asset.metadata.lqip,
        }))}
        counter={{
          container: {
            className: 'font-sans',
            style: { top: 'auto', bottom: 0, left: 'auto', right: 0 },
          },
        }}
        render={{
          slide: ({ slide, rect, offset }) => (
            <LightboxSlide
              slide={slide}
              rect={rect}
              offset={offset}
              photos={photos}
            />
          ),
          iconZoomIn: () => null,
          iconZoomOut: () => null,
        }}
      />
    </>
  )
}
