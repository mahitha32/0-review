import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Phone, User, CheckCircle, AlertCircle, Wrench, ShieldCheck, MapPin, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi, extractErrorMessage } from '../../services/api';

export default function CitizenAuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess, onOpenWorker }) {
    const { login, register } = useAuth();
    const [tab, setTab] = useState(initialTab); // 'login' | 'register'

    // Login form states
    const [loginMobile, setLoginMobile] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Registration form states
    const [regName, setRegName] = useState('');
    const [regMobile, setRegMobile] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regVillage, setRegVillage] = useState('Vemavaram');

    // Residency verification states
    const [isResident, setIsResident] = useState(true);
    const [regWard, setRegWard] = useState('1');
    const [regAddress, setRegAddress] = useState('');
    const [regCode, setRegCode] = useState('');

    // Mobile OTP states
    const [otpStep, setOtpStep] = useState('idle'); // 'idle' | 'sent' | 'verified'
    const [otpCode, setOtpCode] = useState('');
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpInfo, setOtpInfo] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        setError('');
        const cleanedMobile = regMobile.replace(/\D/g, '');
        if (cleanedMobile.length < 10) {
            setError('Please enter a valid 10-digit mobile number before requesting OTP.');
            return;
        }

        setSendingOtp(true);
        try {
            const res = await authApi.sendOtp({ mobile: cleanedMobile, purpose: 'registration' });
            setOtpStep('sent');
            const mock = res.data?.data?.otp_code ? ` (Code: ${res.data.data.otp_code})` : '';
            setOtpInfo(`Verification code sent to ${cleanedMobile}${mock}`);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        const cleanedMobile = regMobile.replace(/\D/g, '');
        if (!otpCode || otpCode.length < 4) {
            setError('Please enter the verification code.');
            return;
        }

        setVerifyingOtp(true);
        try {
            await authApi.verifyOtp({ mobile: cleanedMobile, otp_code: otpCode, purpose: 'registration' });
            setOtpStep('verified');
            setOtpInfo('Mobile number verified successfully!');
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setVerifyingOtp(false);
        }
    };

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
            resides_in_village: isResident,
            ward_id: isResident ? parseInt(regWard, 10) : undefined,
            address: isResident ? regAddress.trim() : undefined,
            verification_code: regCode.trim() ? regCode.trim().toUpperCase() : undefined,
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
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col my-8 max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between flex-shrink-0">
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
                <div className="flex border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
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

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {otpInfo && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start space-x-2">
                            <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                            <span>{otpInfo}</span>
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
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Mobile Number *
                                    </label>
                                    {otpStep === 'verified' && (
                                        <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                                            <CheckCircle size={12} />
                                            <span>Verified</span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            required
                                            placeholder="10-digit mobile number"
                                            value={regMobile}
                                            onChange={(e) => {
                                                setRegMobile(e.target.value);
                                                if (otpStep !== 'idle') setOtpStep('idle');
                                            }}
                                            disabled={loading || otpStep === 'verified'}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                                        />
                                        <Phone size={16} className="absolute left-3.5 top-3 text-gray-400" />
                                    </div>
                                    {otpStep !== 'verified' && (
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={sendingOtp || regMobile.length < 10}
                                            className="px-3.5 py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-800 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors whitespace-nowrap"
                                        >
                                            {sendingOtp ? 'Sending…' : otpStep === 'sent' ? 'Resend' : 'Send OTP'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* OTP Entry box if sent */}
                            {otpStep === 'sent' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center space-x-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center font-mono tracking-widest focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={verifyingOtp || otpCode.length < 4}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {verifyingOtp ? 'Checking…' : 'Verify'}
                                    </button>
                                </motion.div>
                            )}

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

                            {/* Village Residency Declaration Section */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="flex items-center space-x-2 cursor-pointer mb-2.5">
                                    <input
                                        type="checkbox"
                                        checked={isResident}
                                        onChange={(e) => setIsResident(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-bold text-navy-900 flex items-center space-x-1.5">
                                        <ShieldCheck size={14} className="text-emerald-600" />
                                        <span>I reside in Vemavaram Village (Residency Verification)</span>
                                    </span>
                                </label>

                                {isResident && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2.5 bg-navy-50/50 p-3.5 rounded-xl border border-navy-100/60"
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Ward Number</label>
                                                <select
                                                    value={regWard}
                                                    onChange={(e) => setRegWard(e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg text-xs"
                                                >
                                                    <option value="1">Ward 1</option>
                                                    <option value="2">Ward 2</option>
                                                    <option value="3">Ward 3</option>
                                                    <option value="4">Ward 4</option>
                                                    <option value="5">Ward 5</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">Village</label>
                                                <input
                                                    type="text"
                                                    value={regVillage}
                                                    readOnly
                                                    className="w-full px-2.5 py-1.5 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg text-xs cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Street / House Address in Vemavaram
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Near Ramalayam Temple, Door 2-14"
                                                value={regAddress}
                                                onChange={(e) => setRegAddress(e.target.value)}
                                                className="w-full px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-emerald-800 mb-1 flex items-center space-x-1">
                                                <Key size={12} />
                                                <span>Panchayat Verification Code (Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. VEM-W1-2026 (for instant verified resident badge)"
                                                value={regCode}
                                                onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                                                className="w-full px-3 py-1.5 border border-emerald-300 bg-emerald-50/50 rounded-lg text-xs font-mono tracking-wider text-emerald-900 placeholder:text-gray-400"
                                            />
                                            <span className="text-[10px] text-gray-500 block mt-0.5">
                                                Issued by Gram Panchayat. If you don't have a code, you can request officer verification anytime.
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-3 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
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

                    <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center space-x-1.5">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <span>Panchayat Official / Admin?</span>
                        </span>
                        <a
                            href="/admin/login"
                            className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                            Admin Login →
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
