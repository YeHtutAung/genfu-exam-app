// ── Individual sign components ──────────────────────────────────

function SignFrame({ children, className = '' }) {
  return (
    <div className={`mx-auto flex items-center justify-center ${className}`}>
      {children}
    </div>
  )
}

/** Yellow traffic light — horizontal (Japanese style) with 黄 label */
function SignalYellow() {
  return (
    <SignFrame>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-2">
          <div className="h-6 w-6 rounded-full bg-gray-600" />
          <div className="h-6 w-6 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.8)]" />
          <div className="h-6 w-6 rounded-full bg-gray-600" />
        </div>
        <div className="flex flex-col items-center -mt-0.5">
          <div className="h-3 w-px bg-text-secondary" />
          <span className="text-xs text-text-secondary font-jp leading-none">黄</span>
        </div>
      </div>
    </SignFrame>
  )
}

/** White rectangle with dark blue solid left arrow — 左折可 */
function LeftTurnPermitted() {
  return (
    <SignFrame>
      <div className="flex h-14 w-24 items-center justify-center rounded-lg border-[3px] border-blue-900 bg-white">
        <svg viewBox="0 0 60 30" className="h-9 w-16">
          <polygon points="0,15 18,3 18,10 58,10 58,20 18,20 18,27" fill="#1e3a5f" />
        </svg>
      </div>
    </SignFrame>
  )
}

/** Red light (rightmost) with blue right arrow below — horizontal (Japanese style) */
function SignalArrowRight() {
  return (
    <SignFrame>
      <div className="flex flex-col items-end">
        {/* Traffic light housing */}
        <div className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-2">
          <div className="h-6 w-6 rounded-full bg-gray-600" />
          <div className="h-6 w-6 rounded-full bg-gray-600" />
          <div className="h-6 w-6 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        </div>
        {/* Arrow circle under the right light with 青 label + line */}
        <div className="flex flex-col items-center mr-2 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-300">
            <svg viewBox="0 0 20 16" className="h-3.5 w-3.5">
              <polygon points="20,8 12,2 12,5.5 2,5.5 2,10.5 12,10.5 12,14" fill="#1e293b" />
            </svg>
          </div>
          <div className="h-3 w-px bg-text-secondary" />
          <span className="text-xs text-text-secondary font-jp leading-none">青</span>
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

/** 専用 dedicated bus lane sign — bus, 専用, arrow with lane lines inside */
function DedicatedLane() {
  return (
    <SignFrame>
      <svg viewBox="0 0 80 90" className="h-28 w-24">
        {/* Sign background */}
        <rect x="2" y="2" width="76" height="86" rx="6" fill="#1e3a5f" stroke="#9ca3af" strokeWidth="2" />
        {/* Inner border */}
        <rect x="6" y="6" width="68" height="78" rx="4" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />

        {/* Bus body */}
        <rect x="22" y="8" width="36" height="22" rx="4" fill="none" stroke="white" strokeWidth="2" />
        {/* Windshield */}
        <rect x="26" y="11" width="28" height="9" rx="1.5" fill="white" />
        {/* Windshield divider */}
        <line x1="40" y1="11" x2="40" y2="20" stroke="#1e3a5f" strokeWidth="1.5" />
        {/* Wheels */}
        <circle cx="30" cy="30" r="2.5" fill="white" />
        <circle cx="50" cy="30" r="2.5" fill="white" />

        {/* 専 用 text */}
        <text x="40" y="44" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">専 用</text>

        {/* Lane lines (left and right) */}
        <line x1="15" y1="10" x2="15" y2="80" stroke="white" strokeWidth="5" />
        <line x1="65" y1="10" x2="65" y2="82" stroke="white" strokeWidth="5" />

        {/* Down arrow */}
        <polygon points="40,82 24,64 32,64 32,50 48,50 48,64 56,64" fill="white" />
      </svg>
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
