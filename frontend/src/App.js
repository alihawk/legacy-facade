"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SchemaProvider } from "./context/SchemaContext";
import ResurrectorIntro from "./components/ResurrectorIntro";
import LandingPage from "./pages/LandingPage";
import AnalyzerPage from "./pages/AnalyzerPage";
import SOAPAnalyzerPage from "./pages/SOAPAnalyzerPage";
import PortalPage from "./pages/PortalPage";
import { SchemaReviewStep } from "./components/SchemaReview";
import { UICustomizationStep } from "./components/UICustomization";
export default function App() {
    const [showIntro, setShowIntro] = useState(true);
    useEffect(() => {
        // Check if intro was already shown this session
        const introShown = sessionStorage.getItem("intro-shown");
        if (introShown) {
            setShowIntro(false);
        }
    }, []);
    const handleIntroComplete = () => {
        sessionStorage.setItem("intro-shown", "true");
        setShowIntro(false);
    };
    if (showIntro) {
        return _jsx(ResurrectorIntro, { onComplete: handleIntroComplete });
    }
    return (_jsx(BrowserRouter, { children: _jsx(SchemaProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/analyze/rest", element: _jsx(AnalyzerPage, {}) }), _jsx(Route, { path: "/analyze/soap", element: _jsx(SOAPAnalyzerPage, {}) }), _jsx(Route, { path: "/analyze", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/review", element: _jsx(SchemaReviewStep, {}) }), _jsx(Route, { path: "/customize", element: _jsx(UICustomizationStep, {}) }), _jsx(Route, { path: "/portal/*", element: _jsx(PortalPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }));
}
