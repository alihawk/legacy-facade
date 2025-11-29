export default function SpookyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Base gradient background - deeper purple/green haunted sky */}
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

      {/* ==================== SKY ELEMENTS ==================== */}

      {/* Enhanced Moon with craters and glow */}
      <div className="absolute top-6 right-8 w-32 h-32">
        <div
          className="w-full h-full rounded-full relative"
          style={{
            background: "radial-gradient(circle at 30% 30%, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)",
            boxShadow: "0 0 100px rgba(251, 191, 36, 0.6), 0 0 200px rgba(251, 191, 36, 0.3)",
          }}
        >
          <div className="absolute top-6 left-8 w-5 h-5 rounded-full bg-amber-200/40" />
          <div className="absolute top-14 right-7 w-4 h-4 rounded-full bg-amber-200/35" />
          <div className="absolute bottom-10 left-12 w-7 h-7 rounded-full bg-amber-200/30" />
          <div className="absolute top-10 left-16 w-3 h-3 rounded-full bg-amber-300/25" />
        </div>
      </div>

      {/* Stars - more variety */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${1 + Math.random() * 2.5}px`,
              height: `${1 + Math.random() * 2.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* ==================== FLOATING DEAD TECH ==================== */}

      {/* Old Desktop Computer - floating */}
      <div className="absolute left-[8%] top-[25%] animate-float-up opacity-25" style={{ animationDuration: "12s" }}>
        <svg viewBox="0 0 100 120" className="w-20 h-24">
          {/* PC Tower */}
          <rect x="5" y="10" width="55" height="90" rx="3" fill="#2a2a2a" stroke="#444" strokeWidth="2" />
          <rect x="12" y="18" width="40" height="10" fill="#111" />
          <circle cx="20" cy="38" r="4" fill="#22c55e" opacity="0.5" className="animate-pulse" />
          <circle
            cx="32"
            cy="38"
            r="4"
            fill="#dc2626"
            opacity="0.5"
            className="animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <rect x="12" y="50" width="40" height="4" fill="#333" />
          <rect x="12" y="58" width="40" height="4" fill="#333" />
          <rect x="12" y="66" width="40" height="4" fill="#333" />
          <rect x="12" y="74" width="40" height="4" fill="#333" />
          {/* Cobwebs */}
          <path d="M55 10 Q70 20 58 35" stroke="#6b7280" strokeWidth="0.5" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* Old CRT Monitor - floating */}
      <div
        className="absolute right-[12%] top-[18%] animate-float-up opacity-20"
        style={{ animationDuration: "10s", animationDelay: "2s" }}
      >
        <svg viewBox="0 0 130 110" className="w-24 h-20">
          <rect x="10" y="10" width="110" height="80" rx="8" fill="#3a3a3a" stroke="#555" strokeWidth="3" />
          <rect x="22" y="18" width="86" height="60" fill="#0a0a0a" />
          {/* Blue screen of death */}
          <rect x="22" y="18" width="86" height="60" fill="#0000aa" opacity="0.3" />
          <text x="65" y="45" textAnchor="middle" fill="#ffffff" fontSize="6" opacity="0.6">
            A fatal exception
          </text>
          <text x="65" y="55" textAnchor="middle" fill="#ffffff" fontSize="6" opacity="0.6">
            has occurred at
          </text>
          <text x="65" y="65" textAnchor="middle" fill="#22c55e" fontSize="5" opacity="0.8">
            0x00000000
          </text>
          <rect x="50" y="90" width="30" height="15" fill="#333" />
        </svg>
      </div>

      {/* Floppy Disk - floating */}
      <div
        className="absolute left-[20%] top-[45%] animate-float-up opacity-15"
        style={{ animationDuration: "14s", animationDelay: "4s" }}
      >
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <rect x="5" y="5" width="60" height="60" rx="3" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
          <rect x="15" y="5" width="28" height="16" fill="#555" />
          <rect x="12" y="42" width="46" height="20" fill="#e5e5e5" />
          <text x="35" y="54" textAnchor="middle" fill="#333" fontSize="5">
            BACKUP_1999
          </text>
          <text x="35" y="62" textAnchor="middle" fill="#666" fontSize="4">
            1.44 MB
          </text>
        </svg>
      </div>

      {/* Old Keyboard - floating */}
      <div
        className="absolute right-[25%] top-[55%] animate-float-up opacity-10"
        style={{ animationDuration: "11s", animationDelay: "1s" }}
      >
        <svg viewBox="0 0 120 40" className="w-24 h-8">
          <rect x="5" y="5" width="110" height="30" rx="3" fill="#2a2a2a" stroke="#444" strokeWidth="2" />
          {/* Key rows */}
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={10 + i * 9} y="10" width="7" height="5" rx="1" fill="#444" />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <rect key={i} x={14 + i * 9} y="17" width="7" height="5" rx="1" fill="#444" />
          ))}
          <rect x="35" y="24" width="50" height="5" rx="1" fill="#444" />
        </svg>
      </div>

      {/* ==================== DRACULA FIGURES ==================== */}

      {/* Dracula Figure - Left - larger and more detailed */}
      <div className="absolute left-[2%] top-[8%] animate-dracula-float">
        <svg viewBox="0 0 140 220" className="w-28 h-44 opacity-25">
          {/* Cape */}
          <path
            d="M70 45 Q15 70 10 200 L45 185 L70 200 L95 185 L130 200 Q125 70 70 45"
            fill="#1a0a2e"
            className="animate-cape-flutter"
            style={{ transformOrigin: "70px 45px" }}
          />
          <path d="M70 50 Q25 75 22 180 L70 165 L118 180 Q115 75 70 50" fill="#7f1d1d" opacity="0.5" />
          {/* Inner red lining */}
          <path d="M70 55 Q35 78 35 170 L70 158 L105 170 Q105 78 70 55" fill="#991b1b" opacity="0.3" />
          {/* Head */}
          <ellipse cx="70" cy="38" rx="18" ry="22" fill="#1f1f2e" />
          <ellipse cx="70" cy="42" rx="14" ry="16" fill="#374151" />
          {/* Eyes - glowing red */}
          <ellipse cx="62" cy="38" rx="4" ry="5" fill="#dc2626" className="animate-pulse" />
          <ellipse cx="78" cy="38" rx="4" ry="5" fill="#dc2626" className="animate-pulse" />
          <ellipse cx="62" cy="38" rx="2" ry="2.5" fill="#fff" opacity="0.8" />
          <ellipse cx="78" cy="38" rx="2" ry="2.5" fill="#fff" opacity="0.8" />
          {/* Fangs */}
          <path d="M64 54 L66 62 L68 54 M72 54 L74 62 L76 54" fill="#f0f0f0" />
          {/* Hair/Widow's peak */}
          <path d="M52 28 Q70 18 88 28 Q75 22 70 30 Q65 22 52 28" fill="#1a1a2e" />
        </svg>
      </div>

      {/* Dracula Figure - Right smaller */}
      <div className="absolute right-[4%] top-[15%] animate-dracula-float" style={{ animationDelay: "5s" }}>
        <svg viewBox="0 0 120 200" className="w-18 h-30 opacity-18">
          <path
            d="M60 40 Q20 60 15 180 L40 170 L60 180 L80 170 L105 180 Q100 60 60 40"
            fill="#1a0a2e"
            className="animate-cape-flutter"
          />
          <path d="M60 45 Q30 65 28 160 L60 150 L92 160 Q90 65 60 45" fill="#581c87" opacity="0.4" />
          <ellipse cx="60" cy="38" rx="12" ry="14" fill="#2d2d3a" />
          <ellipse cx="53" cy="35" rx="3" ry="3.5" fill="#a855f7" className="animate-pulse" />
          <ellipse cx="67" cy="35" rx="3" ry="3.5" fill="#a855f7" className="animate-pulse" />
        </svg>
      </div>

      {/* ==================== BATS ==================== */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-bat-fly"
          style={{
            left: `${3 + i * 10}%`,
            top: `${4 + (i % 5) * 7}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3 + i * 0.3}s`,
            transform: `scale(${0.4 + (i % 4) * 0.2})`,
          }}
        >
          <svg viewBox="0 0 60 30" className="w-10 h-5 opacity-60">
            <path
              d="M30 15 Q20 5 10 10 Q15 15 10 20 Q20 18 30 15 Q40 18 50 20 Q45 15 50 10 Q40 5 30 15"
              fill="#1a1a2e"
            />
            <circle cx="28" cy="13" r="1" fill="#22c55e" className="animate-pulse" />
            <circle cx="32" cy="13" r="1" fill="#22c55e" className="animate-pulse" />
          </svg>
        </div>
      ))}

      {/* ==================== SPIDER WEB - TOP LEFT ==================== */}
      <div className="absolute top-0 left-0 w-52 h-52 opacity-40">
        <svg viewBox="0 0 220 220" className="w-full h-full">
          <path
            d="M0 0 L220 0 M0 0 L0 220 M0 0 L220 220 M0 0 L140 220 M0 0 L220 140 M0 0 L70 220 M0 0 L220 70"
            stroke="#6b7280"
            strokeWidth="0.5"
            fill="none"
          />
          <path d="M0 45 Q60 50 110 45 Q160 50 220 45" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          <path d="M0 90 Q55 95 105 90 Q155 95 200 90" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          <path d="M0 135 Q50 140 95 135 Q140 140 180 135" stroke="#6b7280" strokeWidth="0.5" fill="none" />
          {/* Spider */}
          <circle cx="60" cy="60" r="7" fill="#1f2937" />
          <circle cx="60" cy="50" r="5" fill="#1f2937" />
          <path
            d="M52 60 L38 48 M52 58 L35 58 M52 62 L38 74 M68 60 L82 48 M68 58 L85 58 M68 62 L82 74"
            stroke="#1f2937"
            strokeWidth="1.8"
          />
          <circle cx="57" cy="48" r="1.5" fill="#22c55e" className="animate-pulse" />
          <circle cx="63" cy="48" r="1.5" fill="#22c55e" className="animate-pulse" />
        </svg>
      </div>

      {/* ==================== OWLS ==================== */}

      {/* Owl on branch - Left */}
      <div className="absolute left-[1%] top-[32%]">
        <svg viewBox="0 0 80 100" className="w-16 h-20 animate-owl-turn" style={{ transformOrigin: "40px 50px" }}>
          {/* Branch */}
          <path d="M0 75 Q25 70 55 73 Q70 71 80 75" stroke="#3d2817" strokeWidth="6" fill="none" />
          <path d="M55 73 Q62 65 60 55" stroke="#3d2817" strokeWidth="3" fill="none" />
          {/* Body */}
          <ellipse cx="40" cy="55" rx="18" ry="22" fill="#5c4a3a" />
          <ellipse cx="40" cy="60" rx="12" ry="15" fill="#7a6a5a" />
          {/* Chest pattern */}
          <ellipse cx="40" cy="62" rx="8" ry="10" fill="#8a7a6a" />
          {/* Head */}
          <ellipse cx="40" cy="40" rx="15" ry="13" fill="#6b5b4b" />
          {/* Ear tufts */}
          <path d="M26 28 L28 18 L34 30" fill="#5c4a3a" />
          <path d="M54 28 L52 18 L46 30" fill="#5c4a3a" />
          {/* Eyes */}
          <circle cx="32" cy="38" r="7" fill="#2a2a2a" />
          <circle cx="48" cy="38" r="7" fill="#2a2a2a" />
          <circle
            cx="32"
            cy="38"
            r="4"
            fill="#fbbf24"
            className="animate-owl-blink"
            style={{ transformOrigin: "32px 38px" }}
          />
          <circle
            cx="48"
            cy="38"
            r="4"
            fill="#fbbf24"
            className="animate-owl-blink"
            style={{ transformOrigin: "48px 38px" }}
          />
          <circle cx="32" cy="38" r="2" fill="#000" />
          <circle cx="48" cy="38" r="2" fill="#000" />
          <circle cx="30" cy="36" r="1" fill="#fff" opacity="0.9" />
          <circle cx="46" cy="36" r="1" fill="#fff" opacity="0.9" />
          {/* Beak */}
          <path d="M38 44 L40 52 L42 44" fill="#d97706" />
          {/* Feet */}
          <path d="M32 75 L30 82 M35 75 L35 82 M38 75 L40 82" stroke="#d97706" strokeWidth="2" />
          <path d="M42 75 L40 82 M45 75 L45 82 M48 75 L50 82" stroke="#d97706" strokeWidth="2" />
        </svg>
      </div>

      {/* Second Owl - Right side, smaller */}
      <div className="absolute right-[5%] top-[38%]">
        <svg
          viewBox="0 0 65 85"
          className="w-12 h-16 animate-owl-turn"
          style={{ transformOrigin: "32px 42px", animationDelay: "4s" }}
        >
          <path d="M0 62 Q20 58 45 60 Q58 58 65 62" stroke="#3d2817" strokeWidth="5" fill="none" />
          <ellipse cx="32" cy="48" rx="15" ry="18" fill="#4a3a2a" />
          <ellipse cx="32" cy="35" rx="12" ry="10" fill="#5a4a3a" />
          <circle cx="25" cy="33" r="5" fill="#1a1a1a" />
          <circle cx="39" cy="33" r="5" fill="#1a1a1a" />
          <circle cx="25" cy="33" r="3" fill="#f59e0b" className="animate-owl-blink" style={{ animationDelay: "2s" }} />
          <circle cx="39" cy="33" r="3" fill="#f59e0b" className="animate-owl-blink" style={{ animationDelay: "2s" }} />
          <circle cx="25" cy="33" r="1.5" fill="#000" />
          <circle cx="39" cy="33" r="1.5" fill="#000" />
          <path d="M30 39 L32 45 L34 39" fill="#ea580c" />
        </svg>
      </div>

      {/* ==================== GRAVEYARD SCENE - BOTTOM ==================== */}
      <div className="absolute bottom-0 left-0 right-0 h-80">
        <svg viewBox="0 0 1920 320" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f0f0f" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>
          </defs>

          {/* Ground with grass texture hints */}
          <path
            d="M0 320 L0 220 Q120 215 240 220 Q360 225 480 218 Q600 215 720 222 Q840 218 960 220 Q1080 225 1200 218 Q1320 215 1440 222 Q1560 218 1680 220 Q1800 225 1920 220 L1920 320 Z"
            fill="url(#groundGrad)"
          />

          {/* ==================== DEAD TREES ==================== */}
          <g className="animate-tree-sway" style={{ transformOrigin: "60px 220px" }}>
            <path
              d="M40 220 L52 40 L28 80 L50 65 L10 20 L52 55 L35 -10 L60 42 L82 -15 L68 50 L115 15 L58 70 L100 78 L52 90 L78 220"
              fill="#0d0d0d"
            />
            {/* Leaves occasionally */}
            <ellipse
              cx="25"
              cy="85"
              rx="4"
              ry="6"
              fill="#1a1a1a"
              className="animate-float-up"
              style={{ animationDuration: "8s" }}
            />
          </g>

          <g className="animate-tree-sway" style={{ transformOrigin: "1860px 220px", animationDelay: "3s" }}>
            <path
              d="M1840 220 L1855 50 L1830 85 L1853 75 L1810 35 L1855 65 L1835 5 L1865 55 L1890 0 L1875 60 L1920 25 L1860 80 L1905 85 L1855 95 L1880 220"
              fill="#0d0d0d"
            />
          </g>

          {/* ==================== HAUNTED HOUSE ==================== */}
          <g>
            {/* Main building */}
            <path d="M140 220 L140 150 L190 100 L240 150 L240 220" fill="#0d0d0d" />
            {/* Windows */}
            <rect x="155" y="165" width="25" height="35" fill="#0a0a0a" />
            <rect x="200" y="165" width="25" height="35" fill="#0a0a0a" />
            {/* Window glow */}
            <rect
              x="160"
              y="170"
              width="15"
              height="22"
              fill="#f97316"
              opacity="0.2"
              className="animate-window-flicker"
            />
            <rect
              x="205"
              y="170"
              width="15"
              height="22"
              fill="#f97316"
              opacity="0.15"
              className="animate-window-flicker"
              style={{ animationDelay: "1.5s" }}
            />
            {/* Roof */}
            <path d="M130 155 L190 90 L250 155" fill="#0a0a0a" />
            {/* Chimney */}
            <rect x="215" y="105" width="15" height="40" fill="#0d0d0d" />
            {/* Door */}
            <rect x="175" y="190" width="25" height="30" fill="#080808" />
            <circle cx="195" cy="205" r="2" fill="#888" />
          </g>

          {/* ==================== TOMBSTONES ==================== */}

          {/* Tombstone 1 - RIP API v1 */}
          <g className="animate-sway" style={{ transformOrigin: "340px 220px", animationDuration: "6s" }}>
            <path
              d="M305 220 L305 120 Q305 85 340 85 Q375 85 375 120 L375 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text
              x="340"
              y="115"
              textAnchor="middle"
              fill="#22c55e"
              fontSize="16"
              fontWeight="bold"
              className="animate-pulse"
            >
              RIP
            </text>
            <text x="340" y="140" textAnchor="middle" fill="#4a5568" fontSize="12">
              API v1
            </text>
            <text x="340" y="165" textAnchor="middle" fill="#4a5568" fontSize="10">
              2010-2024
            </text>
          </g>

          {/* Tombstone 2 - SOAP 2.0 (cross shape) */}
          <g>
            <path d="M460 220 L460 155 L490 115 L520 155 L520 220" fill="#1a1a2e" stroke="#2d2d4a" strokeWidth="2" />
            <path d="M490 130 L490 200 M472 155 L508 155" stroke="#a855f7" strokeWidth="4" className="animate-pulse" />
            <text x="490" y="215" textAnchor="middle" fill="#4a5568" fontSize="9">
              SOAP 2.0
            </text>
          </g>

          {/* Tombstone 3 - XML (larger) */}
          <g className="animate-sway" style={{ transformOrigin: "620px 220px", animationDuration: "5s" }}>
            <path
              d="M580 220 L580 95 Q580 60 620 60 Q660 60 660 95 L660 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="620" y="100" textAnchor="middle" fill="#f97316" fontSize="14" className="animate-pulse">
              &lt;XML/&gt;
            </text>
            <text x="620" y="125" textAnchor="middle" fill="#4a5568" fontSize="11">
              Legacy
            </text>
            <text x="620" y="150" textAnchor="middle" fill="#6b7280" fontSize="9">
              1998-2015
            </text>
          </g>

          {/* Tombstone 4 - COBOL */}
          <g className="animate-sway" style={{ transformOrigin: "760px 220px", animationDuration: "7s" }}>
            <path
              d="M720 220 L720 170 Q720 148 760 148 Q800 148 800 170 L800 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="760" y="188" textAnchor="middle" fill="#22c55e" fontSize="11" className="animate-pulse">
              COBOL
            </text>
            <text x="760" y="208" textAnchor="middle" fill="#4a5568" fontSize="8">
              Forever Zombie
            </text>
          </g>

          {/* CASKET - MONOLITH */}
          <g>
            <path
              d="M870 220 L895 185 L1035 185 L1060 220 L1060 255 L1048 260 L902 260 L890 255 Z"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="965" y="218" textAnchor="middle" fill="#22c55e" fontSize="13" className="animate-pulse">
              MONOLITH
            </text>
            <ellipse cx="965" cy="215" rx="55" ry="28" fill="rgba(34,197,94,0.08)" className="animate-pulse" />
          </g>

          {/* Tombstone 5 - jQuery */}
          <g className="animate-sway" style={{ transformOrigin: "1140px 220px", animationDuration: "5.5s" }}>
            <path
              d="M1100 220 L1100 105 Q1100 70 1140 70 Q1180 70 1180 105 L1180 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1140" y="110" textAnchor="middle" fill="#22c55e" fontSize="12" className="animate-pulse">
              jQuery
            </text>
            <text x="1140" y="135" textAnchor="middle" fill="#4a5568" fontSize="10">
              $().RIP()
            </text>
            <text x="1140" y="160" textAnchor="middle" fill="#6b7280" fontSize="9">
              2006-2020
            </text>
          </g>

          {/* Tombstone 6 - Flash */}
          <g className="animate-sway" style={{ transformOrigin: "1290px 220px", animationDuration: "6s" }}>
            <path
              d="M1250 220 L1250 85 Q1250 50 1290 50 Q1330 50 1330 85 L1330 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1290" y="90" textAnchor="middle" fill="#f97316" fontSize="18" className="animate-pulse">
              ⚡
            </text>
            <text x="1290" y="120" textAnchor="middle" fill="#f97316" fontSize="14">
              Flash
            </text>
            <text x="1290" y="150" textAnchor="middle" fill="#6b7280" fontSize="9">
              1996-2020
            </text>
          </g>

          {/* Tombstone 7 - IE */}
          <g>
            <path
              d="M1400 220 L1400 175 Q1400 155 1435 155 Q1470 155 1470 175 L1470 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1435" y="193" textAnchor="middle" fill="#3b82f6" fontSize="12" className="animate-pulse">
              IE
            </text>
            <text x="1435" y="212" textAnchor="middle" fill="#4a5568" fontSize="8">
              1995-2022
            </text>
          </g>

          {/* Tombstone 8 - FTP */}
          <g>
            <path
              d="M1530 220 L1530 175 L1560 145 L1590 175 L1590 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1560" y="200" textAnchor="middle" fill="#a855f7" fontSize="10" className="animate-pulse">
              FTP
            </text>
          </g>

          {/* Tombstone 9 - CGI-BIN */}
          <g className="animate-sway" style={{ transformOrigin: "1700px 220px", animationDuration: "5s" }}>
            <path
              d="M1660 220 L1660 135 Q1660 105 1700 105 Q1740 105 1740 135 L1740 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1700" y="145" textAnchor="middle" fill="#f97316" fontSize="10" className="animate-pulse">
              CGI-BIN
            </text>
            <text x="1700" y="170" textAnchor="middle" fill="#4a5568" fontSize="9">
              Scripts
            </text>
          </g>

          {/* Tombstone 10 - Perl */}
          <g>
            <path
              d="M1810 220 L1810 180 Q1810 162 1845 162 Q1880 162 1880 180 L1880 220"
              fill="#1a1a2e"
              stroke="#2d2d4a"
              strokeWidth="2"
            />
            <text x="1845" y="200" textAnchor="middle" fill="#22c55e" fontSize="10" className="animate-pulse">
              Perl
            </text>
          </g>

          {/* ==================== PUMPKINS ==================== */}

          {/* Pumpkin 1 - near first tombstone */}
          <g transform="translate(290, 185)">
            <ellipse cx="0" cy="18" rx="24" ry="20" fill="#ea580c" />
            <ellipse cx="-10" cy="18" rx="12" ry="18" fill="#dc2626" opacity="0.25" />
            <ellipse cx="10" cy="18" rx="12" ry="18" fill="#f97316" opacity="0.3" />
            <path d="M0 0 Q6 -12 0 -18" stroke="#166534" strokeWidth="4" fill="none" />
            <ellipse cx="-9" cy="14" rx="5" ry="6" fill="#000" />
            <ellipse cx="9" cy="14" rx="5" ry="6" fill="#000" />
            <path d="M-7 26 Q0 34 7 26" stroke="#000" strokeWidth="2.5" fill="none" />
            {/* Inner glow */}
            <ellipse cx="-9" cy="14" rx="2.5" ry="3" fill="#fbbf24" className="animate-flicker" />
            <ellipse cx="9" cy="14" rx="2.5" ry="3" fill="#fbbf24" className="animate-flicker" />
          </g>

          {/* Pumpkin 2 - smaller, near IE */}
          <g transform="translate(1485, 192)">
            <ellipse cx="0" cy="14" rx="18" ry="15" fill="#c2410c" />
            <path d="M0 0 Q4 -10 0 -14" stroke="#166534" strokeWidth="3" fill="none" />
            <ellipse cx="-6" cy="11" rx="4" ry="5" fill="#000" />
            <ellipse cx="6" cy="11" rx="4" ry="5" fill="#000" />
            <path d="M-5 20 Q0 25 5 20" stroke="#000" strokeWidth="2" fill="none" />
            <ellipse
              cx="-6"
              cy="11"
              rx="2"
              ry="2.5"
              fill="#fbbf24"
              className="animate-flicker"
              style={{ animationDelay: "0.5s" }}
            />
            <ellipse
              cx="6"
              cy="11"
              rx="2"
              ry="2.5"
              fill="#fbbf24"
              className="animate-flicker"
              style={{ animationDelay: "0.5s" }}
            />
          </g>

          {/* ==================== CAULDRON ==================== */}
          <g transform="translate(580, 195)">
            <ellipse cx="0" cy="35" rx="35" ry="8" fill="#0a0a0a" />
            <path
              d="M-32 10 Q-40 22 -32 40 L32 40 Q40 22 32 10 Q18 0 0 0 Q-18 0 -32 10"
              fill="#1f2937"
              stroke="#374151"
              strokeWidth="2"
            />
            <ellipse cx="0" cy="5" rx="28" ry="10" fill="#22c55e" opacity="0.6" />
            {/* Bubbles */}
            <circle cx="-10" cy="0" r="5" fill="#22c55e" opacity="0.5" className="animate-bubble" />
            <circle
              cx="8"
              cy="-4"
              r="4"
              fill="#4ade80"
              opacity="0.4"
              className="animate-bubble"
              style={{ animationDelay: "0.6s" }}
            />
            <circle
              cx="-3"
              cy="-6"
              r="4.5"
              fill="#22c55e"
              opacity="0.6"
              className="animate-bubble"
              style={{ animationDelay: "1.2s" }}
            />
            <circle
              cx="12"
              cy="0"
              r="3"
              fill="#86efac"
              opacity="0.4"
              className="animate-bubble"
              style={{ animationDelay: "1.8s" }}
            />
          </g>

          {/* ==================== CANDLES ==================== */}
          <g transform="translate(850, 170)">
            <rect x="-6" y="12" width="12" height="30" fill="#fef3c7" />
            <ellipse cx="0" cy="12" rx="6" ry="2.5" fill="#fef3c7" />
            <ellipse cx="0" cy="6" rx="5" ry="10" fill="#fbbf24" className="animate-flicker" />
            <ellipse cx="0" cy="2" rx="2.5" ry="5" fill="#fef3c7" className="animate-flicker" />
          </g>
          <g transform="translate(875, 175)">
            <rect x="-5" y="10" width="10" height="24" fill="#fef3c7" />
            <ellipse cx="0" cy="10" rx="5" ry="2" fill="#fef3c7" />
            <ellipse
              cx="0"
              cy="4"
              rx="4"
              ry="8"
              fill="#f97316"
              className="animate-flicker"
              style={{ animationDelay: "0.35s" }}
            />
          </g>
        </svg>
      </div>

      {/* ==================== FLOATING PARTICLES/SOULS ==================== */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-up"
            style={{
              width: `${3 + Math.random() * 6}px`,
              height: `${3 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 35}%`,
              background: i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#a855f7" : "#f97316",
              opacity: 0.35,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* ==================== FOG LAYERS ==================== */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-green-950/30 via-purple-950/15 to-transparent" />
      <div
        className="absolute bottom-12 left-0 w-[200%] h-20 animate-fog-drift opacity-25"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent, rgba(168,85,247,0.2), transparent)",
        }}
      />
      <div
        className="absolute bottom-6 left-0 w-[200%] h-16 animate-fog-drift opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent, rgba(34,197,94,0.15), transparent)",
          animationDelay: "5s",
          animationDuration: "30s",
        }}
      />
    </div>
  )
}
