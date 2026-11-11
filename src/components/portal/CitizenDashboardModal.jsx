import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, PlusCircle, RefreshCw, AlertCircle, CheckCircle, Clock,
    FileText, Bell, Star, MapPin, Calendar, Camera, Wrench, Send, LogOut, User
} from 'lucide-react';
import { complaintsApi, notificationsApi, feedbackApi, extractErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SubmitComplaintForm from './SubmitComplaintForm';

export default function CitizenDashboardModal({ isOpen, onClose, onTrackComplaint }) {
    const { user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'submit' | 'notifications' | 'profile'
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

    useEffect(() => {
        if (isOpen) {
            loadComplaints();
            loadNotifications();
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
            // Refresh single complaint details and list
            openComplaintDetails(selectedComplaint.complaint_id);
            loadComplaints();
        } catch (err) {
            setFeedbackError(extractErrorMessage(err));
        } finally {
            setSubmittingFeedback(false);
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

    // Derived statistics
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    const inProgressComplaints = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const pendingComplaints = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;

    const filteredComplaints = statusFilter === 'All'
        ? complaints
        : complaints.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());

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
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                                    Vemavaram Citizen
                                </span>
                            </div>
                            <p className="text-white/60 text-xs mt-0.5">Mobile: {user?.mobile} • Gram Panchayat: Vemavaram</p>
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
                        />
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
                                <div className="text-center py-12 text-gray-400">
                                    <Bell size={40} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No notifications yet. You will receive updates as your complaints are processed.</p>
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
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-navy-800 font-poppins">{c.complaint_id}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs font-semibold text-orange-600">{c.category}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">Ward {c.ward_id || '1'}</span>
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

                            {/* CITIZEN FEEDBACK SECTION (STEP 8) */}
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
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full self-start sm:self-center">
                                                Feedback Recorded ✓
                                            </span>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4 bg-white p-5 rounded-2xl border border-amber-100">
                                            <p className="text-xs text-gray-600">
                                                This issue was marked as <strong>Resolved</strong> by the village field team. Please rate the quality of the work and service.
                                            </p>

                                            {feedbackSuccess && (
                                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center space-x-2">
                                                    <CheckCircle size={16} />
                                                    <span>{feedbackSuccess}</span>
                                                </div>
                                            )}

                                            {feedbackError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                                                    {feedbackError}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                                    Satisfaction Rating (1 to 5 Stars) *
                                                </label>
                                                <div className="flex items-center space-x-2 pt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setFeedbackRating(star)}
                                                            className="p-1 hover:scale-110 transition-transform"
                                                        >
                                                            <Star
                                                                size={28}
                                                                fill={star <= feedbackRating ? '#F59E0B' : 'none'}
                                                                className={star <= feedbackRating ? 'text-amber-500' : 'text-gray-300'}
                                                            />
                                                        </button>
                                                    ))}
                                                    <span className="text-xs font-bold text-navy-800 ml-2">
                                                        {feedbackRating === 5 ? 'Excellent' :
                                                         feedbackRating === 4 ? 'Good' :
                                                         feedbackRating === 3 ? 'Satisfactory' :
                                                         feedbackRating === 2 ? 'Needs Improvement' : 'Unsatisfactory'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                                    Feedback Comments / Remarks
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={feedbackRemarks}
                                                    onChange={(e) => setFeedbackRemarks(e.target.value)}
                                                    placeholder="Share any comments regarding the work done, punctuality, or lasting quality..."
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submittingFeedback}
                                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                                            >
                                                {submittingFeedback ? (
                                                    <span>Submitting...</span>
                                                ) : (
                                                    <>
                                                        <Send size={14} />
                                                        <span>Submit Citizen Feedback</span>
                                                    </>
                                                )}
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

