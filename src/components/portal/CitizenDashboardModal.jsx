import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, PlusCircle, RefreshCw, AlertCircle, CheckCircle, Clock,
    FileText, Bell, Star, MapPin, Calendar, Camera, Wrench, Send, LogOut, User,
    ShieldCheck, Key, Home, Check
} from 'lucide-react';
import { complaintsApi, notificationsApi, feedbackApi, residentVerificationApi, extractErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SubmitComplaintForm from './SubmitComplaintForm';

export default function CitizenDashboardModal({ isOpen, onClose, onTrackComplaint }) {
    const { user, logout, refreshUser } = useAuth();

    const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'submit' | 'verification' | 'notifications'
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Selected complaint for detailed view / feedback
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Feedback submission state
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackRemarks, setFeedbackRemarks] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState('');
    const [feedbackError, setFeedbackError] = useState('');

    // Status filter
    const [statusFilter, setStatusFilter] = useState('All');

    // Resident verification state
    const [verStatus, setVerStatus] = useState(null);
    const [loadingVer, setLoadingVer] = useState(false);
    const [verWard, setVerWard] = useState('1');
    const [verAddress, setVerAddress] = useState('');
    const [verProofType, setVerProofType] = useState('Ration Card');
    const [verProofMaskedId, setVerProofMaskedId] = useState('');
    const [verCode, setVerCode] = useState('');
    const [verActionLoading, setVerActionLoading] = useState(false);
    const [verMessage, setVerMessage] = useState('');
    const [verError, setVerError] = useState('');

    const loadComplaints = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await complaintsApi.getMyComplaints({ per_page: 50 });
            if (res.data?.data?.complaints) {
                setComplaints(res.data.data.complaints);
            }
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async () => {
        try {
            const res = await notificationsApi.getAll();
            if (res.data?.data) {
                setNotifications(res.data.data.notifications || []);
                setUnreadCount(res.data.data.unread_count || 0);
            }
        } catch {
            // Non-critical
        }
    };

    const loadVerification = async () => {
        setLoadingVer(true);
        try {
            const res = await residentVerificationApi.getStatus();
            if (res.data?.data) {
                setVerStatus(res.data.data);
                if (res.data.data.ward_id) setVerWard(String(res.data.data.ward_id));
                if (res.data.data.address) setVerAddress(res.data.data.address);
            }
        } catch {
            // ignore
        } finally {
            setLoadingVer(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadComplaints();
            loadNotifications();
            loadVerification();
        }
    }, [isOpen]);

    const openComplaintDetails = async (complaintId) => {
        setLoadingDetails(true);
        setFeedbackSuccess('');
        setFeedbackError('');
        try {
            const res = await complaintsApi.getById(complaintId);
            if (res.data?.data) {
                setSelectedComplaint(res.data.data);
            }
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        setFeedbackError('');
        setFeedbackSuccess('');
        setSubmittingFeedback(true);

        try {
            await feedbackApi.submit({
                complaint_id: selectedComplaint.complaint_id,
                rating: feedbackRating,
                remarks: feedbackRemarks.trim() || undefined,
            });

            setFeedbackSuccess('Thank you! Your feedback has been recorded.');
            openComplaintDetails(selectedComplaint.complaint_id);
            loadComplaints();
        } catch (err) {
            setFeedbackError(extractErrorMessage(err));
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setVerError('');
        setVerMessage('');
        const code = verCode.trim().toUpperCase();
        if (!code) {
            setVerError('Please enter the Panchayat verification code.');
            return;
        }
        setVerActionLoading(true);
        try {
            const res = await residentVerificationApi.verifyCode(code);
            setVerMessage(res.data?.message || 'Residency verified successfully!');
            setVerCode('');
            await refreshUser();
            await loadVerification();
        } catch (err) {
            setVerError(extractErrorMessage(err));
        } finally {
            setVerActionLoading(false);
        }
    };

    const handleRequestReview = async (e) => {
        e.preventDefault();
        setVerError('');
        setVerMessage('');
        if (!verAddress.trim() || verAddress.trim().length < 5) {
            setVerError('Please provide your residential address in Vemavaram (min. 5 characters).');
            return;
        }
        setVerActionLoading(true);
        try {
            const res = await residentVerificationApi.requestVerification({
                ward_id: parseInt(verWard, 10),
                address: verAddress.trim(),
                proof_type: verProofType,
                proof_masked_id: verProofMaskedId.trim() || undefined,
            });
            setVerMessage(res.data?.message || 'Verification request submitted! Awaiting Panchayat review.');
            await refreshUser();
            await loadVerification();
        } catch (err) {
            setVerError(extractErrorMessage(err));
        } finally {
            setVerActionLoading(false);
        }
    };

    const handleMarkNotificationRead = async (notifId) => {
        try {
            await notificationsApi.markRead(notifId);
            setNotifications(prev =>
                prev.map(n => n.notification_id === notifId ? { ...n, is_read: 1 } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // Non-critical
        }
    };

    if (!isOpen) return null;

    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const pendingComplaints = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;

    const filteredComplaints = statusFilter === 'All'
        ? complaints
        : complaints.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());

    const isVerified = user?.residency_status === 'verified' || verStatus?.is_verified;
    const isPending = user?.residency_status === 'pending' || verStatus?.residency_status === 'pending';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-navy-950/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-t-3xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-bold text-lg font-poppins">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold font-poppins">{user?.name || 'Citizen'}</h3>
                                {isVerified ? (
                                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center space-x-1">
                                        <CheckCircle size={10} />
                                        <span>Verified Resident</span>
                                    </span>
                                ) : isPending ? (
                                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-400/30 flex items-center space-x-1 animate-pulse">
                                        <Clock size={10} />
                                        <span>Verification Pending</span>
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setActiveTab('verification')}
                                        className="bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20 flex items-center space-x-1 transition-colors"
                                    >
                                        <span>Unverified • Click to Verify</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-white/60 text-xs mt-0.5">
                                Mobile: {user?.mobile} • Ward {user?.residency_ward_id || verStatus?.ward_id || '1'} • Vemavaram Gram Panchayat
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => { logout(); onClose(); }}
                            title="Sign out"
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="flex border-b border-gray-100 bg-gray-50/80 px-6 gap-2 overflow-x-auto">
                    {[
                        { id: 'complaints', label: 'My Complaints', icon: FileText, badge: totalComplaints },
                        { id: 'submit', label: 'Report New Issue', icon: PlusCircle },
                        {
                            id: 'verification',
                            label: 'Resident Verification',
                            icon: ShieldCheck,
                            badge: isVerified ? 'Verified' : isPending ? 'Pending' : 'Unverified'
                        },
                        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSelectedComplaint(null); }}
                                className={`py-3.5 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'border-orange-500 text-navy-900 bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                <Icon size={16} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
                                <span>{tab.label}</span>
                                {tab.badge !== null && tab.badge !== undefined && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                        tab.badge === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                                        tab.badge === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                        isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1">
                    {/* SUBMIT COMPLAINT TAB */}
                    {activeTab === 'submit' && (
                        <SubmitComplaintForm
                            onSuccess={(created) => {
                                loadComplaints();
                                setActiveTab('complaints');
                                if (created?.complaint_id) {
                                    openComplaintDetails(created.complaint_id);
                                }
                            }}
                            onVerifyResidency={() => setActiveTab('verification')}
                        />
                    )}

                    {/* RESIDENT VERIFICATION TAB */}
                    {activeTab === 'verification' && (
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold font-poppins text-navy-900">Village Resident Verification</h3>
                                <p className="text-gray-500 text-xs mt-1">
                                    Residency verification confirms you reside in Vemavaram Village. Verified resident complaints receive prioritized SLA response and genuine validation.
                                </p>
                            </div>

                            {verMessage && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
                                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                                    <span>{verMessage}</span>
                                </div>
                            )}

                            {verError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2">
                                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                                    <span>{verError}</span>
                                </div>
                            )}

                            {/* Status Card */}
                            {isVerified ? (
                                <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                                            <ShieldCheck size={26} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-950 font-poppins text-base">Verified Vemavaram Resident</h4>
                                            <span className="text-xs text-emerald-700">Official Gram Panchayat Verification Confirmed</span>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-100 text-xs text-emerald-900">
                                        <div>
                                            <span className="text-emerald-600 block">Registered Ward:</span>
                                            <strong>Ward {verStatus?.ward_id || user?.residency_ward_id || '1'} (Vemavaram)</strong>
                                        </div>
                                        <div>
                                            <span className="text-emerald-600 block">Residential Address:</span>
                                            <strong>{verStatus?.address || user?.residency_address || 'Vemavaram Village'}</strong>
                                        </div>
                                    </div>

                                    {verStatus?.verification_remarks && (
                                        <div className="text-[11px] bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-emerald-800">
                                            <strong>Panchayat Note: </strong>{verStatus.verification_remarks}
                                        </div>
                                    )}
                                </div>
                            ) : isPending ? (
                                <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                                            <Clock size={26} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-amber-950 font-poppins text-base">Verification Under Review</h4>
                                            <span className="text-xs text-amber-800">Your residency details were submitted and are being verified by Panchayat Officers</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-amber-900 pt-2 border-t border-amber-100">
                                        Ward: <strong>Ward {verStatus?.latest_request?.ward_id || verWard}</strong> • Address: <strong>{verStatus?.latest_request?.address || verAddress}</strong>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        You can still submit complaints right now. Once approved, all your complaints will be marked with the Verified Resident badge automatically.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Option 1: Instant Verification via Code */}
                                    <div className="p-6 bg-navy-50/60 border border-navy-100 rounded-3xl">
                                        <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm mb-1">
                                            <Key size={16} className="text-orange-500" />
                                            <span>Method 1: Instant Panchayat Verification Code</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">
                                            If the Gram Panchayat or Ward Member gave you a code, enter it below for instant verification.
                                        </p>

                                        <form onSubmit={handleVerifyCode} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. VEM-W1-2026"
                                                value={verCode}
                                                onChange={(e) => setVerCode(e.target.value.toUpperCase())}
                                                disabled={verActionLoading}
                                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-navy-300"
                                            />
                                            <button
                                                type="submit"
                                                disabled={verActionLoading || !verCode.trim()}
                                                className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                                            >
                                                {verActionLoading ? 'Verifying…' : 'Verify Code'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Option 2: Request Officer Verification */}
                                    <div className="p-6 bg-white border border-gray-200 rounded-3xl space-y-4">
                                        <div className="flex items-center space-x-2 text-navy-900 font-bold text-sm">
                                            <Home size={16} className="text-emerald-600" />
                                            <span>Method 2: Request Gram Panchayat Officer Review</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Provide your ward and address in Vemavaram. A Panchayat officer will verify it against the ward register.
                                        </p>

                                        <form onSubmit={handleRequestReview} className="space-y-3.5">
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Ward Number *</label>
                                                    <select
                                                        value={verWard}
                                                        onChange={(e) => setVerWard(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                                                    >
                                                        <option value="1">Ward 1 (Vemavaram)</option>
                                                        <option value="2">Ward 2 (Vemavaram)</option>
                                                        <option value="3">Ward 3 (Vemavaram)</option>
                                                        <option value="4">Ward 4 (Vemavaram)</option>
                                                        <option value="5">Ward 5 (Vemavaram)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Proof Type *</label>
                                                    <select
                                                        value={verProofType}
                                                        onChange={(e) => setVerProofType(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                                                    >
                                                        <option value="Ration Card">Ration Card (Local Household)</option>
                                                        <option value="Electricity Bill">Electricity Bill</option>
                                                        <option value="House Tax Receipt">House Tax Receipt</option>
                                                        <option value="Voter ID">Voter ID (Vemavaram Constituency)</option>
                                                        <option value="Panchayat Resident Certificate">Panchayat Resident Certificate</option>
                                                        <option value="Self Declaration">Self Declaration (Ward Member Known)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Residential Address in Vemavaram *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Street name, landmark, or house door number"
                                                    value={verAddress}
                                                    onChange={(e) => setVerAddress(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Proof Reference Identifier (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. EB Service No, Ration Card No, or last 4 digits"
                                                    value={verProofMaskedId}
                                                    onChange={(e) => setVerProofMaskedId(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                                />
                                                <span className="text-[10px] text-gray-500 block mt-1">
                                                    🔒 Privacy Note: For UIDAI legal compliance, complete 12-digit Aadhaar numbers are never collected or stored.
                                                </span>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={verActionLoading}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1"
                                            >
                                                <span>{verActionLoading ? 'Submitting…' : 'Submit for Panchayat Verification →'}</span>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-navy-900 text-base font-poppins">System Notifications</h4>
                                <button
                                    onClick={loadNotifications}
                                    className="text-xs text-navy-700 font-semibold flex items-center space-x-1 hover:underline"
                                >
                                    <RefreshCw size={12} />
                                    <span>Refresh</span>
                                </button>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <Bell size={36} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm font-semibold text-gray-700">No notifications yet</p>
                                    <p className="text-xs text-gray-400 mt-1">You will receive live updates when workers update your complaints.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.notification_id}
                                        onClick={() => !notif.is_read && handleMarkNotificationRead(notif.notification_id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                            notif.is_read
                                                ? 'bg-gray-50 border-gray-100 text-gray-600'
                                                : 'bg-orange-50/60 border-orange-200 text-navy-900 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                    notif.is_read ? 'bg-gray-200 text-gray-600' : 'bg-orange-500 text-white'
                                                }`}>
                                                    <Bell size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">{notif.title}</div>
                                                    <div className="text-xs text-gray-600 mt-0.5">{notif.message}</div>
                                                    <div className="text-[10px] text-gray-400 mt-2">
                                                        {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            {!notif.is_read && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* COMPLAINTS TAB */}
                    {activeTab === 'complaints' && !selectedComplaint && (
                        <div className="space-y-6">
                            {/* Summary Metrics Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Filed', count: totalComplaints, color: 'text-navy-900 bg-navy-50' },
                                    { label: 'Pending Review', count: pendingComplaints, color: 'text-amber-800 bg-amber-50' },
                                    { label: 'In Progress', count: inProgressComplaints, color: 'text-blue-800 bg-blue-50' },
                                    { label: 'Resolved', count: resolvedComplaints, color: 'text-emerald-800 bg-emerald-50' },
                                ].map((m) => (
                                    <div key={m.label} className={`p-4 rounded-2xl border border-gray-100 ${m.color} text-center`}>
                                        <div className="text-2xl font-bold font-poppins">{m.count}</div>
                                        <div className="text-xs font-semibold opacity-75 mt-0.5">{m.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Filter Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex gap-1.5 flex-wrap">
                                    {['All', 'Submitted', 'In Progress', 'Resolved'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => setStatusFilter(st)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                statusFilter === st
                                                    ? 'bg-navy-900 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={loadComplaints}
                                    className="text-xs text-navy-700 font-semibold flex items-center space-x-1 hover:underline"
                                >
                                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                                    <span>Refresh list</span>
                                </button>
                            </div>

                            {loading && (
                                <div className="py-12 text-center text-gray-400">
                                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-xs font-medium">Loading your complaints...</span>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                                    {error}
                                </div>
                            )}

                            {!loading && filteredComplaints.length === 0 && (
                                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm font-semibold text-gray-700">No complaints found</p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                        You haven't filed any complaints matching this filter. Report an issue to alert village authorities.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('submit')}
                                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                                    >
                                        Report a Village Issue
                                    </button>
                                </div>
                            )}

                            {/* Complaints List */}
                            <div className="space-y-3">
                                {filteredComplaints.map((c) => (
                                    <motion.div
                                        key={c.complaint_id}
                                        whileHover={{ y: -2 }}
                                        onClick={() => openComplaintDetails(c.complaint_id)}
                                        className="p-5 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2 flex-wrap">
                                                <span className="text-xs font-bold text-navy-800 font-poppins">{c.complaint_id}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs font-semibold text-orange-600">{c.category}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">Ward {c.ward_id || '1'}</span>
                                                {c.is_verified_resident === 1 && (
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                                        ✓ Verified Resident
                                                    </span>
                                                )}
                                                {c.is_duplicate_suspect === 1 && (
                                                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                                        ⚠️ Suspect Duplicate
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm text-navy-900">{c.title}</h4>
                                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                                                <MapPin size={12} className="text-gray-400" />
                                                <span>{c.location}</span>
                                                <span>•</span>
                                                <Calendar size={12} className="text-gray-400" />
                                                <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3 self-end sm:self-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                c.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                                                c.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {c.status}
                                            </span>
                                            <span className="text-xs text-navy-600 font-semibold hover:underline">
                                                Details →
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SINGLE COMPLAINT DETAILS VIEW */}
                    {activeTab === 'complaints' && selectedComplaint && (
                        <div className="space-y-6">
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center space-x-1"
                            >
                                <span>← Back to all complaints</span>
                            </button>

                            {selectedComplaint.is_duplicate_suspect === 1 && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                                    <div className="flex items-center space-x-2 font-bold text-amber-800">
                                        <AlertCircle size={16} className="text-amber-600" />
                                        <span>Cross-Reference Notice: Potential Duplicate Complaint</span>
                                    </div>
                                    <p>
                                        This complaint is flagged as similar to earlier report <strong>{selectedComplaint.duplicate_of_id}</strong>.
                                        Village workers will review both together to avoid duplicate effort.
                                    </p>
                                    {selectedComplaint.duplicate_reason && (
                                        <div className="text-[11px] text-amber-700 mt-1">
                                            Reason: {selectedComplaint.duplicate_reason}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Complaint ID</span>
                                    <div className="text-xl font-bold font-poppins text-navy-900">{selectedComplaint.complaint_id}</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        selectedComplaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedComplaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        selectedComplaint.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {selectedComplaint.status}
                                    </span>
                                </div>
                            </div>

                            {/* Issue Content */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-navy-900 font-poppins">{selectedComplaint.title}</h3>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                                        Category: <strong>{selectedComplaint.category}</strong>
                                    </span>
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                                        Ward: <strong>{selectedComplaint.ward_id || 'General'}</strong>
                                    </span>
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                                        Location: <strong>{selectedComplaint.location}</strong>
                                    </span>
                                    {selectedComplaint.is_verified_resident ? (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                                            ✓ Verified Resident Report
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">
                                            Standard Citizen Report
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 bg-gray-50/70 rounded-xl text-sm text-gray-700 whitespace-pre-line border border-gray-100">
                                    {selectedComplaint.description}
                                </div>
                            </div>

                            {/* Citizen Photo */}
                            {selectedComplaint.image_url && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Citizen Attached Photo</span>
                                    <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-60 bg-gray-900 flex items-center justify-center">
                                        <img
                                            src={selectedComplaint.image_url}
                                            alt="Complaint Evidence"
                                            className="w-full h-auto max-h-60 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Field Worker Assignment Details */}
                            {selectedComplaint.assignment && (
                                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                                    <div className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1 flex items-center space-x-1">
                                        <Wrench size={14} />
                                        <span>Worker Assignment Information</span>
                                    </div>
                                    <div className="text-xs text-purple-800">
                                        Department: <strong>{selectedComplaint.assignment.department || 'Field Works'}</strong>
                                        {selectedComplaint.assignment.worker_name && (
                                            <span> • Assigned Worker: <strong>{selectedComplaint.assignment.worker_name}</strong></span>
                                        )}
                                    </div>
                                    {selectedComplaint.assignment.resolution_notes && (
                                        <div className="mt-2 text-xs bg-white p-3 rounded-xl border border-purple-100 text-gray-700">
                                            <strong>Worker Completion Remarks: </strong>
                                            {selectedComplaint.assignment.resolution_notes}
                                        </div>
                                    )}
                                    {selectedComplaint.assignment.resolution_image && (
                                        <div className="mt-3">
                                            <span className="text-xs font-bold text-purple-900 block mb-1">Resolution Proof Photograph:</span>
                                            <div className="rounded-xl overflow-hidden border border-purple-200 max-h-48 bg-gray-900 flex items-center justify-center">
                                                <img
                                                    src={selectedComplaint.assignment.resolution_image}
                                                    alt="Resolution Evidence"
                                                    className="w-full h-auto max-h-48 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Timeline History */}
                            {selectedComplaint.status_history && selectedComplaint.status_history.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status Timeline History</h4>
                                    <div className="space-y-2 border-l-2 border-gray-200 ml-3 pl-4">
                                        {selectedComplaint.status_history.map((h, i) => (
                                            <div key={i} className="relative pb-2">
                                                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-navy-600 border-2 border-white ring-2 ring-gray-200" />
                                                <div className="text-xs font-bold text-navy-900">
                                                    Status changed to <span className="text-orange-600">{h.new_status}</span>
                                                    {h.changed_by_name && <span className="text-gray-400 font-normal"> by {h.changed_by_name}</span>}
                                                </div>
                                                {h.notes && <div className="text-xs text-gray-600 mt-0.5">{h.notes}</div>}
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {h.changed_at ? new Date(h.changed_at).toLocaleString() : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CITIZEN FEEDBACK SECTION */}
                            {selectedComplaint.status === 'Resolved' && (
                                <div className="p-6 bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-3xl border border-amber-200">
                                    <h4 className="text-base font-bold font-poppins text-navy-900 mb-1 flex items-center space-x-1.5">
                                        <Star size={18} className="text-amber-500" />
                                        <span>Citizen Resolution Feedback</span>
                                    </h4>

                                    {selectedComplaint.feedback ? (
                                        <div className="mt-3 bg-white p-4 rounded-2xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <span className="text-xs text-gray-500 font-medium">Your Submitted Rating:</span>
                                                <div className="flex items-center space-x-1 text-amber-500 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={18}
                                                            fill={i < selectedComplaint.feedback.rating ? 'currentColor' : 'none'}
                                                        />
                                                    ))}
                                                    <span className="text-xs font-bold text-gray-700 ml-2">
                                                        ({selectedComplaint.feedback.rating} / 5 Stars)
                                                    </span>
                                                </div>
                                                {selectedComplaint.feedback.remarks && (
                                                    <p className="text-xs text-gray-600 mt-2 italic">
                                                        "{selectedComplaint.feedback.remarks}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
                                            <p className="text-xs text-gray-600">
                                                Please rate the resolution work done by the Vemavaram maintenance team.
                                            </p>

                                            <div>
                                                <span className="text-xs font-bold text-navy-900 block mb-1">Your Rating *</span>
                                                <div className="flex items-center space-x-2">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setFeedbackRating(num)}
                                                            className={`p-2 rounded-xl transition-all ${
                                                                feedbackRating >= num
                                                                    ? 'text-amber-500 bg-amber-100/50 scale-105'
                                                                    : 'text-gray-300 hover:text-amber-400'
                                                            }`}
                                                        >
                                                            <Star size={24} fill={feedbackRating >= num ? 'currentColor' : 'none'} />
                                                        </button>
                                                    ))}
                                                    <span className="text-xs font-bold text-navy-800 ml-2">
                                                        {feedbackRating} of 5 Stars
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-navy-900 block mb-1">Feedback Comments (Optional)</label>
                                                <textarea
                                                    rows={2}
                                                    value={feedbackRemarks}
                                                    onChange={(e) => setFeedbackRemarks(e.target.value)}
                                                    placeholder="Was the work done properly? Any comments for the Panchayat authorities..."
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-navy-300 resize-none bg-white"
                                                />
                                            </div>

                                            {feedbackSuccess && (
                                                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                                                    <CheckCircle size={16} />
                                                    <span>{feedbackSuccess}</span>
                                                </div>
                                            )}

                                            {feedbackError && (
                                                <div className="p-3 bg-red-100 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                                                    <AlertCircle size={16} />
                                                    <span>{feedbackError}</span>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={submittingFeedback}
                                                className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                                            >
                                                <Send size={14} />
                                                <span>{submittingFeedback ? 'Submitting...' : 'Submit Resolution Feedback'}</span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
