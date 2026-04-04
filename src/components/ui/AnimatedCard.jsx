import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

export default function AnimatedCard({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduced ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay, ease: 'easeOut' }}
      whileHover={reduced ? {} : { scale: 1.01, transition: { duration: 0.15 } }}
    >
      {children}
    </motion.div>
  )
}
