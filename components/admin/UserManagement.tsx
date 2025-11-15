import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAdminUsers, adminUpdateUserPlan } from '../../services/geminiService';
import Loader from '../Loader';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const UserManagement: React.FC = () => {
    const { adminToken } = useAdminAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [selectedPlanForUpdate, setSelectedPlanForUpdate] = useState('');
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!adminToken) return;
        setIsLoading(true);
        setError(null);
        try {
            const fetchedUsers = await getAdminUsers(adminToken, debouncedSearchTerm);
            setUsers(fetchedUsers);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setIsLoading(false);
        }
    }, [adminToken, debouncedSearchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handlePlanUpdate = async (userId: string, currentPlan: string) => {
        if (!selectedPlanForUpdate || selectedPlanForUpdate === currentPlan) {
            setUpdateError('Please select a new plan to apply.');
            setTimeout(() => setUpdateError(null), 3000);
            return;
        }
        if (!window.confirm(`Are you sure you want to change this user's plan from "${currentPlan}" to "${selectedPlanForUpdate}"? This is an emergency override.`)) {
            return;
        }
        
        if (!adminToken) return;

        setUpdatingUserId(userId);
        setUpdateError(null);
        setUpdateSuccess(null);
        try {
            await adminUpdateUserPlan(userId, selectedPlanForUpdate, adminToken);
            setUpdateSuccess(`User plan successfully updated to ${selectedPlanForUpdate}. Refreshing list...`);
            setTimeout(async () => {
                await fetchUsers();
                setExpandedUserId(null);
                setUpdateSuccess(null);
            }, 2000);
        } catch (err: any) {
            setUpdateError(err.message || 'Failed to update plan.');
        } finally {
            setUpdatingUserId(null);
        }
    };
    
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        let colorClasses = "bg-gray-100 text-gray-800";
        if (status === 'active') colorClasses = "bg-green-100 text-green-800";
        if (status === 'cancelled') colorClasses = "bg-yellow-100 text-yellow-800";
        if (status === 'expired') colorClasses = "bg-red-100 text-red-800";
        if (status === 'pending') colorClasses = "bg-blue-100 text-blue-800";
        return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
    };
    
    if (isLoading && users.length === 0) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-gray-500 text-sm">Search, view, and manage user subscriptions.</p>
                </div>
                <div className="w-full md:w-auto relative">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Details</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <React.Fragment key={user.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.currentPlan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.currentStatus} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => {
                                             setExpandedUserId(expandedUserId === user.id ? null : user.id);
                                             setSelectedPlanForUpdate(user.currentPlan);
                                             setUpdateError(null);
                                             setUpdateSuccess(null);
                                        }} className="text-pink-600 hover:text-pink-900">
                                            {expandedUserId === user.id ? 'Hide' : 'Details'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedUserId === user.id && (
                                    <tr>
                                        <td colSpan={5} className="p-0">
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-gray-50/70 p-4"
                                            >
                                                <h4 className="font-semibold text-gray-700 mb-2">Subscription History</h4>
                                                {user.subscriptions.length > 0 ? (
                                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left">Plan</th>
                                                                    <th className="px-4 py-2 text-left">Status</th>
                                                                    <th className="px-4 py-2 text-left">Subscription ID</th>
                                                                    <th className="px-4 py-2 text-left">Date</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white">
                                                                {user.subscriptions.map((sub: any) => (
                                                                    <tr key={sub.id}>
                                                                        <td className="px-4 py-2 capitalize">{sub.plan_name}</td>
                                                                        <td className="px-4 py-2"><StatusBadge status={sub.status} /></td>
                                                                        <td className="px-4 py-2 font-mono text-xs">{sub.dodo_subscription_id || 'N/A'}</td>
                                                                        <td className="px-4 py-2">{new Date(sub.created_at).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : <p className="text-sm text-gray-500 italic">No subscription history found for this user.</p>}

                                                <div className="mt-4 pt-4 border-t border-red-200 bg-red-50 p-4 rounded-lg">
                                                    <h4 className="font-bold text-red-800">Emergency Actions</h4>
                                                    <p className="text-sm text-red-700 mb-3">Manually override the user's plan. This does not create a real subscription and is for emergency use only.</p>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <select
                                                            value={selectedPlanForUpdate}
                                                            onChange={(e) => setSelectedPlanForUpdate(e.target.value)}
                                                            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                                        >
                                                            <option value="free">Free</option>
                                                            <option value="hobbyist">Hobbyist</option>
                                                            <option value="pro">Pro</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handlePlanUpdate(user.id, user.currentPlan)}
                                                            disabled={updatingUserId === user.id}
                                                            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            {updatingUserId === user.id ? 'Updating...' : 'Update Plan'}
                                                        </button>
                                                    </div>
                                                    
                                                    <AnimatePresence>
                                                        {updateError && <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-red-600 text-sm mt-2">{updateError}</motion.p>}
                                                        {updateSuccess && <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-green-600 text-sm mt-2">{updateSuccess}</motion.p>}
                                                    </AnimatePresence>
                                                </div>

                                            </motion.div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
             {users.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No users found for your search.</p>
                </div>
            )}
        </div>
    );
};

export default UserManagement;