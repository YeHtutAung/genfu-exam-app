import { useRef, useState } from 'react'
import { useI18n } from '../../lib/i18n'
import Button from '../ui/Button'

export default function UploadForm({ onUpload, uploading }) {
  const { t } = useI18n()
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.zip')) {
      setFile(dropped)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || uploading) return
    const formData = new FormData()
    formData.append('bundle', file)
    onUpload(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-theme-border hover:border-primary/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        {file ? (
          <div>
            <p className="text-lg font-medium text-text-primary">{file.name}</p>
            <p className="mt-1 text-sm text-text-secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-text-secondary">
              {t('admin.dropZip')}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              {t('admin.clickToSelect')}
            </p>
          </div>
        )}
      </div>

      {file && (
        <Button
          type="submit"
          disabled={uploading}
          className="mt-4 w-full rounded-md"
        >
          {uploading ? t('admin.uploading') : t('admin.upload')}
        </Button>
      )}
    </form>
  )
}
