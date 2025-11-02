import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeProvider';
import { StackProvider, StackClientApp } from '@stackframe/react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// This function tells Stack Auth how to navigate within our SPA.
// It changes the URL hash, which our App.tsx component listens to.
const navigateForStackAuth = (path: string) => {
  // path will be like '/handler/google' or '/app'
  window.location.hash = path.startsWith('/') ? `#${path}` : `#/${path}`;
};

// FIX: Moved appearance object here to apply styles globally via StackClientApp.
// Custom appearance for Stack Auth components.
const appearance = {
  elements: {
    button__primary: 'stack-auth-button-primary',
    input: 'stack-auth-input',
  },
  variables: {
    colorPrimary: '#D6336C',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F8F1F3',
    colorInputBorder: '#E8DCE0',
    borderRadius: '12px',
    colorText: '#333333',
    colorTextSecondary: '#555555',
  },
};


// Update StackClientApp initialization with the new project credentials
const stackApp = new StackClientApp({
  projectId: "87702f48-b205-4934-b3a3-1991f96cb391",
  publishableClientKey: "pck_kf7rr25pksrgr30rbmgmybsjxpj6nzsx34n083w302zd0",
  tokenStore: "cookie",
  redirectMethod: {
    useNavigate: () => navigateForStackAuth,
  },
  appearance: appearance,
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StackProvider app={stackApp}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StackProvider>
  </React.StrictMode>
);
