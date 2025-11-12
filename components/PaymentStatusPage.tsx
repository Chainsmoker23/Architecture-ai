import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';
import Logo from './Logo';

type Page = 'api';
interface PaymentStatusPageProps {
  onNavigate: (page: Page) => void;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({ onNavigate }) => {
  const { pollForPlanUpdate } = useAuth();
  const [status, setStatus] = useState<'polling' | 'success' | 'failed'>('polling');

  useEffect(() => {
    const checkPayment = async () => {
      const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const planName = hashParams.get('plan');

      if (!planName) {
        console.error("PaymentStatusPage: 'plan' parameter missing from URL.");
        setStatus('failed');
        return;
      }
      
      const success = await pollForPlanUpdate(planName);

      if (success) {
        setStatus('success');
        setTimeout(() => {
          onNavigate('api');
        }, 2000);
      } else {
        setStatus('failed');
      }
    };

    checkPayment();
    // This effect should only run once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = {
    polling: 'Finalizing your upgrade... Please wait.',
    success: 'Upgrade successful! Redirecting...',
    failed: 'There was a problem confirming your upgrade. Please check your account or contact support.'
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-10 w-10 text-[#D6336C]" />
            <h3 className="text-2xl font-bold">Cube<span className="text-[#D6336C]">Gen</span> AI</h3>
        </div>
        
        {status === 'polling' && <Loader />}
        
        <p className="mt-4 text-gray-600 font-medium">{messages[status]}</p>

        {status === 'failed' && (
          <button
            onClick={() => onNavigate('api')}
            className="mt-6 bg-[#F9D7E3] text-[#A61E4D] font-bold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            Go to API Page
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentStatusPage;
