"use client"

import { useState, useEffect } from "react"

interface ResurrectorIntroProps {
  onComplete: () => void
}

export default function ResurrectorIntro({ onComplete }: ResurrectorIntroProps) {
  const [phase, setPhase] = useState<"summoning" | "rising" | "portal" | "complete">("summoning")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const summoningTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 40) {
          clearInterval(summoningTimer)
          setPhase("rising")
          return prev
        }
        return prev + 1
      })
    }, 70)

    return () => clearInterval(summoningTimer)
  }, [])

  useEffect(() => {
    if (phase === "rising") {
      const risingTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 75) {
            clearInterval(risingTimer)
            setPhase("portal")
            return prev
          }
          return prev + 1
        })
      }, 70)

      return () => clearInterval(risingTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase === "portal") {
      const portalTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(portalTimer)
            setPhase("complete")
            return prev
          }
          return prev + 1
        })
      }, 80)

      return () => clearInterval(portalTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase === "complete") {
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 1200)

      return () => clearTimeout(completeTimer)
    }
  }, [phase, onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        phase === "complete" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0d0015 50%, #000000 100%)",
      }}
    >
      {/* Animated graveyard silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-10">
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Ground */}
          <path
            d="M0 200 L0 160 Q100 155 200 160 Q300 165 400 158 Q500 155 600 162 Q700 158 800 160 Q900 165 1000 158 Q1100 155 1200 160 L1200 200 Z"
            fill="#0a0a0a"
          />

          {/* Tombstones */}
          <path d="M100 160 L100 110 Q100 95 115 95 Q130 95 130 110 L130 160" fill="#1a1a2e" />
          <text x="115" y="135" textAnchor="middle" fill="#22c55e" fontSize="12" className="animate-pulse">
            RIP
          </text>

          <path d="M250 160 L250 120 L265 100 L280 120 L280 160" fill="#1a1a2e" />
          <path d="M265 115 L265 145 M255 125 L275 125" stroke="#4a1a6b" strokeWidth="3" />

          <path d="M400 160 L400 100 Q400 80 420 80 Q440 80 440 100 L440 160" fill="#1a1a2e" />

          <path d="M550 160 L550 130 L570 110 L590 130 L590 160" fill="#1a1a2e" />

          <path d="M750 160 L750 95 Q750 75 775 75 Q800 75 800 95 L800 160" fill="#1a1a2e" />
          <text x="775" y="130" textAnchor="middle" fill="#22c55e" fontSize="10" className="animate-pulse">
            REST
          </text>
          <text x="775" y="145" textAnchor="middle" fill="#22c55e" fontSize="10" className="animate-pulse">
            IN
          </text>
          <text x="775" y="160" textAnchor="middle" fill="#22c55e" fontSize="10" className="animate-pulse">
            PEACE
          </text>

          <path d="M950 160 L950 115 Q950 100 970 100 Q990 100 990 115 L990 160" fill="#1a1a2e" />

          {/* Dead trees */}
          <path
            d="M50 160 L55 80 L40 100 L55 95 L35 70 L55 85 L45 50 L60 75 L70 45 L65 80 L80 60 L60 90 L75 95 L55 100 L65 160"
            fill="#0d0d0d"
          />
          <path
            d="M1100 160 L1105 90 L1090 105 L1105 100 L1085 75 L1105 88 L1095 55 L1110 78 L1120 50 L1115 85 L1130 65 L1110 95 L1125 100 L1105 105 L1115 160"
            fill="#0d0d0d"
          />
        </svg>
      </div>

      {/* Mystical particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#a855f7" : "#f97316",
              animation: `particle-rise ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Lightning strikes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[15%] w-1 h-[70%] bg-gradient-to-b from-purple-400 via-purple-600 to-transparent animate-lightning opacity-0" />
        <div
          className="absolute top-0 left-[35%] w-0.5 h-[60%] bg-gradient-to-b from-green-400 via-green-600 to-transparent animate-lightning opacity-0"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-0 right-[25%] w-1 h-[65%] bg-gradient-to-b from-orange-400 via-red-600 to-transparent animate-lightning opacity-0"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute top-0 right-[40%] w-0.5 h-[55%] bg-gradient-to-b from-purple-300 via-purple-500 to-transparent animate-lightning opacity-0"
          style={{ animationDelay: "6s" }}
        />
      </div>

      {/* Floating spirits/ghosts */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 20}%`,
            animation: `ghost-drift ${6 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          <svg viewBox="0 0 40 50" className="w-8 h-10">
            <path
              d="M20 5 Q35 5 35 25 L35 40 Q32 38 30 42 Q28 38 25 42 Q22 38 20 42 Q18 38 15 42 Q12 38 10 42 Q8 38 5 40 L5 25 Q5 5 20 5"
              fill={i % 2 === 0 ? "#22c55e" : "#a855f7"}
              opacity="0.5"
            />
            <circle cx="14" cy="20" r="3" fill="#000" />
            <circle cx="26" cy="20" r="3" fill="#000" />
            <ellipse cx="20" cy="30" rx="4" ry="3" fill="#000" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Main summoning circle */}
      <div className="relative z-20">
        {/* Outer mystical ring */}
        <div className="absolute -inset-48 animate-spin-slow">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <defs>
              <linearGradient id="runeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <circle
              cx="250"
              cy="250"
              r="230"
              fill="none"
              stroke="url(#runeGradient)"
              strokeWidth="2"
              strokeDasharray="30 15 10 15"
              opacity="0.6"
            />
            {/* Rune symbols around circle */}
            {Array.from({ length: 12 }).map((_, i) => (
              <text
                key={i}
                x="250"
                y="30"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="20"
                transform={`rotate(${i * 30} 250 250)`}
                opacity="0.7"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {["☠", "⚰", "🕯", "🦇", "👻", "🎃", "🕸", "💀", "⚗", "🔮", "✨", "🌙"][i]}
              </text>
            ))}
          </svg>
        </div>

        {/* Middle pentagram ring */}
        <div className="absolute -inset-36 animate-spin-reverse">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle
              cx="200"
              cy="200"
              r="170"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="10 20 30 10"
              opacity="0.5"
            />
            {/* Pentagram */}
            <path
              d="M200 40 L245 150 L360 150 L270 215 L305 340 L200 270 L95 340 L130 215 L40 150 L155 150 Z"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Inner energy ring */}
        <div className="absolute -inset-24">
          <div
            className="w-full h-full rounded-full animate-pulse-glow"
            style={{
              background:
                phase === "portal"
                  ? "radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)"
                  : phase === "rising"
                    ? "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(34,197,94,0.2) 50%, transparent 70%)"
                    : "radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)",
            }}
          />
        </div>

        {/* Center content */}
        <div className="relative z-10 text-center">
          {/* Animated skull with effects */}
          <div
            className={`mb-8 transition-all duration-1000 ${phase === "rising" || phase === "portal" ? "animate-necro-rise" : ""}`}
          >
            <div className="relative">
              {/* Glow behind skull */}
              <div
                className="absolute inset-0 blur-2xl animate-pulse"
                style={{
                  background:
                    phase === "portal"
                      ? "radial-gradient(circle, #f97316 0%, transparent 70%)"
                      : "radial-gradient(circle, #22c55e 0%, transparent 70%)",
                }}
              />

              {/* Main skull SVG */}
              <svg viewBox="0 0 100 120" className="w-32 h-40 mx-auto relative z-10">
                <defs>
                  <linearGradient id="skullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f0f0f0" />
                    <stop offset="100%" stopColor="#a0a0a0" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Skull shape */}
                <ellipse cx="50" cy="45" rx="40" ry="42" fill="url(#skullGradient)" />

                {/* Eye sockets with glow */}
                <ellipse cx="32" cy="40" rx="12" ry="14" fill="#0a0a0a" />
                <ellipse cx="68" cy="40" rx="12" ry="14" fill="#0a0a0a" />

                {/* Glowing eyes */}
                <ellipse
                  cx="32"
                  cy="40"
                  rx="6"
                  ry="7"
                  fill={phase === "portal" ? "#f97316" : "#22c55e"}
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                <ellipse
                  cx="68"
                  cy="40"
                  rx="6"
                  ry="7"
                  fill={phase === "portal" ? "#f97316" : "#22c55e"}
                  filter="url(#glow)"
                  className="animate-pulse"
                />

                {/* Nose */}
                <path d="M45 55 L50 70 L55 55" fill="#1a1a1a" />

                {/* Teeth */}
                <rect x="30" y="75" width="8" height="12" rx="1" fill="#e0e0e0" />
                <rect x="40" y="75" width="8" height="14" rx="1" fill="#e0e0e0" />
                <rect x="50" y="75" width="8" height="14" rx="1" fill="#e0e0e0" />
                <rect x="60" y="75" width="8" height="12" rx="1" fill="#e0e0e0" />

                {/* Jaw line */}
                <path d="M20 65 Q25 85 30 90 L70 90 Q75 85 80 65" fill="none" stroke="#888" strokeWidth="2" />
              </svg>

              {/* Energy channeling effect */}
              {(phase === "rising" || phase === "portal") && (
                <div className="absolute inset-0 animate-energy-channel">
                  <svg viewBox="0 0 100 120" className="w-32 h-40 mx-auto opacity-50 blur-sm">
                    <ellipse
                      cx="50"
                      cy="45"
                      rx="40"
                      ry="42"
                      fill="none"
                      stroke={phase === "portal" ? "#f97316" : "#22c55e"}
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-5xl font-bold mb-2">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #22c55e 0%, #a855f7 50%, #f97316 100%)",
              }}
            >
              Legacy
            </span>
            <span className="text-white"> Resurrector</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg mb-8 font-medium tracking-wide">Necromancer of Dead APIs</p>

          {/* Phase text */}
          <p className="text-gray-300 mb-6 h-6 text-lg font-medium">
            {phase === "summoning" && <span className="text-green-400">Channeling ancient code spirits...</span>}
            {phase === "rising" && <span className="text-purple-400">The dead APIs are rising...</span>}
            {phase === "portal" && <span className="text-orange-400">Opening the resurrection portal...</span>}
            {phase === "complete" && <span className="text-green-300">Resurrection complete!</span>}
          </p>

          {/* Progress bar with glow */}
          <div className="w-80 mx-auto">
            <div className="h-3 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full transition-all duration-300 rounded-full relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background:
                    progress > 75
                      ? "linear-gradient(90deg, #22c55e, #a855f7, #f97316)"
                      : progress > 40
                        ? "linear-gradient(90deg, #22c55e, #a855f7)"
                        : "linear-gradient(90deg, #166534, #22c55e, #4ade80)",
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  }}
                />
              </div>
            </div>
            <p className="text-sm mt-3 font-mono">
              <span
                className={progress > 75 ? "text-orange-400" : progress > 40 ? "text-purple-400" : "text-green-400"}
              >
                {progress}%
              </span>
              <span className="text-gray-500 ml-2">
                {phase === "summoning" && "Summoning"}
                {phase === "rising" && "Resurrecting"}
                {phase === "portal" && "Manifesting"}
                {phase === "complete" && "Complete"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Ground fog */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/40 via-purple-950/20 to-transparent" />
        <div
          className="absolute bottom-0 left-0 w-[200%] h-20 animate-fog-drift"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent, rgba(168,85,247,0.15), transparent)",
          }}
        />
      </div>
    </div>
  )
}
