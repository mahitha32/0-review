import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertCircle, CheckCircle, Upload, X, MapPin, Tag, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { complaintsApi, extractErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_CATEGORIES = [
    'Road Issues',
    'Streetlight Issues',
    'Water Supply Problems',
    'Drainage Problems',
    'Garbage Collection Issues',
    'Sanitation Issues',
];

const WARDS = [1, 2, 3, 4, 5];

export default function SubmitComplaintForm({ onSuccess, onNeedLogin, onVerifyResidency }) {
    const { isAuthenticated, user } = useAuth();

    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
    const [description, setDescription] = useState('');
    const [wardId, setWardId] = useState(user?.residency_ward_id ? String(user.residency_ward_id) : '1');
    const [location, setLocation] = useState(user?.residency_address || '');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submittedComplaint, setSubmittedComplaint] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await complaintsApi.getCategories();
                if (res.data?.data?.categories) {
                    setCategories(res.data.data.categories);
                    setCategory(res.data.data.categories[0]);
                }
            } catch {
                // Keep default categories
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG, WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image file size must be less than 5MB.');
            return;
        }

        setError('');
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isAuthenticated) {
            if (onNeedLogin) onNeedLogin();
            return;
        }

        const trimmedTitle = title.trim();
        const trimmedDesc = description.trim();
        const trimmedLoc = location.trim();

        if (!trimmedTitle || trimmedTitle.length < 5) {
            setError('Please provide a meaningful complaint title (minimum 5 characters).');
            return;
        }
        if (!trimmedDesc || trimmedDesc.length < 20) {
            setError('Please provide a detailed description (minimum 20 characters) so field workers can locate and resolve the issue.');
            return;
        }
        if (!trimmedLoc) {
            setError('Please specify the location or landmark in Vemavaram.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', trimmedTitle);
            formData.append('category', category);
            formData.append('description', trimmedDesc);
            formData.append('ward_id', wardId);
            formData.append('location', trimmedLoc);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await complaintsApi.create(formData);
            const created = res.data?.data;
            setSubmittedComplaint(created);
            if (onSuccess) onSuccess(created);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setImageFile(null);
        setImagePreview(null);
        setSubmittedComplaint(null);
        setError('');
    };

    // If submitted successfully, show confirmation screen with Complaint ID
    if (submittedComplaint) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center max-w-xl mx-auto"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} />
                </div>
                <h3 className="text-2xl font-bold font-poppins text-navy-900 mb-1">Complaint Registered!</h3>
                <p className="text-gray-500 text-sm mb-4">
                    Your complaint has been assigned a unique reference ID and submitted to Vemavaram Village authorities.
                </p>

                {submittedComplaint.is_duplicate_suspect && (
                    <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-900">
                        <div className="flex items-center space-x-1.5 font-bold mb-1 text-amber-800">
                            <AlertCircle size={15} className="text-amber-600" />
                            <span>Possible Duplicate Notice</span>
                        </div>
                        <p>
                            A similar issue was recently reported in this area (Reference: <strong>{submittedComplaint.duplicate_of_id}</strong>).
                            Our Panchayat team has cross-linked these to optimize response and prevent duplicate fieldwork.
                        </p>
                    </div>
                )}

                <div className="bg-navy-50/70 border border-navy-100 rounded-2xl p-4 mb-6">
                    <span className="text-xs uppercase tracking-wider text-navy-600 font-bold block mb-1">Unique Complaint ID</span>
                    <span className="text-2xl font-bold font-poppins text-navy-900 tracking-wider">
                        {submittedComplaint.complaint_id}
                    </span>
                    <div className="mt-2 text-xs text-gray-500 flex items-center justify-center space-x-3">
                        <span>Category: <strong className="text-gray-700">{submittedComplaint.category}</strong></span>
                        <span>•</span>
                        <span>
                            {submittedComplaint.is_verified_resident ? (
                                <span className="text-emerald-700 font-bold">✓ Verified Resident Submission</span>
                            ) : (
                                <span className="text-gray-600">Standard Submission</span>
                            )}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={resetForm}
                        className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl text-sm transition-all"
                    >
                        Report Another Issue
                    </button>
                    {onSuccess && (
                        <button
                            onClick={() => onSuccess(submittedComplaint)}
                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-1"
                        >
                            <span>Track Status</span>
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 max-w-2xl mx-auto">
            <div className="mb-5">
                <span className="inline-block bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                    Vemavaram Citizen Portal
                </span>
                <h3 className="text-2xl font-bold font-poppins text-navy-900">Report a Village Issue</h3>
                <p className="text-gray-500 text-sm mt-1">
                    Fill out the form below. Your complaint will be routed to the respective ward department with automated SLA tracking.
                </p>
            </div>

            {/* Residency Status Indicator Banner */}
            {isAuthenticated && (
                user?.residency_status === 'verified' ? (
                    <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-900">
                        <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
                        <div>
                            <span className="font-bold">Posting as Verified Resident (Ward {user.residency_ward_id || wardId}):</span> Your report is prioritized by village workers.
                        </div>
                    </div>
                ) : (
                    <div className="mb-5 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs text-gray-700">
                        <div className="flex items-center space-x-2">
                            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                            <span>Posting as Unverified Citizen (verification pending).</span>
                        </div>
                        {onVerifyResidency && (
                            <button
                                type="button"
                                onClick={onVerifyResidency}
                                className="text-orange-600 font-bold hover:underline ml-2 whitespace-nowrap"
                            >
                                Verify Residency →
                            </button>
                        )}
                    </div>
                )
            )}

            {!isAuthenticated && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-amber-800 text-sm">
                        <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
                        <span>Please log in or register with your mobile number to file an official complaint.</span>
                    </div>
                    <button
                        type="button"
                        onClick={onNeedLogin}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex-shrink-0 transition-colors shadow-sm ml-3"
                    >
                        Login / Register
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start space-x-2">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Issue Category & Ward */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center space-x-1">
                            <Tag size={14} className="text-orange-500" />
                            <span>Issue Category *</span>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-300"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center space-x-1">
                            <MapPin size={14} className="text-emerald-500" />
                            <span>Ward Number *</span>
                        </label>
                        <select
                            value={wardId}
                            onChange={(e) => setWardId(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy-300"
                        >
                            {WARDS.map((w) => (
                                <option key={w} value={w}>
                                    Ward {w} (Vemavaram)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Complaint Title */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center space-x-1">
                        <FileText size={14} className="text-blue-500" />
                        <span>Brief Title * (min. 5 characters)</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Broken drinking water pipeline near Ramalayam street"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                    />
                </div>

                {/* Detailed Description */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                            Detailed Description * (min. 20 characters)
                        </label>
                        <span className={`text-[11px] font-semibold ${description.trim().length >= 20 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {description.trim().length} / 20 min characters
                        </span>
                    </div>
                    <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue in detail: when did it start, exact spot, how it impacts the residents..."
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 resize-none"
                    />
                </div>

                {/* Location / Landmark */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center space-x-1">
                        <MapPin size={14} className="text-red-500" />
                        <span>Exact Location / Street / Landmark in Vemavaram *</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Near Ramalayam Temple, Street 2, Vemavaram"
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300"
                    />
                </div>

                {/* Photo Upload with Cloudinary Support */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center space-x-1">
                        <Camera size={14} className="text-navy-700" />
                        <span>Photo Evidence (Optional, max 5MB)</span>
                    </label>

                    {imagePreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="border-2 border-dashed border-gray-300 hover:border-navy-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 hover:bg-gray-50">
                            <Upload className="text-gray-400 mb-2" size={28} />
                            <span className="text-sm font-semibold text-gray-700">Click to upload photo evidence</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP up to 5MB</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={loading}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting Complaint & Checking Quality...</span>
                        </div>
                    ) : (
                        <span>Submit Official Complaint →</span>
                    )}
                </motion.button>
            </form>
        </div>
    );
}
