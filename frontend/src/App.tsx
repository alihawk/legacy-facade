"use client"

import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ResurrectorIntro from "./components/ResurrectorIntro"
import AnalyzerPage from "./pages/AnalyzerPage"
import PortalPage from "./pages/PortalPage"

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
      <Routes>
        <Route path="/" element={<AnalyzerPage />} />
        <Route path="/portal/*" element={<PortalPage />} />
      </Routes>
    </BrowserRouter>
  )
}
