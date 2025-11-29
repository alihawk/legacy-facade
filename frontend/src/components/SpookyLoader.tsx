interface SpookyLoaderProps {
  message: string
  variant?: "analyze" | "generate"
}

export default function SpookyLoader({ message, variant = "analyze" }: SpookyLoaderProps) {
  const isGenerate = variant === "generate"

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: isGenerate
          ? "radial-gradient(ellipse at center, #2d1b4e 0%, #1a0a2e 40%, #0d0015 100%)"
          : "radial-gradient(ellipse at center, #0a2e1a 0%, #0d1a0a 40%, #050d05 100%)",
      }}
    >
      {/* Mystical particles - behind everything */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: isGenerate
                ? i % 3 === 0
                  ? "#a855f7"
                  : i % 3 === 1
                    ? "#f97316"
                    : "#c084fc"
                : i % 3 === 0
                  ? "#22c55e"
                  : i % 3 === 1
                    ? "#4ade80"
                    : "#86efac",
              animation: `particle-rise ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* Outer rotating ring */}
      <div className="absolute animate-spin-slow" style={{ width: "500px", height: "500px" }}>
        <svg viewBox="0 0 500 500" className="w-full h-full">
          <defs>
            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isGenerate ? "#a855f7" : "#22c55e"} />
              <stop offset="50%" stopColor={isGenerate ? "#f97316" : "#4ade80"} />
              <stop offset="100%" stopColor={isGenerate ? "#a855f7" : "#22c55e"} />
            </linearGradient>
          </defs>
          <circle
            cx="250"
            cy="250"
            r="220"
            fill="none"
            stroke="url(#loaderGradient)"
            strokeWidth="2"
            strokeDasharray="20 10 5 10"
            opacity="0.5"
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <text
              key={i}
              x="250"
              y="40"
              textAnchor="middle"
              fill={isGenerate ? "#a855f7" : "#22c55e"}
              fontSize="16"
              transform={`rotate(${i * 30} 250 250)`}
              opacity="0.6"
            >
              {isGenerate
                ? ["⚗", "✨", "🔮", "⭐", "🌙", "💫", "🌟", "✧", "⚡", "🔥", "💎", "🌀"][i]
                : ["☠", "⚰", "🕯", "🦇", "👻", "🎃", "🕸", "💀", "🦴", "⚱", "🪦", "🌑"][i]}
            </text>
          ))}
        </svg>
      </div>

      {/* Middle reverse ring */}
      <div className="absolute animate-spin-reverse" style={{ width: "380px", height: "380px" }}>
        <svg viewBox="0 0 380 380" className="w-full h-full">
          <circle
            cx="190"
            cy="190"
            r="160"
            fill="none"
            stroke={isGenerate ? "#c084fc" : "#4ade80"}
            strokeWidth="1.5"
            strokeDasharray="10 20 30 10"
            opacity="0.35"
          />
          {isGenerate && (
            <path
              d="M190 40 L215 130 L310 130 L235 180 L260 275 L190 225 L120 275 L145 180 L70 130 L165 130 Z"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              opacity="0.3"
            />
          )}
        </svg>
      </div>

      {/* Energy glow behind center */}
      <div
        className="absolute rounded-full animate-pulse-glow"
        style={{
          width: "280px",
          height: "280px",
          background: isGenerate
            ? "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(249,115,22,0.2) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(74,222,128,0.2) 50%, transparent 70%)",
        }}
      />

      {/* Main Content Container - properly stacked */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Visual Animation Area */}
        <div className="relative mb-6" style={{ height: isGenerate ? "280px" : "180px" }}>
          {isGenerate ? (
            // NECROMANCER ANIMATION
            <div className="relative flex flex-col items-center">
              {/* Necromancer Figure */}
              <div className="animate-necro-cast">
                <svg viewBox="0 0 200 240" className="w-44 h-52">
                  <defs>
                    <linearGradient id="capeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1a0a2e" />
                      <stop offset="100%" stopColor="#0d0015" />
                    </linearGradient>
                    <filter id="necGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Cape */}
                  <path
                    d="M100 45 Q45 70 40 220 L70 210 L100 220 L130 210 L160 220 Q155 70 100 45"
                    fill="url(#capeGrad)"
                    className="animate-cape-flutter"
                    style={{ transformOrigin: "100px 45px" }}
                  />
                  <path d="M100 50 Q55 75 53 200 L100 190 L147 200 Q145 75 100 50" fill="#2d1b4e" opacity="0.5" />

                  {/* Hood */}
                  <path d="M70 50 Q100 20 130 50 Q140 65 130 80 L100 85 L70 80 Q60 65 70 50" fill="#0d0015" />
                  <ellipse cx="100" cy="62" rx="18" ry="22" fill="#0a0a0a" />

                  {/* Glowing eyes */}
                  <ellipse
                    cx="92"
                    cy="58"
                    rx="4"
                    ry="5"
                    fill="#22c55e"
                    filter="url(#necGlow)"
                    className="animate-pulse"
                  />
                  <ellipse
                    cx="108"
                    cy="58"
                    rx="4"
                    ry="5"
                    fill="#22c55e"
                    filter="url(#necGlow)"
                    className="animate-pulse"
                  />

                  {/* Arms raised */}
                  <path d="M65 90 Q30 80 25 110 Q20 120 30 130 L50 120" fill="#1a0a2e" />
                  <path d="M135 90 Q170 80 175 110 Q180 120 170 130 L150 120" fill="#1a0a2e" />

                  {/* Skeletal hands */}
                  <g fill="#d1d5db" className="animate-hand-gesture">
                    <circle cx="28" cy="128" r="7" />
                    <path
                      d="M22 120 L18 105 M26 118 L24 100 M30 118 L32 98 M34 120 L38 105"
                      stroke="#d1d5db"
                      strokeWidth="2"
                    />
                  </g>
                  <g fill="#d1d5db" className="animate-hand-gesture" style={{ animationDelay: "0.5s" }}>
                    <circle cx="172" cy="128" r="7" />
                    <path
                      d="M178 120 L182 105 M174 118 L176 100 M170 118 L168 98 M166 120 L162 105"
                      stroke="#d1d5db"
                      strokeWidth="2"
                    />
                  </g>

                  {/* Staff */}
                  <g className="animate-staff-glow">
                    <rect x="165" y="90" width="6" height="130" rx="2" fill="#4a3728" />
                    <circle cx="168" cy="85" r="14" fill="#22c55e" opacity="0.8" />
                    <circle cx="168" cy="85" r="9" fill="#4ade80" className="animate-pulse" />
                    <circle cx="168" cy="85" r="4" fill="#86efac" />
                  </g>

                  {/* Energy beams */}
                  <path
                    d="M30 120 Q100 90 100 140"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    opacity="0.5"
                    className="animate-pulse"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M170 120 Q100 90 100 140"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    opacity="0.5"
                    className="animate-pulse"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Magic circle below necromancer */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-14">
                <svg
                  viewBox="0 0 200 50"
                  className="w-full h-full animate-magic-circle"
                  style={{ transformOrigin: "100px 25px" }}
                >
                  <ellipse
                    cx="100"
                    cy="25"
                    rx="90"
                    ry="18"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  <ellipse
                    cx="100"
                    cy="25"
                    rx="70"
                    ry="14"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <ellipse
                    cx="100"
                    cy="25"
                    rx="50"
                    ry="10"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  {["◈", "◇", "○", "△", "☆", "◎"].map((r, i) => (
                    <text
                      key={i}
                      x={100 + Math.cos((i * Math.PI) / 3) * 75}
                      y={25 + Math.sin((i * Math.PI) / 3) * 14}
                      fill="#a855f7"
                      fontSize="8"
                      textAnchor="middle"
                      className="animate-pulse"
                    >
                      {r}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          ) : (
            // ANALYZE - Skull
            <div className="relative">
              <svg viewBox="0 0 100 120" className="w-32 h-40">
                <defs>
                  <linearGradient id="skullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e0e0e0" />
                    <stop offset="100%" stopColor="#808080" />
                  </linearGradient>
                  <filter id="glowFilt">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <ellipse cx="50" cy="45" rx="40" ry="42" fill="url(#skullGrad)" />
                <ellipse cx="32" cy="40" rx="10" ry="12" fill="#0a0a0a" />
                <ellipse cx="68" cy="40" rx="10" ry="12" fill="#0a0a0a" />
                <ellipse
                  cx="32"
                  cy="40"
                  rx="5"
                  ry="6"
                  fill="#22c55e"
                  filter="url(#glowFilt)"
                  className="animate-pulse"
                />
                <ellipse
                  cx="68"
                  cy="40"
                  rx="5"
                  ry="6"
                  fill="#22c55e"
                  filter="url(#glowFilt)"
                  className="animate-pulse"
                />
                <path d="M45 55 L50 70 L55 55" fill="#1a1a1a" />
                <rect x="32" y="78" width="7" height="12" rx="1" fill="#d0d0d0" />
                <rect x="41" y="78" width="7" height="14" rx="1" fill="#d0d0d0" />
                <rect x="50" y="78" width="7" height="14" rx="1" fill="#d0d0d0" />
                <rect x="59" y="78" width="7" height="12" rx="1" fill="#d0d0d0" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-24 h-24 bg-green-500 rounded-full blur-2xl opacity-40 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* UI Transformation - only for generate, BELOW the necromancer */}
        {isGenerate && (
          <div className="flex items-center gap-6 mb-6">
            {/* Old UI */}
            <div
              className="animate-ui-crumble"
              style={{ animationDuration: "4s", animationIterationCount: "infinite" }}
            >
              <svg viewBox="0 0 60 70" className="w-12 h-14">
                <rect x="5" y="5" width="50" height="60" rx="4" fill="#374151" stroke="#4b5563" strokeWidth="2" />
                <rect x="10" y="10" width="40" height="8" fill="#6b7280" />
                <rect x="10" y="22" width="25" height="4" fill="#9ca3af" />
                <rect x="10" y="30" width="35" height="4" fill="#9ca3af" />
                <rect x="10" y="38" width="20" height="4" fill="#9ca3af" />
                <rect x="10" y="50" width="40" height="10" rx="2" fill="#4b5563" />
                <text x="30" y="58" textAnchor="middle" fill="#9ca3af" fontSize="6">
                  OLD
                </text>
              </svg>
            </div>

            {/* Arrow */}
            <svg viewBox="0 0 40 20" className="w-10 h-5 animate-energy-beam">
              <defs>
                <linearGradient id="arrowGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <path
                d="M0 10 L30 10 L25 5 M30 10 L25 15"
                fill="none"
                stroke="url(#arrowGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* New UI */}
            <div className="animate-ui-emerge" style={{ animationDuration: "4s", animationIterationCount: "infinite" }}>
              <svg viewBox="0 0 60 70" className="w-12 h-14">
                <rect x="5" y="5" width="50" height="60" rx="4" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                <rect x="10" y="10" width="40" height="8" rx="2" fill="#6366f1" />
                <rect x="10" y="22" width="25" height="4" rx="1" fill="#818cf8" />
                <rect x="10" y="30" width="35" height="4" rx="1" fill="#a78bfa" />
                <rect x="10" y="38" width="20" height="4" rx="1" fill="#c4b5fd" />
                <rect x="10" y="50" width="40" height="10" rx="4" fill="#8b5cf6" />
                <text x="30" y="58" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold">
                  NEW
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* Text Content - always visible, never overlapped */}
        <div className="text-center">
          <p
            className="text-2xl font-bold mb-3"
            style={{
              background: isGenerate
                ? "linear-gradient(135deg, #a855f7, #f97316)"
                : "linear-gradient(135deg, #22c55e, #4ade80)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {message}
          </p>

          <p className="text-gray-400 mb-5 text-sm">
            {isGenerate
              ? "The necromancer transforms your legacy into modern glory..."
              : "Analyzing ancient API structures..."}
          </p>

          {/* Loading bar */}
          <div className="w-72 mx-auto">
            <div className="h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full rounded-full animate-loading-bar"
                style={{
                  background: isGenerate
                    ? "linear-gradient(90deg, #a855f7, #f97316, #a855f7)"
                    : "linear-gradient(90deg, #166534, #22c55e, #4ade80, #22c55e, #166534)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: isGenerate ? (i % 2 === 0 ? "#a855f7" : "#f97316") : i % 2 === 0 ? "#22c55e" : "#4ade80",
                  animation: "bounce 1s ease-in-out infinite",
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fog */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  )
}
