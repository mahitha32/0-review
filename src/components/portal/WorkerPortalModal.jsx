import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Wrench, Lock, Phone, CheckCircle, Clock, AlertCircle,
    Camera, MapPin, Calendar, Upload, RefreshCw, LogOut, ArrowRight
} from 'lucide-react';
import { authApi, workersApi, extractErrorMessage } from '../../services/api';

export default function WorkerPortalModal({ isOpen, onClose }) {
    const [worker, setWorker] = useState(null);
    const [token, setToken] = useState(null);

    // Login form state
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Tasks state
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    // Selected task for resolution action
    const [resolvingTask, setResolvingTask] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolutionPhoto, setResolutionPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    useEffect(() => {
        // Check if worker session is active
        const storedToken = localStorage.getItem('worker_access_token');
        const storedWorker = localStorage.getItem('worker_user');
        if (storedToken && storedWorker) {
            try {
                setToken(storedToken);
                setWorker(JSON.parse(storedWorker));
            } catch {
                localStorage.removeItem('worker_user');
            }
        }
    }, [isOpen]);

    const fetchTasks = async () => {
        setTasksLoading(true);
        try {
            const res = await workersApi.getTasks();
            if (res.data?.data?.tasks) {
                setTasks(res.data.data.tasks);
            }
        } catch (err) {
            console.error('Failed to load tasks', err);
        } finally {
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        if (worker && isOpen) {
            fetchTasks();
        }
    }, [worker, isOpen]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        const cleanMobile = mobile.replace(/\D/g, '');
        if (cleanMobile.length < 10) {
            setLoginError('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (!password) {
            setLoginError('Please enter your password.');
            return;
        }

        setLoginLoading(true);
        try {
            const res = await authApi.workerLogin({ mobile: cleanMobile, password });
            const data = res.data?.data;
            if (data?.access_token) {
                localStorage.setItem('worker_access_token', data.access_token);
                localStorage.setItem('worker_user', JSON.stringify(data.user));
                setToken(data.access_token);
                setWorker(data.user);
            }
        } catch (err) {
            setLoginError(extractErrorMessage(err));
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('worker_access_token');
        localStorage.removeItem('worker_user');
        setWorker(null);
        setToken(null);
        setTasks([]);
    };

    const handleStartWork = async (complaintId) => {
        setActionError('');
        setActionSuccess('');
        try {
            await workersApi.updateProgress(complaintId, {
                status: 'In Progress',
                notes: 'Work started on site by field worker.'
            });
            setActionSuccess(`Task ${complaintId} marked as In Progress.`);
            fetchTasks();
        } catch (err) {
            setActionError(extractErrorMessage(err));
        }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setActionError('Please select an image file (PNG, JPG, WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setActionError('Photo size must be less than 5MB.');
            return;
        }
        setActionError('');
        setResolutionPhoto(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmitResolution = async (e) => {
        e.preventDefault();
        if (!resolvingTask) return;
        setActionError('');
        setActionSuccess('');

        if (!resolutionPhoto) {
            setActionError('Resolution photograph evidence is mandatory to resolve this issue.');
            return;
        }
        if (!resolutionNotes.trim()) {
            setActionError('Completion remarks explaining the work done are mandatory.');
            return;
        }

        setUpdatingStatus(true);
        try {
            const formData = new FormData();
            formData.append('status', 'Resolved');
            formData.append('notes', resolutionNotes.trim());
            formData.append('resolution_photo', resolutionPhoto);

            await workersApi.updateProgress(resolvingTask.complaint_id, formData);
            setActionSuccess(`Task ${resolvingTask.complaint_id} resolved and proof photo uploaded successfully!`);
            setResolvingTask(null);
            setResolutionPhoto(null);
            setPhotoPreview(null);
            setResolutionNotes('');
            fetchTasks();
        } catch (err) {
            setActionError(extractErrorMessage(err));
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (!isOpen) return null;

    const filteredTasks = statusFilter === 'All'
        ? tasks
        : tasks.filter(t => t.status?.toLowerCase() === statusFilter.toLowerCase());

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-navy-950/75 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-gray-100 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white rounded-t-3xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                            <Wrench size={22} />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold font-poppins">Field Worker Portal</h3>
                                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Vemavaram Staff
                                </span>
                            </div>
                            <p className="text-white/80 text-xs mt-0.5">
                                {worker ? `${worker.name} • ${worker.department || 'Field Services'}` : 'Task Management & Proof of Resolution'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {worker && (
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                    {!worker ? (
                        /* Worker Login Form */
                        <div className="max-w-md mx-auto py-8">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                                    <Wrench size={28} />
                                </div>
                                <h4 className="text-xl font-bold font-poppins text-navy-900">Worker Authentication</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter your registered staff mobile and password to access your field tasks.
                                </p>
                            </div>

                            {loginError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <span>{loginError}</span>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                        Staff Mobile Number *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            required
                                            placeholder="10-digit mobile number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            disabled={loginLoading}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loginLoading}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        />
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
                                >
                                    {loginLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span>Sign In to Field Tasks</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Authenticated Worker Dashboard */
                        <div className="space-y-6">
                            {actionSuccess && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
                                    <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                                    <span>{actionSuccess}</span>
                                </div>
                            )}

                            {actionError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2">
                                    <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                                    <span>{actionError}</span>
                                </div>
                            )}

                            {/* Filters Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100">
                                <div className="flex gap-1.5 flex-wrap">
                                    {['All', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                                        <button
                                            key={st}
                                            onClick={() => setStatusFilter(st)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                statusFilter === st
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {st}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={fetchTasks}
                                    className="text-xs text-orange-700 font-semibold flex items-center space-x-1 hover:underline"
                                >
                                    <RefreshCw size={12} className={tasksLoading ? 'animate-spin' : ''} />
                                    <span>Refresh Queue</span>
                                </button>
                            </div>

                            {/* Tasks List */}
                            {tasksLoading ? (
                                <div className="py-12 text-center text-gray-400">
                                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-xs font-medium">Loading your field task queue...</span>
                                </div>
                            ) : filteredTasks.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <CheckCircle size={40} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm font-semibold text-gray-700">No active tasks in this view</p>
                                    <p className="text-xs text-gray-400 mt-1">All assigned complaints are up to date.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTasks.map((t) => (
                                        <div
                                            key={t.complaint_id}
                                            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all space-y-3"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs font-bold text-navy-900 font-poppins">{t.complaint_id}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs font-semibold text-orange-600">{t.category}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">Ward {t.ward_id || '1'}</span>
                                                </div>

                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                    t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {t.status}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-sm text-navy-900">{t.title}</h4>
                                            <p className="text-xs text-gray-600">{t.description}</p>

                                            <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-500 pt-1">
                                                <div className="flex items-center space-x-1">
                                                    <MapPin size={13} className="text-red-500 flex-shrink-0" />
                                                    <span><strong>Location:</strong> {t.location}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Phone size={13} className="text-emerald-500 flex-shrink-0" />
                                                    <span><strong>Complainant:</strong> {t.citizen_name || 'Resident'} ({t.citizen_mobile})</span>
                                                </div>
                                            </div>

                                            {/* Original Evidence Photo if citizen attached one */}
                                            {t.image_url && (
                                                <div className="pt-2">
                                                    <span className="text-[11px] font-bold text-gray-500 block mb-1">Citizen Problem Photograph:</span>
                                                    <img
                                                        src={t.image_url}
                                                        alt="Problem"
                                                        className="w-32 h-20 object-cover rounded-xl border border-gray-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            {t.status !== 'Resolved' && (
                                                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                                                    {t.status === 'Assigned' && (
                                                        <button
                                                            onClick={() => handleStartWork(t.complaint_id)}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center space-x-1.5"
                                                        >
                                                            <span>Mark In Progress</span>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => { setResolvingTask(t); setActionError(''); setActionSuccess(''); }}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center space-x-1.5"
                                                    >
                                                        <Camera size={14} />
                                                        <span>Upload Proof & Mark Resolved</span>
                                                    </button>
                                                </div>
                                            )}

                                            {t.status === 'Resolved' && t.resolution_image_url && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <span className="text-[11px] font-bold text-emerald-700 block mb-1">Uploaded Resolution Proof:</span>
                                                    <img
                                                        src={t.resolution_image_url}
                                                        alt="Proof"
                                                        className="w-32 h-20 object-cover rounded-xl border border-emerald-200"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Resolution Modal */}
                            {resolvingTask && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
                                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl space-y-4">
                                        <div className="flex items-center justify-between border-b pb-3">
                                            <div>
                                                <h4 className="font-bold text-navy-900 font-poppins">Submit Resolution Proof</h4>
                                                <p className="text-xs text-gray-500">Task: {resolvingTask.complaint_id}</p>
                                            </div>
                                            <button
                                                onClick={() => setResolvingTask(null)}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <form onSubmit={handleSubmitResolution} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center space-x-1">
                                                    <Camera size={14} className="text-emerald-600" />
                                                    <span>Mandatory Resolution Photograph *</span>
                                                </label>

                                                {photoPreview ? (
                                                    <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40 bg-gray-900 flex items-center justify-center">
                                                        <img src={photoPreview} alt="Preview" className="h-full w-auto object-contain" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setResolutionPhoto(null); setPhotoPreview(null); }}
                                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-gray-50 transition-all">
                                                        <Upload size={24} className="text-gray-400 mb-1" />
                                                        <span className="text-xs font-bold text-gray-700">Click to capture / attach proof photo</span>
                                                        <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, or WEBP up to 5MB</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            required
                                                            onChange={handlePhotoSelect}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                                                    Completion Remarks *
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    required
                                                    value={resolutionNotes}
                                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                                    placeholder="Explain the work performed (e.g. pipe replaced, leak tested, debris cleared)..."
                                                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                                                />
                                            </div>

                                            <div className="flex gap-2 justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setResolvingTask(null)}
                                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={updatingStatus}
                                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
                                                >
                                                    {updatingStatus ? (
                                                        <span>Uploading Proof…</span>
                                                    ) : (
                                                        <span>Confirm & Mark Resolved</span>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
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
