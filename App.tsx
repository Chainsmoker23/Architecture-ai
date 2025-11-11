import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import ApiPricingPage from './components/ApiPricingPage';
import AuthPage from './components/AuthPage';
import ApiKeyPage from './components/ApiKeyPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import DocsPage from './components/DocsPage';
import NeuralNetworkPage from './components/NeuralNetworkPage';
import CareersPage from './components/CareersPage';
import ResearchPage from './components/ResearchPage';
import GeneralArchitecturePage from './components/GeneralArchitecturePage';
import Loader from './components/Loader';
import { useAuth } from './contexts/AuthContext';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'api' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research';

const getPageFromHash = (): { page: Page; subpage?: string } => {
  const hash = window.location.hash.substring(1).split('?')[0];
  if (!hash) {
    return { page: 'landing' };
  }
  const [mainPage, subpage] = hash.split('/');
  const validPages: Page[] = ['landing', 'auth', 'app', 'contact', 'about', 'api', 'apiKey', 'privacy', 'terms', 'docs', 'neuralNetwork', 'careers', 'research'];
  if (validPages.includes(mainPage as Page)) {
    return { page: mainPage as Page, subpage };
  }
  return { page: 'landing' };
};


const App: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [page, setPage] = useState<{ page: Page; subpage?: string } | null>(null);

  // State to reactively track the URL hash.
  const [hash, setHash] = useState(() => window.location.hash);

  // Effect to keep the `hash` state in sync with the browser's URL.
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const onNavigate = useCallback((targetPage: Page | string) => {
    const currentHashPage = window.location.hash.substring(1).split('?')[0];
    if (currentHashPage !== targetPage) {
        window.scrollTo(0, 0);
        window.location.hash = targetPage;
    }
  }, []);

  useEffect(() => {
    // 1. Wait until authentication status is known.
    if (authLoading) {
      return;
    }

    // --- 2. INITIAL LOAD REDIRECT ---
    if (currentUser && window.location.hash === '') {
        onNavigate('app');
        return; 
    }
    
    const currentPageInfo = getPageFromHash();

    // --- 3. PERSISTENT REDIRECT RULES ---
    if (currentUser && currentPageInfo.page === 'auth') {
      onNavigate('app');
      return;
    }
    
    const isProtectedPage = ['app', 'neuralNetwork', 'apiKey'].includes(currentPageInfo.page);
    if (!currentUser && isProtectedPage) {
      onNavigate('landing');
      return;
    }

    // --- 4. PAGE RESOLUTION ---
    setPage(currentPageInfo);

  }, [authLoading, currentUser, onNavigate, hash]);

  
  // A single, unified loader for initial auth check and any in-progress redirects.
  if (page === null) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  // --- Page rendering logic ---
  if (page.page === 'landing') {
    return <LandingPage onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page.page === 'auth') {
    return <AuthPage onBack={() => onNavigate('landing')} />;
  }
  if (page.page === 'contact') {
    return <ContactPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page.page === 'about') {
    return <AboutPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page.page === 'api') {
    return <ApiPricingPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page.page === 'apiKey') {
    return <ApiKeyPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page.page === 'privacy') {
    return <PrivacyPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page.page === 'terms') {
    return <TermsPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page.page === 'docs') {
    return <DocsPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigateToApi={() => onNavigate('api')} onNavigate={onNavigate} />;
  }
  if (page.page === 'neuralNetwork') {
    return <NeuralNetworkPage onNavigate={onNavigate} />;
  }
  if (page.page === 'careers') {
    return <CareersPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page.page === 'research') {
    return <ResearchPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page.page === 'app') {
    return <GeneralArchitecturePage onNavigate={onNavigate} />;
  }

  // Fallback for unknown pages
  return <LandingPage onLaunch={() => onNavigate('auth')} onNavigate={onNavigate} />;
};

export default App;