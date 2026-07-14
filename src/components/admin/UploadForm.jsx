import { useRef, useState } from 'react'
import { useI18n } from '../../lib/i18n'
import Button from '../ui/Button'

export default function UploadForm({ onUpload, uploading }) {
  const { t } = useI18n()
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)
  const handleDrop = event => { event.preventDefault(); setDragOver(false); const dropped = event.dataTransfer.files[0]; if (dropped?.name.endsWith('.zip')) setFile(dropped) }
  const handleSubmit = event => { event.preventDefault(); if (!file || uploading) return; const formData = new FormData(); formData.append('bundle', file); onUpload(formData) }
  return <form onSubmit={handleSubmit}>
    <div onDragOver={event => { event.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} className={`cursor-pointer rounded-[22px] border-2 border-dashed p-10 text-center transition-colors sm:p-14 ${dragOver ? 'border-primary bg-[#EEF1FE]' : 'border-[#C6BEAC] bg-surface hover:border-primary'}`}>
      <input ref={inputRef} type="file" accept=".zip" className="hidden" onChange={event => setFile(event.target.files[0] || null)} />
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF1FE] text-2xl font-bold text-primary">↑</span>
      <p className="mt-4 text-base font-bold text-text-primary">ZIPファイルをドラッグ＆ドロップ</p><p className="mt-1 text-sm text-text-secondary">またはクリックして選択</p>
    </div>
    {file && <div className="mt-4 flex items-center gap-3 rounded-2xl border border-theme-border bg-surface p-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF1FE] text-xs font-extrabold text-primary">ZIP</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-text-primary">{file.name}</p><div className="mt-2 h-1.5 rounded-full bg-[#EAE5D8]"><div className="h-full w-full rounded-full bg-correct" /></div><p className="num mt-1 text-xs text-correct">{(file.size / 1024 / 1024).toFixed(1)} MB · 準備完了</p></div><span className="text-xl text-correct">✓</span></div>}
    <div className="mt-4 rounded-xl border border-[#F4E0BC] bg-[#FDF3E3] p-3 text-xs text-text-secondary"><strong className="text-warning">検証ルール</strong><span className="ml-2">JSON 1件 · PNG のみ · 最大 50MB · 重複ID なし</span></div>
    {file && <div className="mt-4 grid grid-cols-2 gap-2"><Button type="submit" disabled={uploading}>{uploading ? t('admin.uploading') : t('admin.upload')}</Button><Button type="button" variant="outline" onClick={() => setFile(null)}>キャンセル</Button></div>}
  </form>
}
