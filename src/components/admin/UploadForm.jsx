import { useRef, useState } from 'react'
import { useI18n } from '../../lib/i18n'

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
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
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
            <p className="text-lg font-medium text-gray-900">{file.name}</p>
            <p className="mt-1 text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-500">
              {t('admin.dropZip')}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {t('admin.clickToSelect')}
            </p>
          </div>
        )}
      </div>

      {file && (
        <button
          type="submit"
          disabled={uploading}
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? t('admin.uploading') : t('admin.upload')}
        </button>
      )}
    </form>
  )
}
