import { useEffect, useRef } from 'react'
import useExamStore from '../store/examStore'

export default function useTimer() {
  const mode = useExamStore(s => s.mode)
  const completed = useExamStore(s => s.completed)
  const tick = useExamStore(s => s.tick)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Only tick in exam mode while not completed
    if (mode !== 'exam' || completed) {
      clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [mode, completed, tick])
}
