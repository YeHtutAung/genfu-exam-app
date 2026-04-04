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

/** Diamond road markings on two-lane road — pedestrian crossing ahead */
function PedestrianCrossingMarking() {
  return (
    <SignFrame>
      <svg viewBox="0 0 80 110" className="h-32 w-24">
        {/* Road surface */}
        <rect x="0" y="0" width="80" height="110" rx="4" fill="#9ca3af" />

        {/* Center line (dashed white) */}
        <line x1="40" y1="0" x2="40" y2="18" stroke="white" strokeWidth="2" />
        <line x1="40" y1="26" x2="40" y2="44" stroke="white" strokeWidth="2" />
        <line x1="40" y1="52" x2="40" y2="58" stroke="white" strokeWidth="2" />
        <line x1="40" y1="66" x2="40" y2="84" stroke="white" strokeWidth="2" />
        <line x1="40" y1="92" x2="40" y2="110" stroke="white" strokeWidth="2" />

        {/* Left lane diamonds */}
        <polygon points="20,18 27,30 20,42 13,30" fill="none" stroke="white" strokeWidth="2" />
        <polygon points="20,68 27,80 20,92 13,80" fill="none" stroke="white" strokeWidth="2" />

        {/* Right lane diamonds */}
        <polygon points="60,18 67,30 60,42 53,30" fill="none" stroke="white" strokeWidth="2" />
        <polygon points="60,68 67,80 60,92 53,80" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    </SignFrame>
  )
}

/** Maximum speed 20km/h road marking with 黄 label */
function SpeedMax20() {
  return (
    <SignFrame>
      <div className="flex flex-col items-center">
        <div className="flex h-32 w-20 flex-col items-center justify-center rounded bg-gray-300">
          <span className="text-5xl font-bold text-red-300 leading-none">20</span>
        </div>
        <div className="flex flex-col items-center -mt-0.5">
          <div className="h-3 w-px bg-text-secondary" />
          <span className="text-xs text-text-secondary font-jp leading-none">黄</span>
        </div>
      </div>
    </SignFrame>
  )
}

/** Yellow diamond school zone warning sign — adult and child figures with 黄 label */
function SchoolZoneWarning() {
  return (
    <SignFrame>
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Diamond shape rotated 45deg */}
          <div className="flex h-20 w-20 rotate-45 items-center justify-center rounded-sm bg-pink-200 ring-2 ring-pink-300">
            <div className="-rotate-45">
              <svg viewBox="0 0 50 40" className="h-12 w-14">
                {/* Adult figure */}
                <circle cx="18" cy="6" r="4" fill="#4a5568" />
                <line x1="18" y1="10" x2="18" y2="24" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="18" y1="14" x2="12" y2="20" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="16" x2="24" y2="12" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="24" x2="13" y2="34" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="18" y1="24" x2="23" y2="34" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" />

                {/* Child figure */}
                <circle cx="34" cy="10" r="3.5" fill="#4a5568" />
                <line x1="34" y1="14" x2="34" y2="25" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="34" y1="17" x2="28" y2="14" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" />
                <line x1="34" y1="25" x2="30" y2="34" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="34" y1="25" x2="38" y2="34" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
        {/* 黄 label with pointing line */}
        <div className="flex flex-col items-center -mt-0.5">
          <div className="h-3 w-px bg-text-secondary" />
          <span className="text-xs text-text-secondary font-jp leading-none">黄</span>
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
