"use client"

import { useState, useEffect } from "react"

interface ResurrectorIntroProps {
  onComplete: () => void
}

export default function ResurrectorIntro({ onComplete }: ResurrectorIntroProps) {
  const [phase, setPhase] = useState<"awakening" | "corruption" | "resurrection" | "complete">("awakening")
  const [textIndex, setTextIndex] = useState(0)

  const bootMessages = [
    "> Initializing Legacy System v0.1...",
    "> Loading deprecated modules...",
    "> WARNING: SOAP endpoints failing",
    "> ERROR: XML parser corrupted",
    "> CRITICAL: REST API unresponsive",
    "> Summoning necromancer.exe...",
  ]

  // Phase 1: Awakening with typewriter boot messages (2s total)
  useEffect(() => {
    if (phase === "awakening") {
      const messageTimer = setInterval(() => {
        setTextIndex((prev) => {
          if (prev >= bootMessages.length - 1) {
            clearInterval(messageTimer)
            setTimeout(() => setPhase("corruption"), 400)
            return prev
          }
          return prev + 1
        })
      }, 280)
      return () => clearInterval(messageTimer)
    }
  }, [phase])

  // Phase 2: Corruption glitch (0.8s)
  useEffect(() => {
    if (phase === "corruption") {
      const timer = setTimeout(() => setPhase("resurrection"), 800)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Phase 3: Resurrection & Reveal (1.5s)
  useEffect(() => {
    if (phase === "resurrection") {
      const timer = setTimeout(() => setPhase("complete"), 1500)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Complete - fade out
  useEffect(() => {
    if (phase === "complete") {
      const timer = setTimeout(() => onComplete(), 800)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 ${
        phase === "complete" ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background:
          phase === "awakening" || phase === "corruption"
            ? "#000"
            : "radial-gradient(ellipse at center, #1a0a2e 0%, #0d0015 50%, #000 100%)",
      }}
    >
      {/* CRT scanline overlay */}
      {(phase === "awakening" || phase === "corruption") && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-40 opacity-30"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 150px rgba(34,197,94,0.1)",
              borderRadius: "20px",
            }}
          />
        </>
      )}

      {/* Phase 1: Awakening - Old Terminal Boot */}
      {phase === "awakening" && (
        <div className="relative z-10 max-w-2xl w-full px-8">
          {/* Old CRT Monitor Frame */}
          <div className="relative bg-gradient-to-b from-gray-700 to-gray-800 rounded-3xl p-4 shadow-2xl">
            <div className="absolute top-2 left-4 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-500/50"></div>
            </div>
            <div
              className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-hidden"
              style={{ minHeight: "200px" }}
            >
              {bootMessages.slice(0, textIndex + 1).map((msg, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    msg.includes("ERROR") || msg.includes("CRITICAL")
                      ? "text-red-500"
                      : msg.includes("WARNING")
                        ? "text-yellow-500"
                        : msg.includes("necromancer")
                          ? "text-purple-400 animate-pulse"
                          : "text-cyan-500"
                  }`}
                  style={{ animation: "emerge 0.3s ease-out" }}
                >
                  {msg}
                </div>
              ))}
              <span className="inline-block w-2 h-4 bg-cyan-500 animate-pulse ml-1">_</span>
            </div>
            {/* Monitor stand */}
            <div className="mx-auto mt-2 w-24 h-3 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-lg"></div>
          </div>
        </div>
      )}

      {/* Phase 2: Corruption - Glitching Old Tech */}
      {phase === "corruption" && (
        <div className="relative z-10 flex flex-col items-center">
          {/* Glitching devices */}
          <div className="flex items-center gap-8 mb-8">
            {/* Old Desktop PC */}
            <div className="animate-glitch-shake">
              <svg viewBox="0 0 80 100" className="w-20 h-24 opacity-80">
                <rect x="10" y="5" width="60" height="70" rx="3" fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                <rect x="18" y="12" width="44" height="8" fill="#111" />
                <circle cx="25" cy="30" r="4" fill="#dc2626" className="animate-pulse" />
                <circle
                  cx="38"
                  cy="30"
                  r="4"
                  fill="#f59e0b"
                  className="animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <rect x="18" y="42" width="44" height="4" fill="#333" />
                <rect x="18" y="50" width="44" height="4" fill="#333" />
                <rect x="18" y="58" width="44" height="4" fill="#333" />
                <rect x="25" y="80" width="30" height="15" fill="#333" />
              </svg>
            </div>

            {/* Old CRT Monitor with static */}
            <div className="animate-glitch-shake" style={{ animationDelay: "0.1s" }}>
              <svg viewBox="0 0 120 100" className="w-28 h-24 opacity-80">
                <rect x="10" y="8" width="100" height="70" rx="8" fill="#2a2a2a" stroke="#555" strokeWidth="3" />
                <rect x="20" y="16" width="80" height="54" fill="#111" />
                {/* Static noise */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <rect
                    key={i}
                    x={20 + Math.random() * 75}
                    y={16 + Math.random() * 50}
                    width={Math.random() * 10 + 2}
                    height="2"
                    fill={i % 2 === 0 ? "#22c55e" : "#dc2626"}
                    opacity={0.6}
                  />
                ))}
                <text x="60" y="48" textAnchor="middle" fill="#dc2626" fontSize="10" className="animate-pulse">
                  FATAL ERROR
                </text>
                <rect x="45" y="78" width="30" height="18" fill="#333" />
              </svg>
            </div>

            {/* Floppy Disk */}
            <div className="animate-glitch-shake" style={{ animationDelay: "0.2s" }}>
              <svg viewBox="0 0 70 70" className="w-16 h-16 opacity-80">
                <rect x="5" y="5" width="60" height="60" rx="3" fill="#1f1f1f" stroke="#444" strokeWidth="2" />
                <rect x="15" y="5" width="30" height="18" fill="#555" />
                <rect x="20" y="8" width="20" height="12" fill="#777" />
                <rect x="12" y="45" width="46" height="18" fill="#ddd" />
                <text x="35" y="56" textAnchor="middle" fill="#333" fontSize="6">
                  SYSTEM.BAK
                </text>
                <text x="35" y="64" textAnchor="middle" fill="#666" fontSize="5">
                  CORRUPTED
                </text>
              </svg>
            </div>
          </div>

          {/* Glitch overlay text */}
          <div className="relative">
            <span className="text-3xl font-bold text-red-500 animate-pulse">SYSTEM FAILURE</span>
            <div
              className="absolute inset-0 text-3xl font-bold text-cyan-400 opacity-50"
              style={{ transform: "translate(2px, -2px)", mixBlendMode: "screen" }}
            >
              SYSTEM FAILURE
            </div>
          </div>

          {/* Corruption particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0 ? "#dc2626" : i % 3 === 1 ? "#22c55e" : "#3b82f6",
                opacity: 0.4,
                animation: `glitch-shake 0.2s ease infinite`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Phase 3: Resurrection Magic */}
      {phase === "resurrection" && (
        <div className="relative z-10 text-center">
          {/* Magic particles rising */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${3 + Math.random() * 6}px`,
                  height: `${3 + Math.random() * 6}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: "-10%",
                  background: i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#a855f7" : "#f97316",
                  animation: `particle-rise ${1.5 + Math.random() * 1}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Outer magic circle */}
          <div className="absolute -inset-32 animate-spin-slow opacity-50">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="none"
                stroke="url(#circleGrad)"
                strokeWidth="2"
                strokeDasharray="20 10 5 10"
              />
              {Array.from({ length: 8 }).map((_, i) => (
                <text
                  key={i}
                  x="200"
                  y="30"
                  textAnchor="middle"
                  fill={i % 2 === 0 ? "#22c55e" : "#a855f7"}
                  fontSize="18"
                  transform={`rotate(${i * 45} 200 200)`}
                  className="animate-pulse"
                >
                  {["☠", "⚗", "🔮", "✨", "💀", "🌙", "⭐", "🕯"][i]}
                </text>
              ))}
            </svg>
          </div>

          {/* Center glow */}
          <div
            className="absolute -inset-16 rounded-full animate-pulse-glow"
            style={{
              background: "radial-gradient(circle, rgba(34,197,94,0.5) 0%, rgba(168,85,247,0.3) 50%, transparent 70%)",
            }}
          />

          {/* Animated skull with resurrection effect */}
          <div className="relative animate-necro-rise">
            <svg viewBox="0 0 100 120" className="w-36 h-44 mx-auto">
              <defs>
                <linearGradient id="skullResGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f0f0f0" />
                  <stop offset="100%" stopColor="#888" />
                </linearGradient>
                <filter id="resGlow">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Glow aura */}
              <ellipse
                cx="50"
                cy="50"
                rx="48"
                ry="48"
                fill="#22c55e"
                opacity="0.2"
                filter="url(#resGlow)"
                className="animate-pulse"
              />
              {/* Skull */}
              <ellipse cx="50" cy="45" rx="38" ry="40" fill="url(#skullResGrad)" />
              <ellipse cx="32" cy="40" rx="11" ry="13" fill="#0a0a0a" />
              <ellipse cx="68" cy="40" rx="11" ry="13" fill="#0a0a0a" />
              {/* Glowing eyes */}
              <ellipse cx="32" cy="40" rx="6" ry="7" fill="#22c55e" filter="url(#resGlow)" className="animate-pulse" />
              <ellipse cx="68" cy="40" rx="6" ry="7" fill="#22c55e" filter="url(#resGlow)" className="animate-pulse" />
              {/* Nose */}
              <path d="M45 55 L50 68 L55 55" fill="#1a1a1a" />
              {/* Teeth */}
              <rect x="28" y="78" width="9" height="13" rx="1" fill="#e0e0e0" />
              <rect x="39" y="78" width="9" height="15" rx="1" fill="#e0e0e0" />
              <rect x="50" y="78" width="9" height="15" rx="1" fill="#e0e0e0" />
              <rect x="61" y="78" width="9" height="13" rx="1" fill="#e0e0e0" />
            </svg>
          </div>

          {/* Title reveal */}
          <h1 className="text-4xl md:text-5xl font-bold mt-6 animate-emerge">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)" }}
            >
              Legacy UX
            </span>{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a855f7 0%, #f97316 100%)" }}
            >
              Reviver
            </span>
          </h1>
          <p className="text-gray-400 text-lg mt-3 animate-emerge" style={{ animationDelay: "0.2s" }}>
            Breathing new life into dead APIs
          </p>
        </div>
      )}
    </div>
  )
}
