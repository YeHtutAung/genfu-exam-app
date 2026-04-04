import SignRenderer from './SignRenderer'

export default function ImageRenderer({ image }) {
  if (!image) return null

  if (image.render === 'css') {
    return <SignRenderer signCode={image.sign_code} />
  }

  if (image.render === 'static') {
    return (
      <div className="mx-auto max-w-sm rounded-lg bg-white p-2">
        <img
          src={image.src}
          alt={image.alt || ''}
          className="h-auto w-full rounded"
          loading="lazy"
        />
      </div>
    )
  }

  return null
}
