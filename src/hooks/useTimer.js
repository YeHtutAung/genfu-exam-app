import { useEffect, useRef } from 'react'
import useExamStore from '../store/examStore'

export default function useTimer() {
  const mode = useExamStore(s => s.mode)
  const completed = useExamStore(s => s.completed)
  const loading = useExamStore(s => s.loading)
  const sessionId = useExamStore(s => s.sessionId)
  const startTime = useExamStore(s => s.startTime)
  const tick = useExamStore(s => s.tick)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Wait until the database session and countdown are both initialized.
    // Without this guard, the initial zero value can trigger submission while
    // startExam() is still creating the session.
    if (mode !== 'exam' || completed || loading || !sessionId || !startTime) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [mode, completed, loading, sessionId, startTime, tick])
}
