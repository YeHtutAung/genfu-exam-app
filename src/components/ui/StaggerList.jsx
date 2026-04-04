import { motion } from 'framer-motion'
import useReducedMotion from '../../hooks/useReducedMotion'

const container = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
}

const instantItem = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
}

export default function StaggerList({ children, className = '' }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={container}
      initial="initial"
      animate="animate"
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={reduced ? instantItem : item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
