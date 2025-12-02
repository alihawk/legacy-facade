"use client"

import { useNavigate } from "react-router-dom"
import { ArrowRight, Globe, FileCode, Zap, Shield, Clock, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SpookyBackground from "@/components/SpookyBackground"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative">
      <SpookyBackground />

      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Animated skull logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <svg viewBox="0 0 80 100" className="w-24 h-28 relative z-10 ghost-float">
                <defs>
                  <linearGradient id="landingSkullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f0f0f0" />
                    <stop offset="100%" stopColor="#a0a0a0" />
                  </linearGradient>
                </defs>
                <ellipse cx="40" cy="38" rx="32" ry="35" fill="url(#landingSkullGradient)" />
                <ellipse cx="27" cy="35" rx="9" ry="11" fill="#0a0a0a" />
                <ellipse cx="53" cy="35" rx="9" ry="11" fill="#0a0a0a" />
                <ellipse cx="27" cy="35" rx="5" ry="6" fill="#22c55e" className="animate-pulse" />
                <ellipse cx="53" cy="35" rx="5" ry="6" fill="#22c55e" className="animate-pulse" />
                <path d="M36 48 L40 60 L44 48" fill="#1a1a1a" />
                <rect x="26" y="68" width="6" height="10" rx="1" fill="#d0d0d0" />
                <rect x="34" y="68" width="6" height="12" rx="1" fill="#d0d0d0" />
                <rect x="42" y="68" width="6" height="12" rx="1" fill="#d0d0d0" />
                <rect x="50" y="68" width="6" height="10" rx="1" fill="#d0d0d0" />
              </svg>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #22c55e 0%, #4ade80 50%, #22c55e 100%)" }}
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
          </div>

          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
            Resurrect your dead APIs with modern, beautiful UIs.
          </p>
          <p className="text-lg text-cyan-400 font-medium">
            No backend changes required. Works with REST & SOAP APIs.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { icon: Zap, text: "Instant UI Generation" },
            { icon: Shield, text: "Zero Backend Changes" },
            { icon: Clock, text: "Minutes, Not Months" },
            { icon: Sparkles, text: "LLM-Powered Inference" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full text-gray-300"
            >
              <Icon className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>

        {/* API Type Selection */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">What type of API are you reviving?</h2>
          <p className="text-gray-400">Select your API type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* REST API Card */}
          <Card
            className="group bg-slate-900/90 backdrop-blur-sm border-cyan-500/30 shadow-2xl hover:border-cyan-500/60 transition-all duration-500 cursor-pointer hover:shadow-cyan-500/20 hover:shadow-2xl hover:-translate-y-2"
            onClick={() => navigate("/analyze/rest")}
          >
            <CardContent className="p-8 h-full flex flex-col">
              <div className="flex flex-col items-center text-center flex-grow">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative p-5 bg-gradient-to-br from-cyan-600/30 to-green-500/10 rounded-2xl border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors">
                    <Globe className="w-12 h-12 text-cyan-400" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  REST API
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                  Modern JSON-based APIs with OpenAPI/Swagger specs, direct endpoints, or JSON samples.
                </p>

                {/* Supported Inputs */}
                <div className="space-y-2 mb-4 w-full">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Supported Inputs</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["OpenAPI Spec", "Swagger URL", "Live Endpoint", "JSON Sample"].map((input) => (
                      <span
                        key={input}
                        className="text-xs px-3 py-1.5 bg-slate-800 text-gray-300 rounded-full border border-slate-700"
                      >
                        {input}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button - Always at bottom */}
              <Button className="w-full text-white necro-button group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all mt-auto">
                <span>Revive REST API</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* SOAP API Card */}
          <Card
            className="group bg-slate-900/90 backdrop-blur-sm border-purple-500/30 shadow-2xl hover:border-purple-500/60 transition-all duration-500 cursor-pointer hover:shadow-purple-500/20 hover:shadow-2xl hover:-translate-y-2"
            onClick={() => navigate("/analyze/soap")}
          >
            <CardContent className="p-8 h-full flex flex-col">
              <div className="flex flex-col items-center text-center flex-grow">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative p-5 bg-gradient-to-br from-purple-600/30 to-purple-500/10 rounded-2xl border border-purple-500/30 group-hover:border-purple-500/50 transition-colors">
                    <FileCode className="w-12 h-12 text-purple-400" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                  SOAP API
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-4 leading-relaxed text-sm">
                  Enterprise XML-based services with WSDL definitions. Common in banking, healthcare, and ERP systems.
                </p>

                {/* Supported Inputs */}
                <div className="space-y-2 mb-4 w-full">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Supported Inputs</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["WSDL File", "WSDL URL", "SOAP Endpoint", "XML Sample"].map((input) => (
                      <span
                        key={input}
                        className="text-xs px-3 py-1.5 bg-slate-800 text-gray-300 rounded-full border border-slate-700"
                      >
                        {input}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button - Always at bottom */}
              <Button className="w-full text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all mt-auto">
                <span>Revive SOAP API</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Built for <span className="text-cyan-400 font-semibold">Kiroween 2025</span> • Powered by{" "}
            <span className="text-purple-400 font-semibold">Kiro AI</span>
          </p>
        </div>
      </div>
    </div>
  )
}