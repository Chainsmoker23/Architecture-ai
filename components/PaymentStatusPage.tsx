import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { verifyPaymentStatus, recoverPaymentByPaymentId } from '../services/geminiService';
import Loader from './Loader';
import Logo from './Logo';

type Page = 'api' | 'app';
interface PaymentStatusPageProps {
  onNavigate: (page: Page) => void;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({ onNavigate }) => {
  const { pollForPlanUpdate, refreshUser } = useAuth();
  const [status, setStatus] = useState<'polling' | 'success' | 'failed'>('polling');
  const [planName, setPlanName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runVerification = useCallback(async () => {
    setStatus('polling');
    setErrorMessage(null);
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const targetPage = 'app'; // Always navigate to the app after purchase

    const localPlanName = hashParams.get('plan');
    const subId = hashParams.get('sub_id');
    const paymentId = searchParams.get('payment_id');
    
    setPlanName(localPlanName);

    const handleSuccess = ( verificationMethod: string) => {
      console.log(`[PaymentStatus] Success via ${verificationMethod}.`);
      setStatus('success');
      // Clean the URL only on success
      window.history.replaceState({}, document.title, window.location.pathname + '#app');
      setTimeout(() => onNavigate(targetPage), 3500); // Increased delay for celebration
    };

    // 1. Recovery Flow (for old URLs with payment_id)
    if (paymentId) {
      console.log(`[PaymentStatus] Attempting recovery for payment_id: ${paymentId}...`);
      const result = await recoverPaymentByPaymentId(paymentId);
      if (result.success) {
        await refreshUser();
        handleSuccess('Recovery Endpoint');
        return;
      }
      console.warn(`[PaymentStatus] Recovery failed: ${result.message}. Proceeding to next check.`);
    }

    // 2. Proactive Verification (new standard flow with sub_id)
    if (subId) {
      console.log(`[PaymentStatus] Proactively verifying subscription ${subId}...`);
      const result = await verifyPaymentStatus(subId);
      if (result.success) {
        await refreshUser();
        handleSuccess('Verification Endpoint');
        return;
      }
      console.warn(`[PaymentStatus] Verification not yet confirmed: ${result.message}. Falling back to polling.`);
    }

    // 3. Polling Fallback (for webhook delays)
    if (localPlanName) {
      console.log(`[PaymentStatus] Falling back to polling for plan: ${localPlanName}`);
      const pollSuccess = await pollForPlanUpdate(localPlanName);
      if (pollSuccess) {
        handleSuccess('Polling');
        return;
      }
    }

    // 4. If all checks fail, set to failed state.
    console.error("[PaymentStatus] All verification methods failed or no valid parameters found.");
    setErrorMessage('This can sometimes happen if the confirmation from the payment provider is delayed.');
    setStatus('failed');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    runVerification();
  }, [runVerification]);

  const messages = {
    polling: 'Finalizing your upgrade... Please wait.',
    success: 'Upgrade Complete! Welcome aboard!',
    failed: 'There was a problem confirming your upgrade.'
  };

  const successSubMessages: { [key: string]: string } = {
    hobbyist: "Your generation count has been reset. Happy designing!",
    pro: "You now have unlimited access. You will be redirected shortly."
  };

  const confettiPieces = useMemo(() => {
    if (status !== 'success') return [];
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        backgroundColor: ['#f472b6', '#ec4899', '#d946ef', '#a855f7'][Math.floor(Math.random() * 4)],
        animation: `confetti-fall ${Math.random() * 2 + 3}s linear ${Math.random() * 2}s forwards`,
      },
    }));
  }, [status]);

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50 overflow-hidden">
      {status === 'success' && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {confettiPieces.map(p => (
            <div key={p.id} className="absolute top-0 w-2.5 h-2.5 opacity-0" style={p.style} />
          ))}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 relative z-10 max-w-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Logo className="h-10 w-10 text-[#D6336C]" />
          <h3 className="text-2xl font-bold">Cube<span className="text-[#D6336C]">Gen</span> AI</h3>
        </div>
        
        {status === 'polling' && <Loader />}
        
        <p className="mt-4 text-gray-600 font-medium text-lg">{messages[status]}</p>

        {status === 'success' && planName && (
           <p className="mt-2 text-gray-500 text-sm">{successSubMessages[planName] || 'You will be redirected shortly.'}</p>
        )}
        
        {status === 'failed' && (
          <>
            <p className="mt-2 text-gray-500 text-sm">{errorMessage || 'Please click "Try Again" or contact support if this issue persists.'}</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={runVerification}
                className="w-full sm:w-auto bg-[#D6336C] text-white font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => onNavigate('app')}
                className="w-full sm:w-auto bg-[#F9D7E3] text-[#A61E4D] font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Go to App
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentStatusPage;