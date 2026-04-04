export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are a helpful Japanese driving license exam tutor.
Explain why the answer is correct or incorrect in clear English.
Keep explanations concise (2-4 sentences).
Reference the specific rule or law where relevant.`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { question_jp, answer, hint_jp, type, sub_questions } = body

  if (!question_jp) {
    return new Response(JSON.stringify({ error: 'question_jp is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build user message with all available context
  let userMessage = `Question: ${question_jp}`
  if (answer !== undefined && answer !== null) {
    userMessage += `\nCorrect answer: ${answer ? '○ (True)' : '× (False)'}`
  }
  if (hint_jp) {
    userMessage += `\nHint: ${hint_jp}`
  }
  if (type === 'scenario' && sub_questions?.length) {
    userMessage += '\nSub-questions:'
    for (const sq of sub_questions) {
      userMessage += `\n  ${sq.sub_number}. ${sq.text_jp} → ${sq.answer ? '○' : '×'}`
    }
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 512 },
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('Gemini API error:', res.status, text)
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json()
    const explanation =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation available.'

    return new Response(JSON.stringify({ explanation }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Explain error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
