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
    return (
      <div className="mx-auto max-w-sm rounded-lg bg-white p-2">
        <img
          src={withCacheVersion(image.src)}
          alt={image.alt || ''}
          className="h-auto w-full rounded"
          loading="lazy"
        />
      </div>
    )
  }

  return null
}
