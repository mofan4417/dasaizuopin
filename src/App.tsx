import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import WhatWeDo from "./pages/WhatWeDo";
import ServiceObjects from "./pages/ServiceObjects";
import ServiceResults from "./pages/ServiceResults";
import JoinUs from "./pages/JoinUs";
import AboutUs from "./pages/AboutUs";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitObject from "./pages/SubmitObject";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DataDashboardPage from "./pages/DataDashboardPage";
import VolunteerCenter from "./pages/VolunteerCenter";
import GameStats from "./components/gamification/GameStats";
import GameNotification from "./components/gamification/GameNotification";
import ParticleBackground from "./components/visual/ParticleBackground";

import { useTranslation } from 'react-i18next';
import { useEffect, useLayoutEffect } from 'react';

function RouteStateReset() {
  const location = useLocation();

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };

    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
      requestAnimationFrame(resetScroll);
    });

    if (location.pathname !== '/') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [location.pathname]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = previous;
      };
    }
  }, []);

  return null;
}



export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteStateReset />
      <ParticleBackground />
      <GameStats />
      <GameNotification />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/service-objects" element={<ServiceObjects />} />
        <Route path="/service-results" element={<ServiceResults />} />
        <Route path="/join-us" element={<JoinUs />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/submit-object" element={<SubmitObject />} />
        <Route path="/data-dashboard" element={<DataDashboardPage />} />
        <Route path="/volunteer-center" element={<VolunteerCenter />} />
      </Routes>
    </BrowserRouter>
  );
}
