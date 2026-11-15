import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle, Clock, AlertCircle, MapPin, Calendar, Camera, Wrench, Star } from 'lucide-react';
import { complaintsApi, extractErrorMessage } from '../../services/api';

const STATUS_STEPS = [
    { key: 'Submitted', label: 'Submitted' },
    { key: 'Under Review', label: 'Under Review' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' },
];

export default function TrackModal({ isOpen, onClose, initialComplaintId = '' }) {
    const [searchId, setSearchId] = useState(initialComplaintId);
    const [loading, setLoading] = useState(false);
    const [complaint, setComplaint] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        const trimmed = searchId.trim().toUpperCase();
        if (!trimmed) {
            setError('Please enter a Complaint ID (e.g. CMP2026001)');
            return;
        }

        setLoading(true);
        setError('');
        setComplaint(null);

        try {
            const res = await complaintsApi.trackPublic(trimmed);
            if (res.data?.data) {
                setComplaint(res.data.data);
            } else {
                setError('No complaint details returned.');
            }
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusStepIndex = (status) => {
        if (!status) return 0;
        if (status === 'Rejected') return -1;
        const index = STATUS_STEPS.findIndex(s => s.key.toLowerCase() === status.toLowerCase());
        return index >= 0 ? index : 0;
    };

    const currentStep = complaint ? getStatusStepIndex(complaint.status) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-navy-950/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-t-3xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Search className="text-orange-400" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold font-poppins text-lg">Track Complaint Status</h3>
                            <p className="text-white/60 text-xs">Vemavaram Village Public Redressal Tracker</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter Complaint ID (e.g. CMP2026001)"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-300 uppercase tracking-wider"
                            />
                            <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center space-x-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Track</span>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Complaint Details View */}
                <div className="p-6 flex-1">
                    {!complaint && !loading && !error && (
                        <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">Enter your complaint reference ID above to inspect live resolution progress.</p>
                            <p className="text-xs text-gray-400 mt-1">Example: CMP2026001</p>
                        </div>
                    )}

                    {complaint && (
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-navy-50/50 rounded-2xl border border-navy-100">
                                <div>
                                    <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Complaint Reference</span>
                                    <div className="text-xl font-bold font-poppins text-navy-900 mt-0.5">{complaint.complaint_id}</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 font-medium">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        complaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                        complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                        complaint.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                                        complaint.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {complaint.status}
                                    </span>
                                </div>
                            </div>

                            {/* Stepper Progress */}
                            {complaint.status !== 'Rejected' ? (
                                <div className="py-2">
                                    <div className="flex items-center justify-between relative">
                                        <div className="absolute left-6 right-6 top-4 h-1 bg-gray-200 -z-0">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-500"
                                                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                                            />
                                        </div>
                                        {STATUS_STEPS.map((step, idx) => {
                                            const isDone = idx <= currentStep;
                                            const isCurrent = idx === currentStep;
                                            return (
                                                <div key={step.key} className="flex flex-col items-center relative z-10 text-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                        isDone ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-200 text-gray-500'
                                                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                                                        {isDone ? '✓' : idx + 1}
                                                    </div>
                                                    <span className={`text-[10px] mt-2 font-medium max-w-[70px] ${
                                                        isCurrent ? 'text-navy-900 font-bold' : isDone ? 'text-gray-700' : 'text-gray-400'
                                                    }`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    This complaint has been reviewed and marked as rejected by village administration.
                                </div>
                            )}

                            {/* Issue Details Grid */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                                    <div className="text-xs text-gray-500 font-medium">Issue Category & Ward</div>
                                    <div className="text-sm font-semibold text-navy-900">{complaint.category}</div>
                                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                                        <MapPin size={13} className="text-orange-500" />
                                        <span>Ward {complaint.ward_id || 'General'}, Vemavaram Village</span>
                                    </div>
                                    <div className="text-xs text-gray-500 pt-1">
                                        Location: <span className="text-gray-700 font-medium">{complaint.location}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                                    <div className="text-xs text-gray-500 font-medium">Timeline & Priority</div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                            Priority: {complaint.priority || 'Normal'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                                        <Calendar size={13} className="text-blue-500" />
                                        <span>Submitted: {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'N/A'}</span>
                                    </div>
                                    {complaint.resolved_at && (
                                        <div className="text-xs text-emerald-700 font-medium flex items-center space-x-1">
                                            <CheckCircle size={13} />
                                            <span>Resolved: {new Date(complaint.resolved_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">{complaint.title}</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-line">{complaint.description}</p>
                            </div>

                            {/* Citizen Upload Photo */}
                            {complaint.image_url && (
                                <div>
                                    <div className="text-xs font-bold text-gray-600 mb-2 flex items-center space-x-1">
                                        <Camera size={14} className="text-navy-700" />
                                        <span>Citizen Evidence Photograph</span>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-64 bg-gray-900 flex items-center justify-center">
                                        <img
                                            src={complaint.image_url}
                                            alt="Citizen Complaint Evidence"
                                            className="w-full h-auto max-h-64 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Assigned Department / Worker */}
                            {complaint.assignment && (
                                <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl">
                                    <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                                        <Wrench size={16} />
                                        <span>Field Work Details</span>
                                    </div>
                                    <div className="text-xs text-purple-700 mt-1">
                                        Assigned Department: <span className="font-semibold">{complaint.assignment.department || 'Sanitation & Works'}</span>
                                    </div>
                                    {complaint.assignment.resolution_notes && (
                                        <div className="mt-2 text-xs bg-white p-3 rounded-xl border border-purple-100 text-gray-700">
                                            <span className="font-bold text-navy-900">Worker Completion Remarks: </span>
                                            {complaint.assignment.resolution_notes}
                                        </div>
                                    )}
                                    {complaint.assignment.resolution_image && (
                                        <div className="mt-3">
                                            <span className="text-xs font-semibold text-purple-900 block mb-1">Resolution Proof Photo:</span>
                                            <div className="rounded-xl overflow-hidden border border-purple-200 max-h-48 bg-gray-900 flex items-center justify-center">
                                                <img
                                                    src={complaint.assignment.resolution_image}
                                                    alt="Resolution Proof"
                                                    className="w-full h-auto max-h-48 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Feedback score if already provided */}
                            {complaint.feedback && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-amber-900">Citizen Satisfaction Feedback</span>
                                        {complaint.feedback.remarks && (
                                            <p className="text-xs text-amber-800 mt-0.5 italic">"{complaint.feedback.remarks}"</p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1 text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < complaint.feedback.rating ? 'currentColor' : 'none'}
                                                className={i < complaint.feedback.rating ? 'text-amber-500' : 'text-amber-200'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

