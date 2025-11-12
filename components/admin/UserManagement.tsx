import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAdminUsers } from '../../services/geminiService';
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
    
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        let colorClasses = "bg-gray-100 text-gray-800";
        if (status === 'active') colorClasses = "bg-green-100 text-green-800";
        if (status === 'cancelled') colorClasses = "bg-yellow-100 text-yellow-800";
        if (status === 'expired') colorClasses = "bg-red-100 text-red-800";
        return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader /></div>;
    }
    
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-gray-500 text-sm">Search, view, and manage user subscriptions.</p>
                </div>
                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
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
                                        <button onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)} className="text-pink-600 hover:text-pink-900">
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