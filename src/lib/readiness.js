export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function calculateReadiness({ tests = [], sessions = [] }) {
  const totalTests = tests.length
  const completed = sessions.filter(session => session.completed_at)
  const examSessions = completed.filter(session => session.mode === 'exam')
  const studySessions = completed.filter(session => session.mode === 'study')
  const attemptedTestIds = new Set(completed.map(session => session.test_id))
  const passedTestIds = new Set(examSessions.filter(session => session.passed).map(session => session.test_id))
  const passedAttempts = examSessions.filter(session => session.passed).length
  const passRate = examSessions.length ? Math.round((passedAttempts / examSessions.length) * 100) : 0

  const testMap = new Map(tests.map(test => [test.id, test]))
  const scorePercents = examSessions
    .filter(session => typeof session.score === 'number')
    .map(session => {
      const test = session.test || testMap.get(session.test_id)
      return clamp((session.score / (test?.total_points || 50)) * 100)
    })
  const averageScorePercent = scorePercents.length
    ? Math.round(scorePercents.reduce((sum, score) => sum + score, 0) / scorePercents.length)
    : 0
  const bestScore = examSessions.reduce((best, session) => (
    typeof session.score !== 'number' ? best : best === null ? session.score : Math.max(best, session.score)
  ), null)

  const completedTests = attemptedTestIds.size
  const passedTests = passedTestIds.size
  const readinessScore = Math.round(clamp(
    (totalTests ? (completedTests / totalTests) * 25 : 0)
      + (totalTests ? (passedTests / totalTests) * 35 : 0)
      + passRate * 0.25
      + averageScorePercent * 0.15
  ))
  const band = readinessScore >= 85 && passedTests >= Math.min(3, totalTests || 3)
    ? 'ready'
    : readinessScore >= 65
      ? 'almost'
      : 'needs'

  return {
    totalTests,
    completedTests,
    passedTests,
    examAttempts: examSessions.length,
    studyAttempts: studySessions.length,
    passRate,
    bestScore,
    averageScorePercent,
    readinessScore,
    band,
  }
}

export const readinessPresentation = {
  ready: { color: '#1F9D57', label: '準備OK' },
  almost: { color: '#E4890F', label: 'もう少し' },
  needs: { color: '#E23B2E', label: '要練習' },
}
