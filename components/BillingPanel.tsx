import React, { useState, useEffect } from 'react';
import { getActiveUserPlans, createBillingPortalSession, cancelSubscription } from '../services/geminiService';

interface BillingPanelProps {
  isPremiumUser: boolean;
  refreshUser: () => Promise<void>;
  isOpen: boolean;
}

const BillingPanel: React.FC<BillingPanelProps> = ({ isPremiumUser, refreshUser, isOpen }) => {
    const [activeSubs, setActiveSubs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isManaging, setIsManaging] = useState(false);
    const [isCancelling, setIsCancelling] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !isPremiumUser) {
            setActiveSubs([]);
            return;
        }

        const fetchSubs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const plans = await getActiveUserPlans();
                setActiveSubs(plans.filter(p => p.plan_name !== 'free' && p.plan_name !== 'hobbyist'));
            } catch (err: any) {
                setError(err.message || "Failed to load subscriptions.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubs();
    }, [isOpen, isPremiumUser]);

    const handleManageBilling = async () => {
        setIsManaging(true);
        setError(null);
        try {
            const portalUrl = await createBillingPortalSession();
            window.location.href = portalUrl;
        } catch (err: any) {
            setError(err.message || "Could not open billing portal.");
            setIsManaging(false); // Only set to false on error, success redirects.
        }
    };

    const handleCancel = async (subId: string, planName: string) => {
        if (window.confirm(`Are you sure you want to cancel your '${planName}' plan? Your access will remain until the end of the current billing period.`)) {
            setIsCancelling(subId);
            setError(null);
            try {
                await cancelSubscription(subId);
                // The webhook will update the state, but we can optimistically refresh
                await refreshUser();
            } catch (err: any) {
                setError(err.message || `Failed to cancel the '${planName}' plan.`);
            } finally {
                setIsCancelling(null);
            }
        }
    };

    if (!isPremiumUser) {
        return null;
    }
    
    return (
        <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Billing &amp; Subscriptions</h3>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)]">
                {isLoading ? (
                    <p className="text-xs text-center text-[var(--color-text-secondary)]">Loading subscriptions...</p>
                ) : error ? (
                     <p className="text-xs text-center text-red-500">{error}</p>
                ) : activeSubs.length === 0 ? (
                    <p className="text-xs text-center text-[var(--color-text-secondary)]">No active subscriptions found.</p>
                ) : (
                    <div className="space-y-3">
                        {activeSubs.map(sub => (
                            <div key={sub.id} className="text-sm">
                                <p className="font-semibold capitalize">{sub.plan_name} Plan</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span>
                                    <button 
                                        onClick={() => handleCancel(sub.id, sub.plan_name)}
                                        disabled={!!isCancelling}
                                        className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                                    >
                                        {isCancelling === sub.id ? 'Cancelling...' : 'Cancel'}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="pt-3 mt-3 border-t border-[var(--color-border)]">
                             <button
                                onClick={handleManageBilling}
                                disabled={isManaging}
                                className="w-full bg-[var(--color-button-bg)] text-[var(--color-text-secondary)] text-sm font-semibold py-2 px-3 rounded-lg hover:bg-[var(--color-button-bg-hover)] transition-colors disabled:opacity-50"
                            >
                                {isManaging ? 'Opening...' : 'Manage Billing'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingPanel;