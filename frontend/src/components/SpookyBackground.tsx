export default function SpookyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at top, #1a0a2e 0%, #0d0015 40%, #050208 100%)",
        }}
      />

      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 opacity-50 animate-gradient-shift"
        style={{
          background:
            "radial-gradient(circle at 30% 70%, rgba(34,197,94,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(168,85,247,0.15) 0%, transparent 50%)",
        }}
      />

      {/* Moon */}
      <div className="absolute top-8 right-12 w-24 h-24">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)",
            boxShadow: "0 0 60px rgba(251, 191, 36, 0.4), 0 0 120px rgba(251, 191, 36, 0.2)",
          }}
        />
        {/* Moon craters */}
        <div className="absolute top-4 left-6 w-4 h-4 rounded-full bg-amber-200/30" />
        <div className="absolute top-10 right-6 w-3 h-3 rounded-full bg-amber-200/30" />
        <div className="absolute bottom-6 left-8 w-5 h-5 rounded-full bg-amber-200/30" />
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Flying bats */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bat-fly"
          style={{
            left: `${10 + i * 18}%`,
            top: `${8 + (i % 3) * 8}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${4 + i * 0.5}s`,
          }}
        >
          <svg viewBox="0 0 60 30" className="w-12 h-6 opacity-70">
            <path
              d="M30 15 Q20 5 10 10 Q15 15 10 20 Q20 18 30 15 Q40 18 50 20 Q45 15 50 10 Q40 5 30 15"
              fill="#1a1a2e"
            />
            <circle cx="28" cy="13" r="1" fill="#22c55e" />
            <circle cx="32" cy="13" r="1" fill="#22c55e" />
          </svg>
        </div>
      ))}

      {/* Spider webs - Top corners */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-40">
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <path
            d="M0 0 L150 0 M0 0 L0 150 M0 0 L150 150 M0 0 L100 150 M0 0 L150 100 M0 0 L50 150 M0 0 L150 50"
            stroke="#6b7280"
            strokeWidth="0.5"
            fill="none"
          />
          <path d="M0 30 Q40 35 75 30 Q110 35 150 30" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          <path d="M0 60 Q35 65 70 60 Q105 65 140 60" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          <path d="M0 90 Q30 95 60 90 Q90 95 120 90" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          {/* Spider */}
          <circle cx="45" cy="45" r="5" fill="#1f2937" />
          <circle cx="45" cy="38" r="3" fill="#1f2937" />
          <path
            d="M40 45 L30 35 M40 43 L28 43 M40 47 L30 55 M50 45 L60 35 M50 43 L62 43 M50 47 L60 55"
            stroke="#1f2937"
            strokeWidth="1.5"
          />
          <circle cx="43" cy="36" r="1" fill="#22c55e" />
          <circle cx="47" cy="36" r="1" fill="#22c55e" />
        </svg>
      </div>

      <div className="absolute top-0 right-0 w-40 h-40 opacity-30 transform scale-x-[-1]">
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <path
            d="M0 0 L150 0 M0 0 L0 150 M0 0 L150 150 M0 0 L100 150 M0 0 L150 100"
            stroke="#6b7280"
            strokeWidth="0.5"
            fill="none"
          />
          <path d="M0 25 Q35 30 70 25 Q105 30 140 25" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          <path d="M0 50 Q30 55 60 50 Q90 55 120 50" stroke="#6b7280" strokeWidth="0.5" fill="none" />
        </svg>
      </div>

      {/* Graveyard scene - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64">
        <svg viewBox="0 0 1400 250" className="w-full h-full" preserveAspectRatio="none">
          {/* Fog layer */}
          <defs>
            <linearGradient id="fogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(34,197,94,0.1)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0.2)" />
            </linearGradient>
          </defs>

          {/* Ground with grass hints */}
          <path
            d="M0 250 L0 180 Q70 175 140 180 Q210 185 280 178 Q350 175 420 182 Q490 178 560 180 Q630 185 700 177 Q770 175 840 182 Q910 178 980 180 Q1050 185 1120 178 Q1190 175 1260 182 Q1330 178 1400 180 L1400 250 Z"
            fill="#0a0a0a"
          />

          {/* Tombstones */}
          <g className="animate-sway" style={{ transformOrigin: "115px 180px", animationDuration: "6s" }}>
            <path
              d="M80 180 L80 100 Q80 70 115 70 Q150 70 150 100 L150 180"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text
              x="115"
              y="120"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="14"
              fontWeight="bold"
              className="animate-pulse"
            >
              RIP
            </text>
            <text x="115" y="140" textAnchor="middle" fill="#4a5568" fontSize="10">
              API v1
            </text>
            <text x="115" y="155" textAnchor="middle" fill="#4a5568" fontSize="8">
              2010-2024
            </text>
          </g>

          <g>
            <path d="M250 180 L250 120 L280 85 L310 120 L310 180" fill="#1a1a2e" stroke="#2d2d4a" strokeWidth="2" />
            <path d="M280 100 L280 150 M265 120 L295 120" stroke="#a855f7" strokeWidth="3" className="animate-pulse" />
          </g>

          <g className="animate-sway" style={{ transformOrigin: "440px 180px", animationDuration: "5s" }}>
            <path
              d="M400 180 L400 90 Q400 60 440 60 Q480 60 480 90 L480 180"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="440" y="115" textAnchor="middle" fill="#f97316" fontSize="12" className="animate-pulse">
              REST
            </text>
            <text x="440" y="135" textAnchor="middle" fill="#4a5568" fontSize="10">
              IN
            </text>
            <text x="440" y="155" textAnchor="middle" fill="#4a5568" fontSize="10">
              PEACE
            </text>
          </g>

          {/* Casket with glow */}
          <g>
            <path
              d="M560 180 L580 160 L680 160 L700 180 L700 210 L690 215 L590 215 L580 210 Z"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <path d="M600 160 L600 200 M660 160 L660 200" stroke="#2d2d4a" strokeWidth="1" />
            <path d="M630 165 L630 195 M615 178 L645 178" stroke="#22c55e" strokeWidth="3" className="animate-pulse" />
            {/* Casket glow */}
            <ellipse cx="630" cy="180" rx="40" ry="20" fill="rgba(34,197,94,0.15)" className="animate-pulse" />
          </g>

          {/* More tombstones on right */}
          <g className="animate-sway" style={{ transformOrigin: "850px 180px", animationDuration: "7s" }}>
            <path
              d="M810 180 L810 110 Q810 85 850 85 Q890 85 890 110 L890 180"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="850" y="130" textAnchor="middle" fill="#a855f7" fontSize="12" className="animate-pulse">
              SOAP
            </text>
            <text x="850" y="150" textAnchor="middle" fill="#4a5568" fontSize="10">
              v2.0
            </text>
          </g>

          <g>
            <path d="M980 180 L980 130 L1010 100 L1040 130 L1040 180" fill="#1a1a2e" stroke="#2d2d4a" strokeWidth="2" />
          </g>

          <g className="animate-sway" style={{ transformOrigin: "1150px 180px", animationDuration: "5.5s" }}>
            <path
              d="M1110 180 L1110 95 Q1110 65 1150 65 Q1190 65 1190 95 L1190 180"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1150" y="110" textAnchor="middle" fill="#22c55e" fontSize="11" className="animate-pulse">
              XML
            </text>
            <text x="1150" y="130" textAnchor="middle" fill="#4a5568" fontSize="9">
              Legacy
            </text>
          </g>

          {/* Pumpkins */}
          <g transform="translate(180, 160)">
            <ellipse cx="0" cy="15" rx="22" ry="18" fill="#ea580c" />
            <ellipse cx="-8" cy="15" rx="10" ry="16" fill="#dc2626" opacity="0.3" />
            <ellipse cx="8" cy="15" rx="10" ry="16" fill="#f97316" opacity="0.3" />
            <path d="M0 0 Q5 -10 0 -15" stroke="#166534" strokeWidth="3" fill="none" />
            <ellipse cx="-8" cy="12" rx="4" ry="5" fill="#000" />
            <ellipse cx="8" cy="12" rx="4" ry="5" fill="#000" />
            <path d="M-6 22 Q0 28 6 22" stroke="#000" strokeWidth="2" fill="none" />
            {/* Inner glow */}
            <ellipse cx="-8" cy="12" rx="2" ry="2.5" fill="#fbbf24" className="animate-flicker" />
            <ellipse cx="8" cy="12" rx="2" ry="2.5" fill="#fbbf24" className="animate-flicker" />
          </g>

          <g transform="translate(1280, 165)">
            <ellipse cx="0" cy="12" rx="18" ry="14" fill="#c2410c" />
            <path d="M0 0 Q3 -8 0 -12" stroke="#166534" strokeWidth="2" fill="none" />
            <ellipse cx="-5" cy="10" rx="3" ry="4" fill="#000" />
            <ellipse cx="5" cy="10" rx="3" ry="4" fill="#000" />
            <path d="M-4 17 Q0 20 4 17" stroke="#000" strokeWidth="2" fill="none" />
            <ellipse
              cx="-5"
              cy="10"
              rx="1.5"
              ry="2"
              fill="#fbbf24"
              className="animate-flicker"
              style={{ animationDelay: "0.5s" }}
            />
            <ellipse
              cx="5"
              cy="10"
              rx="1.5"
              ry="2"
              fill="#fbbf24"
              className="animate-flicker"
              style={{ animationDelay: "0.5s" }}
            />
          </g>

          {/* Dead trees */}
          <path
            d="M30 180 L40 60 L20 90 L38 80 L15 50 L40 70 L25 20 L50 55 L65 15 L55 65 L80 40 L50 80 L75 85 L45 95 L60 180"
            fill="#0d0d15"
          />
          <path
            d="M1320 180 L1330 70 L1310 95 L1328 88 L1300 55 L1330 75 L1315 25 L1340 60 L1355 20 L1345 68 L1370 45 L1340 82 L1365 88 L1335 98 L1350 180"
            fill="#0d0d15"
          />

          {/* Candles */}
          <g transform="translate(750, 155)">
            <rect x="-5" y="10" width="10" height="25" fill="#fef3c7" />
            <ellipse cx="0" cy="10" rx="5" ry="2" fill="#fef3c7" />
            <ellipse cx="0" cy="5" rx="4" ry="8" fill="#fbbf24" className="animate-flicker" />
            <ellipse cx="0" cy="2" rx="2" ry="4" fill="#fef3c7" className="animate-flicker" />
          </g>

          <g transform="translate(770, 160)">
            <rect x="-4" y="8" width="8" height="20" fill="#fef3c7" />
            <ellipse cx="0" cy="8" rx="4" ry="1.5" fill="#fef3c7" />
            <ellipse
              cx="0"
              cy="3"
              rx="3"
              ry="6"
              fill="#f97316"
              className="animate-flicker"
              style={{ animationDelay: "0.3s" }}
            />
          </g>

          {/* Cauldron */}
          <g transform="translate(520, 175)">
            <ellipse cx="0" cy="30" rx="30" ry="6" fill="#0a0a0a" />
            <path
              d="M-28 10 Q-35 20 -28 35 L28 35 Q35 20 28 10 Q15 0 0 0 Q-15 0 -28 10"
              fill="#1f2937"
              stroke="#374151"
              strokeWidth="2"
            />
            <ellipse cx="0" cy="5" rx="25" ry="8" fill="#22c55e" opacity="0.7" />
            {/* Bubbles */}
            <circle cx="-8" cy="0" r="4" fill="#22c55e" opacity="0.6" className="animate-bubble" />
            <circle
              cx="5"
              cy="-3"
              r="3"
              fill="#4ade80"
              opacity="0.5"
              className="animate-bubble"
              style={{ animationDelay: "0.5s" }}
            />
            <circle
              cx="-2"
              cy="-5"
              r="3.5"
              fill="#22c55e"
              opacity="0.7"
              className="animate-bubble"
              style={{ animationDelay: "1s" }}
            />
            <circle
              cx="10"
              cy="0"
              r="2.5"
              fill="#86efac"
              opacity="0.5"
              className="animate-bubble"
              style={{ animationDelay: "1.5s" }}
            />
          </g>
        </svg>
      </div>

      {/* Floating particles/souls */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-up"
            style={{
              width: `${3 + Math.random() * 5}px`,
              height: `${3 + Math.random() * 5}px`,
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 30}%`,
              background: i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#a855f7" : "#f97316",
              opacity: 0.4,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Fog layers */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-950/30 via-purple-950/10 to-transparent" />
      <div
        className="absolute bottom-10 left-0 w-[200%] h-16 animate-fog-drift opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent, rgba(168,85,247,0.2), transparent)",
        }}
      />
    </div>
  )
}
