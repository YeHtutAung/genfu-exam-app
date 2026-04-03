// ── Individual sign components ──────────────────────────────────

function SignFrame({ children, className = '' }) {
  return (
    <div className={`mx-auto flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
}

/** Yellow traffic light */
function SignalYellow() {
  return (
    <SignFrame className="w-20">
      <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-800 p-2">
        <div className="h-5 w-5 rounded-full bg-gray-600" />
        <div className="h-5 w-5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
        <div className="h-5 w-5 rounded-full bg-gray-600" />
      </div>
    </SignFrame>
  )
}

/** Blue rectangle with white left arrow — 左折可 */
function LeftTurnPermitted() {
  return (
    <SignFrame>
      <div className="flex h-14 w-20 items-center justify-center rounded bg-blue-600">
        <svg viewBox="0 0 40 24" className="h-8 w-12">
          <path d="M30 12H14M14 12L20 6M14 12L20 18" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </SignFrame>
  )
}

/** Red light with blue right turn arrow */
function SignalArrowRight() {
  return (
    <SignFrame className="w-20">
      <div className="flex flex-col items-center gap-1.5 rounded-lg bg-gray-800 p-2">
        <div className="h-5 w-5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        <div className="h-5 w-5 rounded-full bg-gray-600" />
        <div className="h-5 w-5 rounded-full bg-gray-600" />
        <div className="mt-0.5 flex h-6 w-12 items-center justify-center rounded bg-blue-700">
          <svg viewBox="0 0 30 16" className="h-4 w-8">
            <path d="M6 8H22M22 8L17 3M22 8L17 13" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </SignFrame>
  )
}

/** Yellow lane dividing line diagram */
function YellowLaneDivider() {
  return (
    <SignFrame>
      <div className="relative h-20 w-28 rounded bg-gray-300">
        {/* Road surface */}
        <div className="absolute inset-x-2 inset-y-0 bg-gray-500 rounded" />
        {/* Yellow center line */}
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-yellow-400" />
        {/* Lane markings */}
        <div className="absolute left-1/4 top-2 h-3 w-0.5 bg-white" />
        <div className="absolute left-1/4 top-8 h-3 w-0.5 bg-white" />
        <div className="absolute left-1/4 top-14 h-3 w-0.5 bg-white" />
        <div className="absolute right-1/4 top-2 h-3 w-0.5 bg-white" />
        <div className="absolute right-1/4 top-8 h-3 w-0.5 bg-white" />
        <div className="absolute right-1/4 top-14 h-3 w-0.5 bg-white" />
      </div>
    </SignFrame>
  )
}

/** Blue 専用 lane sign */
function DedicatedLane() {
  return (
    <SignFrame>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 ring-2 ring-blue-800">
        <span className="text-lg font-bold text-white">専用</span>
      </div>
    </SignFrame>
  )
}

/** Diamond road marking pattern — pedestrian crossing */
function PedestrianCrossingMarking() {
  return (
    <SignFrame>
      <div className="relative h-20 w-28 rounded bg-gray-500">
        {/* Road surface */}
        <svg viewBox="0 0 112 80" className="h-full w-full">
          {/* Diamond shape */}
          <polygon points="56,10 76,40 56,70 36,40" fill="white" />
          {/* Inner diamond outline */}
          <polygon points="56,18 70,40 56,62 42,40" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>
    </SignFrame>
  )
}

/** Maximum speed 20km/h road marking */
function SpeedMax20() {
  return (
    <SignFrame>
      <div className="relative h-20 w-28 rounded bg-gray-500">
        <div className="flex h-full flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">20</span>
          <span className="text-[10px] text-white">km/h</span>
        </div>
      </div>
    </SignFrame>
  )
}

/** Yellow diamond school zone warning sign */
function SchoolZoneWarning() {
  return (
    <SignFrame>
      <div className="flex h-16 w-16 rotate-45 items-center justify-center rounded-sm bg-yellow-400 ring-2 ring-yellow-600">
        <div className="-rotate-45 flex flex-col items-center">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            {/* Simplified child figure */}
            <circle cx="12" cy="5" r="3" fill="black" />
            <path d="M12 8V16M8 11H16M9 16L12 22L15 16" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[8px] font-bold text-black leading-none">学校あり</span>
        </div>
      </div>
    </SignFrame>
  )
}

// ── Sign registry ──────────────────────────────────────────────

const SIGNS = {
  signal_yellow: SignalYellow,
  left_turn_permitted: LeftTurnPermitted,
  signal_arrow_right: SignalArrowRight,
  yellow_lane_divider: YellowLaneDivider,
  dedicated_lane: DedicatedLane,
  pedestrian_crossing_marking: PedestrianCrossingMarking,
  speed_max_20: SpeedMax20,
  school_zone_warning: SchoolZoneWarning,
}

export default function SignRenderer({ signCode }) {
  const Component = SIGNS[signCode]

  if (!Component) {
    console.warn(`SignRenderer: unknown sign_code "${signCode}"`)
    return null
  }

  return <Component />
}
