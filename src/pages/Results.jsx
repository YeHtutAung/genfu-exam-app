import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ScoreCard from '../components/exam/ScoreCard'
import ImageRenderer from '../components/signs/ImageRenderer'
import Spinner from '../components/ui/Spinner'

export default function Results() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answerMap, setAnswerMap] = useState({})  // { questionId: boolean, subQuestionId: boolean }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wrongOnly, setWrongOnly] = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch session
      const { data: sess, error: sErr } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sErr) { setError(sErr.message); setLoading(false); return }
      setSession(sess)

      // Fetch test meta
      const { data: t } = await supabase
        .from('tests')
        .select('*')
        .eq('id', sess.test_id)
        .single()
      setTest(t)

      // Fetch questions with sub_questions
      const { data: qs } = await supabase
        .from('questions')
        .select('*, sub_questions(*)')
        .eq('test_id', sess.test_id)
        .order('question_number')

      const sorted = (qs || []).map(q => ({
        ...q,
        sub_questions: (q.sub_questions || []).sort((a, b) => a.sub_number - b.sub_number),
        image: q.image_render
          ? { render: q.image_render, sign_code: q.sign_code, src: q.image_url, alt: q.image_alt }
          : null,
      }))
      setQuestions(sorted)

      // Fetch answers for this session
      const { data: ans } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)

      const map = {}
      for (const a of ans || []) {
        const key = a.sub_question_id || a.question_id
        map[key] = { user_answer: a.user_answer, is_correct: a.is_correct }
      }
      setAnswerMap(map)

      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  // Calculate time taken
  const timeTaken = session.completed_at && session.started_at
    ? Math.round((new Date(session.completed_at) - new Date(session.started_at)) / 1000)
    : 0

  // Filter questions for review
  const isQuestionWrong = (q) => {
    if (q.type === 'standard') {
      const a = answerMap[q.id]
      return !a || !a.is_correct
    }
    // Scenario: wrong if any sub_question wrong
    return q.sub_questions.some(sq => {
      const a = answerMap[sq.id]
      return !a || !a.is_correct
    })
  }

  const displayQuestions = wrongOnly
    ? questions.filter(isQuestionWrong)
    : questions

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ScoreCard
        score={session.score ?? 0}
        totalPoints={test?.total_points ?? 50}
        passScore={test?.pass_score ?? 45}
        passed={session.passed ?? false}
        timeTaken={timeTaken}
      />

      {/* Actions */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to={`/exam/${session.test_id}`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          もう一度受験
        </Link>
        <Link
          to={`/study/${session.test_id}`}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          学習モードで復習
        </Link>
        <Link
          to="/"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          ホームに戻る
        </Link>
      </div>

      {/* Review section */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">問題一覧</h2>
          <button
            onClick={() => setWrongOnly(!wrongOnly)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              wrongOnly
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {wrongOnly ? '不正解のみ表示中' : '不正解のみ表示'}
          </button>
        </div>

        <div className="space-y-3">
          {displayQuestions.map(q => (
            <ReviewItem key={q.id} question={q} answerMap={answerMap} />
          ))}
        </div>

        {wrongOnly && displayQuestions.length === 0 && (
          <p className="py-8 text-center text-gray-500">全問正解です！</p>
        )}
      </div>
    </div>
  )
}

function ReviewItem({ question, answerMap }) {
  const isScenario = question.type === 'scenario'

  if (isScenario) {
    const allCorrect = question.sub_questions.every(sq => answerMap[sq.id]?.is_correct)
    return (
      <div className={`rounded-lg border p-4 ${allCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-start gap-3">
          <ResultBadge correct={allCorrect} />
          <div className="flex-1">
            <span className="mb-1 inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              危険予測問題（{question.points}点）
            </span>
            <p className="text-sm text-gray-900">{question.question_jp}</p>

            {question.image && (
              <div className="my-2">
                <ImageRenderer image={question.image} />
              </div>
            )}

            <div className="mt-2 space-y-1">
              {question.sub_questions.map(sq => {
                const a = answerMap[sq.id]
                return (
                  <div key={sq.id} className="flex items-center gap-2 text-xs">
                    <span className={a?.is_correct ? 'text-green-600' : 'text-red-600'}>
                      {a?.is_correct ? '○' : '×'}
                    </span>
                    <span className="text-gray-600">({sq.sub_number})</span>
                    <span className="text-gray-700">{sq.text_jp}</span>
                    <span className="ml-auto text-gray-400">
                      あなた: {a?.user_answer === true ? '○' : a?.user_answer === false ? '×' : '—'}
                      {' '}/ 正解: {sq.answer ? '○' : '×'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Standard question
  const a = answerMap[question.id]
  const correct = a?.is_correct

  return (
    <div className={`rounded-lg border p-4 ${correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <div className="flex items-start gap-3">
        <ResultBadge correct={correct} />
        <div className="flex-1">
          <p className="text-sm text-gray-900">
            <span className="font-medium text-gray-500">問{question.question_number}.</span>{' '}
            {question.question_jp}
          </p>

          {question.image && (
            <div className="my-2">
              <ImageRenderer image={question.image} />
            </div>
          )}

          <div className="mt-1 flex gap-4 text-xs">
            <span className={a?.user_answer === question.answer ? 'text-green-600' : 'text-red-600'}>
              あなたの回答: {a?.user_answer === true ? '○' : a?.user_answer === false ? '×' : '未回答'}
            </span>
            <span className="text-gray-500">
              正解: {question.answer ? '○' : '×'}
            </span>
          </div>

          {!correct && question.hint_jp && (
            <p className="mt-1 text-xs text-blue-600">{question.hint_jp}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultBadge({ correct }) {
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
      correct ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
    }`}>
      {correct ? '○' : '×'}
    </span>
  )
}
