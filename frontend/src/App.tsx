"use client"

import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SchemaProvider } from "./context/SchemaContext"
import ResurrectorIntro from "./components/ResurrectorIntro"
import LandingPage from "./pages/LandingPage"
import AnalyzerPage from "./pages/AnalyzerPage"
import SOAPAnalyzerPage from "./pages/SOAPAnalyzerPage"
import PortalPage from "./pages/PortalPage"
import { SchemaReviewStep } from "./components/SchemaReview"
import { UICustomizationStep } from "./components/UICustomization"

export default function App() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    // Check if intro was already shown this session
    const introShown = sessionStorage.getItem("intro-shown")
    if (introShown) {
      setShowIntro(false)
    }
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem("intro-shown", "true")
    setShowIntro(false)
  }

  if (showIntro) {
    return <ResurrectorIntro onComplete={handleIntroComplete} />
  }

  return (
    <BrowserRouter>
      <SchemaProvider>
        <Routes>
          {/* Landing page - API type selection (REST vs SOAP) */}
          <Route path="/" element={<LandingPage />} />

          {/* REST API Analyzer */}
          <Route path="/analyze/rest" element={<AnalyzerPage />} />

          {/* SOAP API Analyzer */}
          <Route path="/analyze/soap" element={<SOAPAnalyzerPage />} />

          {/* Legacy route - redirect to landing */}
          <Route path="/analyze" element={<Navigate to="/" replace />} />

          {/* Schema Review & Customization Flow */}
          <Route path="/review" element={<SchemaReviewStep />} />
          <Route path="/customize" element={<UICustomizationStep />} />

          {/* Portal routes */}
          <Route path="/portal/*" element={<PortalPage />} />

          {/* Catch-all redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SchemaProvider>
    </BrowserRouter>
  )
}