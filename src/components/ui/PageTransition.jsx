import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const instantVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 1 },
}

export default function PageTransition({ children }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={reduced ? instantVariants : variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
