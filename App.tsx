import React, { useState, useCallback, useEffect } from 'react';
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
import AdminPage from './components/AdminPage';
import AdminLoginPage from './components/AdminLoginPage';
import Loader from './components/Loader';
import PaymentStatusPage from './components/PaymentStatusPage'; // Import the new component
import SdkPage from './components/SdkPage';
import { useAuth } from './contexts/AuthContext';
import { useAdminAuth } from './contexts/AdminAuthContext';

type Page = 'landing' | 'auth' | 'app' | 'contact' | 'about' | 'api' | 'apiKey' | 'privacy' | 'terms' | 'docs' | 'neuralNetwork' | 'careers' | 'research' | 'admin' | 'adminLogin' | 'sdk';

const getPageFromHash = (): { page: Page; subpage?: string } => {
  const hash = window.location.hash.substring(1).split('?')[0];
  if (!hash) {
    return { page: 'landing' };
  }
  const [mainPage, subpage] = hash.split('/');
  const validPages: Page[] = ['landing', 'auth', 'app', 'contact', 'about', 'api', 'apiKey', 'privacy', 'terms', 'docs', 'neuralNetwork', 'careers', 'research', 'admin', 'adminLogin', 'sdk'];
  if (validPages.includes(mainPage as Page)) {
    return { page: mainPage as Page, subpage };
  }
  return { page: 'landing' };
};


const App: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { isAdminAuthenticated, loading: adminAuthLoading } = useAdminAuth();
  const [page, setPage] = useState<{ page: Page; subpage?: string } | null>(null);

  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const onNavigate = useCallback((targetPage: Page | string) => {
    const newHash = `#${targetPage}`;
    // Only navigate if the target hash is different from the current one.
    // This handles clearing query parameters correctly, e.g., from '#api?payment=success' to '#api'.
    if (window.location.hash !== newHash) {
        window.scrollTo(0, 0);
        window.location.hash = newHash;
    }
  }, []);

  useEffect(() => {
    if (authLoading || adminAuthLoading) return;

    const currentPageInfo = getPageFromHash();
    
    // --- Admin Route Handling (Highest Priority) ---
    if (currentPageInfo.page === 'admin' || currentPageInfo.page === 'adminLogin') {
        const targetPage = isAdminAuthenticated ? 'admin' : 'adminLogin';
        
        // If we are on the right page, set the state to render it.
        // Otherwise, navigate, which will re-trigger this effect.
        if (currentPageInfo.page === targetPage) {
            setPage({ page: targetPage });
        } else {
            onNavigate(targetPage);
        }
        return; // IMPORTANT: Prevent other logic from running for admin routes.
    }
    
    // --- General Redirect Rules for Regular Users ---
    if (currentUser && currentPageInfo.page === 'auth') {
      onNavigate('app');
      return;
    }
    
    const isProtectedPage = ['app', 'neuralNetwork', 'apiKey'].includes(currentPageInfo.page);
    if (!currentUser && isProtectedPage) {
      onNavigate('landing');
      return;
    }
    
    // If no other rules matched, render the page from the hash.
    setPage(currentPageInfo);

  }, [authLoading, adminAuthLoading, currentUser, isAdminAuthenticated, onNavigate, hash]);

  
  if (page === null || authLoading || adminAuthLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  // --- Page rendering logic ---
  const hashParams = new URLSearchParams(hash.split('?')[1]);
  if (page.page === 'api' && hashParams.get('payment') === 'success') {
    return <PaymentStatusPage onNavigate={onNavigate} />;
  }
  
  if (page.page === 'landing') {
    return <LandingPage onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page.page === 'auth') {
    return <AuthPage onBack={() => onNavigate('landing')} />;
  }
  if (page.page === 'admin') {
    return <AdminPage onNavigate={onNavigate} />;
  }
  if (page.page === 'adminLogin') {
    return <AdminLoginPage onBack={() => onNavigate('landing')} />;
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
  if (page.page === 'sdk') {
    return <SdkPage onBack={() => onNavigate('landing')} onLaunch={() => onNavigate(currentUser ? 'app' : 'auth')} onNavigate={onNavigate} />;
  }
  if (page.page === 'app') {
    return <GeneralArchitecturePage onNavigate={onNavigate} />;
  }

  return <LandingPage onLaunch={() => onNavigate('auth')} onNavigate={onNavigate} />;
};

export default App;