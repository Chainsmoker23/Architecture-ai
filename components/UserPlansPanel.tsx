import React, { useState, useEffect } from 'react';
import { getActiveUserPlans, switchUserPlan } from '../services/geminiService';

interface UserPlansPanelProps {
  plan: string;
  refreshUser: () => Promise<void>;
  isOpen: boolean;
}

const UserPlansPanel: React.FC<UserPlansPanelProps> = ({ plan, refreshUser, isOpen }) => {
    const [activePlans, setActivePlans] = useState<any[]>([]);
    const [isFetchingPlans, setIsFetchingPlans] = useState(false);
    const [isSwitchingPlan, setIsSwitchingPlan] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return; // Don't fetch if the sidebar is closed to save resources
        }
        const fetchPlans = async () => {
            setIsFetchingPlans(true);
            try {
                const plans = await getActiveUserPlans();
                setActivePlans(plans);
            } catch (error) {
                console.error("Failed to fetch active plans:", error);
            } finally {
                setIsFetchingPlans(false);
            }
        };
        fetchPlans();
    }, [isOpen, plan]); // Refetch when the sidebar is opened or the primary plan changes

    const handleSwitchPlan = async (subscriptionId: string) => {
        setIsSwitchingPlan(subscriptionId);
        try {
            await switchUserPlan(subscriptionId);
            await refreshUser(); // Force a refresh to get the new user metadata
        } catch (error) {
            console.error("Failed to switch plan:", error);
        } finally {
            setIsSwitchingPlan(null);
        }
    };

    if (isFetchingPlans) {
        return (
             <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Your Plans</h3>
                <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] text-center text-xs text-[var(--color-text-secondary)]">
                    Loading plans...
                </div>
            </div>
        );
    }
    
    // Don't show the panel if the user only has one active plan (or none).
    if (activePlans.length <= 1) {
        return null;
    }

    return (
        <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Your Plans</h3>
            <div className="space-y-2">
                {activePlans.map(p => (
                    <div key={p.id} className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-input)] flex justify-between items-center">
                        <span className="font-semibold text-sm capitalize">{p.plan_name}</span>
                        {plan === p.plan_name ? (
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
                        ) : (
                            <button
                                onClick={() => handleSwitchPlan(p.id)}
                                disabled={isSwitchingPlan === p.id}
                                className="text-xs font-semibold text-[var(--color-accent-text)] bg-[var(--color-accent-soft)] px-2 py-1 rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-50"
                            >
                                {isSwitchingPlan === p.id ? 'Activating...' : 'Activate'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPlansPanel;