export async function explain(questionJp, hintJp) {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_jp: questionJp, hint_jp: hintJp }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `explain failed: ${res.status}`)
  }

  return res // caller can use res.body for streaming or res.text()
}

export async function uploadBundle(formData) {
  const res = await fetch('/api/upload-bundle', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `upload-bundle failed: ${res.status}`)
  }

  return res.json()
}

export async function confirmUpload(payload) {
  const res = await fetch('/api/confirm-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `confirm-upload failed: ${res.status}`)
  }

  return res.json()
}
