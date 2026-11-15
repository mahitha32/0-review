import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Phone, User, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CitizenAuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess, onOpenWorker }) {
    const { login, register } = useAuth();
    const [tab, setTab] = useState(initialTab); // 'login' | 'register'

    // Form states
    const [loginMobile, setLoginMobile] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [regName, setRegName] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regVillage, setRegVillage] = useState('Vemavaram');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const cleanedMobile = loginMobile.replace(/\D/g, '');
        if (cleanedMobile.length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!loginPassword) {
            setError('Please enter your password.');
            return;
        }

        setLoading(true);
        const res = await login(cleanedMobile, loginPassword);
        setLoading(false);

        if (res.success) {
            if (onAuthSuccess) onAuthSuccess(res.user);
            onClose();
        } else {
            setError(res.error || 'Login failed. Please verify credentials.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        const trimmedName = regName.trim();
        const cleanedMobile = regMobile.replace(/\D/g, '');

        if (!trimmedName) {
            setError('Please enter your full name.');
            return;
        }
        if (cleanedMobile.length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (regPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        const res = await register({
            name: trimmedName,
            mobile: cleanedMobile,
            password: regPassword,
            village: regVillage || 'Vemavaram',
        });
        setLoading(false);

        if (res.success) {
            if (onAuthSuccess) onAuthSuccess(res.user);
            onClose();
        } else {
            setError(res.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-navy-950/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-poppins">Citizen Portal</h3>
                        <p className="text-white/60 text-xs">Vemavaram Village Digital Governance</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => { setTab('login'); setError(''); }}
                        className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                            tab === 'login'
                                ? 'border-orange-500 text-orange-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        Citizen Login
                    </button>
                    <button
                        onClick={() => { setTab('register'); setError(''); }}
                        className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
                            tab === 'register'
                                ? 'border-orange-500 text-orange-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        New Registration
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {tab === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Registered Mobile Number *
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        placeholder="10-digit mobile number"
                                        value={loginMobile}
                                        onChange={(e) => setLoginMobile(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                                    />
                                    <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        placeholder="Enter password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                                    />
                                    <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Log In to Portal</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your full name"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                                    />
                                    <User size={16} className="absolute left-3.5 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Mobile Number *
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        placeholder="10-digit mobile number"
                                        value={regMobile}
                                        onChange={(e) => setRegMobile(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                                    />
                                    <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Village / Gram Panchayat
                                </label>
                                <input
                                    type="text"
                                    value={regVillage}
                                    readOnly
                                    className="w-full px-4 py-2.5 border border-gray-200 bg-gray-100 text-gray-600 rounded-xl text-sm cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                    Create Password (min. 6 characters) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        placeholder="Set your password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                                    />
                                    <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Create Citizen Account</span>
                                )}
                            </button>
                        </form>
                    )}

                    {onOpenWorker && (
                        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center space-x-1.5">
                                <Wrench size={13} className="text-orange-500" />
                                <span>Vemavaram Field Worker?</span>
                            </span>
                            <button
                                type="button"
                                onClick={onOpenWorker}
                                className="font-bold text-navy-900 hover:text-orange-600 transition-colors"
                            >
                                Worker Portal →
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

