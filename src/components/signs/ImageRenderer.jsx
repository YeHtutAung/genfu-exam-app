import SignRenderer from './SignRenderer'

const imageCacheVersion = Date.now()

function withCacheVersion(src) {
  if (!src) return src
  const separator = src.includes('?') ? '&' : '?'
  return `${src}${separator}v=${imageCacheVersion}`
}

export default function ImageRenderer({ image }) {
  if (!image) return null

  if (image.render === 'css') {
    return <SignRenderer signCode={image.sign_code} />
  }

  if (image.render === 'static') {
    const src = withCacheVersion(image.src)

    return (
      <div className="mx-auto max-w-sm rounded-lg bg-white p-2">
        <img
          src={src}
          srcSet={`${src} 1x`}
          sizes="(max-width: 640px) calc(100vw - 3rem), 24rem"
          alt={image.alt || ''}
          className="h-auto w-full rounded"
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  return null
}
