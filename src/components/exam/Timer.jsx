import { motion } from 'framer-motion'
import useExamStore from '../../store/examStore'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function Timer() {
  const timeRemaining = useExamStore(s => s.timeRemaining)
  const prefersReducedMotion = useReducedMotion()

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isLow = timeRemaining <= 300 // 5 minutes
  const isCritical = timeRemaining <= 60

  let borderColor = 'border-theme-border'
  let textColor = 'text-text-primary'
  let animateProps = {}
  let transitionProps = {}

  if (isCritical) {
    borderColor = 'border-wrong'
    textColor = 'text-wrong'
    if (!prefersReducedMotion) {
      animateProps = { scale: [1, 1.05, 1] }
      transitionProps = { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
    }
  } else if (isLow) {
    borderColor = 'border-warning'
    textColor = 'text-warning'
    if (!prefersReducedMotion) {
      animateProps = { scale: [1, 1.03, 1] }
      transitionProps = { duration: 1, repeat: Infinity, ease: 'easeInOut' }
    }
  }

  return (
    <motion.div
      animate={animateProps}
      transition={transitionProps}
      className={`flex items-center gap-2 rounded-xl border-[1.5px] bg-bg px-3.5 py-1.5 shadow-sm transition-colors ${borderColor} ${textColor}`}
    >
      <span className="text-sm">⏱</span>
      <span className={`font-mono text-lg font-bold tabular-nums`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </motion.div>
  )
}
