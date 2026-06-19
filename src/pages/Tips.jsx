import { Link } from 'react-router-dom'
import PageTransition from '../components/ui/PageTransition'

const readinessChecks = [
  {
    title: 'Pass timed mock exams consistently',
    detail: 'Aim to pass at least three exam-mode attempts before taking the real test.',
  },
  {
    title: 'Review every wrong answer',
    detail: 'Do not only memorize the correct mark. Understand why the unsafe choice is wrong.',
  },
  {
    title: 'Finish within the time limit',
    detail: 'Practice with the timer on so the real exam does not feel faster than expected.',
  },
  {
    title: 'Be stable, not lucky',
    detail: 'One high score is good. Repeated passing scores are a stronger readiness signal.',
  },
]

const tips = [
  {
    label: 'Question wording',
    items: [
      'Read the whole sentence before choosing an answer.',
      'Watch for strong words like always, never, only, must, and prohibited.',
      'Small wording changes can flip a safe action into an unsafe one.',
    ],
  },
  {
    label: 'Road signs',
    items: [
      'Identify shape and color first, then read any text.',
      'Separate warning signs, prohibition signs, and instruction signs in your mind.',
      'When signs look similar, focus on the one detail that changes the meaning.',
    ],
  },
  {
    label: 'Scenario questions',
    items: [
      'Slow down on hazard prediction questions. They are easy to lose by rushing.',
      'Look for pedestrians, bicycles, blind spots, parked cars, and intersections.',
      'Choose the answer that reduces risk, not the one that only keeps you moving.',
    ],
  },
  {
    label: 'Exam-day behavior',
    items: [
      'Sleep enough and avoid last-minute cramming right before the exam.',
      'Start with calm pacing. Do not rush because the first questions feel easy.',
      'If unsure, eliminate clearly dangerous behavior first.',
    ],
  },
]

export default function Tips() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-bg px-3 py-6 sm:px-4 sm:py-8">
        <main className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Tips & readiness
              </p>
              <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
                Get ready for the real exam
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Use this page before booking or taking the real license exam. The goal is not just to pass once, but to pass reliably.
              </p>
            </div>
            <Link
              to="/"
              className="min-h-11 rounded-lg bg-surface px-4 py-3 text-center text-sm font-semibold text-text-secondary transition-colors hover:bg-theme-border"
            >
              Back to practice
            </Link>
          </div>

          <section className="mt-6 rounded-xl border border-theme-border bg-surface/70 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Ready-to-roll checklist</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  You should feel comfortable checking most of these before the real exam.
                </p>
              </div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Before exam day
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {readinessChecks.map((check, index) => (
                <div key={check.title} className="rounded-lg border border-theme-border bg-bg p-3">
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{check.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-text-secondary">{check.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-text-primary">Practical tips</h2>
              <p className="text-xs text-text-secondary">
                Short reminders for the mistakes learners commonly make.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tips.map(group => (
                <article key={group.label} className="rounded-xl border border-theme-border bg-bg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-text-primary">{group.label}</h3>
                  <ul className="mt-3 space-y-2">
                    {group.items.map(item => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-correct/30 bg-correct/10 p-4">
            <h2 className="text-base font-bold text-correct">Simple rule</h2>
            <p className="mt-1 text-sm leading-relaxed text-text-primary">
              You are close to ready when passing feels normal, not surprising. If your score changes a lot between attempts, keep practicing weak tests first.
            </p>
          </section>
        </main>
      </div>
    </PageTransition>
  )
}
