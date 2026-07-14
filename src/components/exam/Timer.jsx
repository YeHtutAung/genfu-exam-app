import { motion } from 'framer-motion'
import useExamStore from '../../store/examStore'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function Timer() {
  const timeRemaining = useExamStore(s => s.timeRemaining)
  const prefersReducedMotion = useReducedMotion()
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isLow = timeRemaining <= 300
  const isCritical = timeRemaining <= 60
  const tone = isCritical ? 'border-wrong text-wrong' : isLow ? 'border-warning text-warning' : 'border-theme-border text-text-primary'
  const animate = !prefersReducedMotion && isCritical ? { scale: [1, 1.05, 1] } : !prefersReducedMotion && isLow ? { scale: [1, 1.03, 1] } : {}
  const transition = !prefersReducedMotion && (isLow || isCritical) ? { duration: isCritical ? 0.5 : 1, repeat: Infinity, ease: 'easeInOut' } : {}

  return (
    <motion.div animate={animate} transition={transition} className={`flex items-center gap-2 rounded-full border-[1.5px] bg-surface px-3.5 py-2 shadow-sm ${tone}`}>
      <span className="text-sm" aria-hidden="true">◷</span>
      <span className="num font-mono text-lg font-bold">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </motion.div>
  )
}
