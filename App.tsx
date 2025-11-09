import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import SdkPage from './components/SdkPage';
import AuthPage from './components/AuthPage';
import ApiKeyPage from './components/ApiKeyPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import DocsPage from './components/DocsPage';
import NeuralNetworkPage from './components/NeuralNetworkPage';
import CareersPage from './components/CareersPage';
import ResearchPage from './components/ResearchPage';
import { GraphHomePage } from './components/GraphHome/GraphHomePage';
import GeneralArchitecturePage from './components/GeneralArchitecturePage';
import Loader from './components/Loader';
import { useAuth } from './contexts/AuthContext';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'sdk' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research' | 'graph';

const getPageFromHash = (): Page => {
  const hash = window.location.hash.substring(1).split('?')[0];
  if (!hash) {
    return 'landing';
  }
  const validPages: Page[] = ['landing', 'auth', 'app', 'contact', 'about', 'sdk', 'apiKey', 'privacy', 'terms', 'docs', 'neuralNetwork', 'careers', 'research', 'graph'];
  if (validPages.includes(hash as Page)) {
    return hash as Page;
  }
  return 'landing';
};


const App: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page | null>(null);

  // State to reactively track the URL hash.
  const [hash, setHash] = useState(() => window.location.hash);

  // Effect to keep the `hash` state in sync with the browser's URL.
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const onNavigate = useCallback((targetPage: Page) => {
    const currentHashPage = getPageFromHash();
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
    
    const currentPage = getPageFromHash();

    // --- 3. PERSISTENT REDIRECT RULES ---
    if (currentUser && currentPage === 'auth') {
      onNavigate('app');
      return;
    }
    
    const isProtectedPage = currentPage === 'app' || currentPage === 'neuralNetwork' || currentPage === 'graph';
    if (!currentUser && isProtectedPage) {
      onNavigate('landing');
      return;
    }

    // --- 4. PAGE RESOLUTION ---
    setPage(currentPage);

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
  if (page === 'landing') {
    return <LandingPage onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page === 'auth') {
    return <AuthPage onBack={() => onNavigate('landing')} />;
  }
  if (page === 'contact') {
    return <ContactPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'about') {
    return <AboutPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page === 'sdk') {
    return <SdkPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'apiKey') {
    return <ApiKeyPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page === 'privacy') {
    return <PrivacyPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'terms') {
    return <TermsPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'docs') {
    return <DocsPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigateToSdk={() => onNavigate('sdk')} onNavigate={onNavigate} />;
  }
  if (page === 'neuralNetwork') {
    return <NeuralNetworkPage onNavigate={onNavigate} />;
  }
  if (page === 'careers') {
    return <CareersPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'research') {
    return <ResearchPage onBack={() => onNavigate('landing')} onNavigate={onNavigate} />;
  }
  if (page === 'graph') {
    return <GraphHomePage onNavigate={onNavigate} />;
  }
  if (page === 'app') {
    return <GeneralArchitecturePage onNavigate={onNavigate} />;
  }

  // Fallback for unknown pages
  return <LandingPage onLaunch={() => onNavigate('auth')} onNavigate={onNavigate} />;
};

export default App;