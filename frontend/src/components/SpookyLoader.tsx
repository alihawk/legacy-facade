interface SpookyLoaderProps {
  message: string
  variant?: "analyze" | "generate"
}

export default function SpookyLoader({ message, variant = "analyze" }: SpookyLoaderProps) {
  const isGenerate = variant === "generate"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: isGenerate
          ? "radial-gradient(ellipse at center, #2d1b4e 0%, #1a0a2e 40%, #0d0015 100%)"
          : "radial-gradient(ellipse at center, #0a2e1a 0%, #0d1a0a 40%, #050d05 100%)",
      }}
    >
      {/* Mystical particles */}
      <div className="absolute inset-0 overflow-hidden">
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
              animation: `particle-rise ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* Floating runes background */}
      <div className="absolute inset-0">
        {(isGenerate ? ["⚗", "✨", "🔮", "⭐", "🌙", "💫"] : ["☠", "🦴", "👻", "💀", "⚰", "🕯"]).map((rune, i) => (
          <span
            key={i}
            className="absolute text-3xl opacity-30 animate-float-up"
            style={{
              left: `${5 + i * 16}%`,
              top: `${15 + (i % 2) * 60}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            {rune}
          </span>
        ))}
      </div>

      {/* Main loader content */}
      <div className="relative text-center z-10">
        {/* Outer rotating ring with runes */}
        <div className="absolute -inset-32 animate-spin-slow">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isGenerate ? "#a855f7" : "#22c55e"} />
                <stop offset="50%" stopColor={isGenerate ? "#f97316" : "#4ade80"} />
                <stop offset="100%" stopColor={isGenerate ? "#a855f7" : "#22c55e"} />
              </linearGradient>
            </defs>
            <circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="url(#loaderGradient)"
              strokeWidth="2"
              strokeDasharray="20 10 5 10"
              opacity="0.6"
            />
            {/* Rune symbols */}
            {Array.from({ length: 8 }).map((_, i) => (
              <text
                key={i}
                x="200"
                y="30"
                textAnchor="middle"
                fill={isGenerate ? "#a855f7" : "#22c55e"}
                fontSize="16"
                transform={`rotate(${i * 45} 200 200)`}
                opacity="0.8"
                className="animate-pulse"
              >
                {isGenerate
                  ? ["⚗", "✨", "🔮", "⭐", "🌙", "💫", "🌟", "✧"][i]
                  : ["☠", "⚰", "🕯", "🦇", "👻", "🎃", "🕸", "💀"][i]}
              </text>
            ))}
          </svg>
        </div>

        {/* Middle reverse rotating ring */}
        <div className="absolute -inset-24 animate-spin-reverse">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke={isGenerate ? "#c084fc" : "#4ade80"}
              strokeWidth="1.5"
              strokeDasharray="10 20 30 10"
              opacity="0.4"
            />
            {/* Inner pentagram for generate */}
            {isGenerate && (
              <path
                d="M150 30 L175 110 L260 110 L195 155 L215 240 L150 195 L85 240 L105 155 L40 110 L125 110 Z"
                fill="none"
                stroke="#f97316"
                strokeWidth="1"
                opacity="0.3"
              />
            )}
          </svg>
        </div>

        {/* Energy glow */}
        <div
          className="absolute -inset-16 rounded-full animate-pulse-glow"
          style={{
            background: isGenerate
              ? "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(249,115,22,0.2) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(74,222,128,0.2) 50%, transparent 70%)",
          }}
        />

        {/* Center icon */}
        <div className="relative z-10">
          {isGenerate ? (
            // Portal opening animation
            <div className="relative mb-8">
              <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto animate-pulse">
                <defs>
                  <radialGradient id="portalGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#1a0a2e" />
                  </radialGradient>
                </defs>
                <ellipse cx="50" cy="50" rx="45" ry="45" fill="url(#portalGradient)" opacity="0.8" />
                <ellipse cx="50" cy="50" rx="35" ry="35" fill="#1a0a2e" />
                <ellipse cx="50" cy="50" rx="25" ry="25" fill="url(#portalGradient)" opacity="0.6" />
                <ellipse cx="50" cy="50" rx="15" ry="15" fill="#0d0015" />
                {/* Swirling effect */}
                <path
                  d="M50 15 Q70 30 50 50 Q30 70 50 85"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-spin-slow"
                  style={{ transformOrigin: "50px 50px" }}
                />
              </svg>
              {/* Portal energy */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full blur-lg animate-pulse" />
              </div>
            </div>
          ) : (
            // Skull with energy
            <div className="relative mb-8">
              <svg viewBox="0 0 100 120" className="w-28 h-32 mx-auto">
                <defs>
                  <linearGradient id="analyzeSkullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e0e0e0" />
                    <stop offset="100%" stopColor="#808080" />
                  </linearGradient>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <ellipse cx="50" cy="45" rx="38" ry="40" fill="url(#analyzeSkullGradient)" />
                <ellipse cx="32" cy="40" rx="10" ry="12" fill="#0a0a0a" />
                <ellipse cx="68" cy="40" rx="10" ry="12" fill="#0a0a0a" />
                <ellipse
                  cx="32"
                  cy="40"
                  rx="5"
                  ry="6"
                  fill="#22c55e"
                  filter="url(#glowFilter)"
                  className="animate-pulse"
                />
                <ellipse
                  cx="68"
                  cy="40"
                  rx="5"
                  ry="6"
                  fill="#22c55e"
                  filter="url(#glowFilter)"
                  className="animate-pulse"
                />
                <path d="M45 55 L50 68 L55 55" fill="#1a1a1a" />
                <rect x="32" y="75" width="7" height="11" rx="1" fill="#d0d0d0" />
                <rect x="41" y="75" width="7" height="13" rx="1" fill="#d0d0d0" />
                <rect x="50" y="75" width="7" height="13" rx="1" fill="#d0d0d0" />
                <rect x="59" y="75" width="7" height="11" rx="1" fill="#d0d0d0" />
              </svg>
              {/* Energy aura */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full blur-2xl opacity-40 animate-pulse" />
              </div>
            </div>
          )}

          {/* Message */}
          <p
            className="text-2xl font-bold mb-4"
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

          {/* Subtext */}
          <p className="text-gray-400 mb-6">
            {isGenerate ? "Opening the resurrection portal..." : "Analyzing ancient API structures..."}
          </p>

          {/* Loading bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700">
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
          <div className="flex justify-center gap-3 mt-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{
                  background: isGenerate ? (i % 2 === 0 ? "#a855f7" : "#f97316") : i % 2 === 0 ? "#22c55e" : "#4ade80",
                  animation: "bounce 1s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fog */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  )
}
