import { supabase } from './supabase'

async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function explain(questionJp, hintJp) {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_jp: questionJp, hint_jp: hintJp }),
  })

  if (!res.ok) {
    let msg = `explain failed: ${res.status}`
    try {
      const data = await res.json()
      if (data.error) msg = data.error
    } catch {}
    throw new Error(msg)
  }

  const data = await res.json()
  return data.explanation
}

export async function uploadBundle(formData) {
  const res = await fetch('/api/upload-bundle', {
    method: 'POST',
    headers: await authHeaders(),
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
    headers: {
      'Content-Type': 'application/json',
      ...await authHeaders(),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `confirm-upload failed: ${res.status}`)
  }

  return res.json()
}

export async function uploadQuestionImage({ questionId, file, imageAlt }) {
  const formData = new FormData()
  formData.append('questionId', questionId)
  formData.append('image', file)
  formData.append('imageAlt', imageAlt || file.name)

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: await authHeaders(),
    body: formData,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `upload-image failed: ${res.status}`)
  }

  return data
}

export async function deleteTest(testId) {
  const res = await fetch('/api/delete-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...await authHeaders(),
    },
    body: JSON.stringify({ testId }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `delete-test failed: ${res.status}`)
  }

  return data
}

export async function sendGuidance({ userId, band, weakestTestId }) {
  const res = await fetch('/api/send-guidance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...await authHeaders(),
    },
    body: JSON.stringify({ userId, band, weakestTestId }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `send-guidance failed: ${res.status}`)
  }

  return data
}
