import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, ZoomIn, X, MapPin, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { complaintsApi } from '../services/api';

const defaultShowcase = [
    {
        id: 'vemavaram-village',
        title: 'Vemavaram Village',
        desc: 'Aerial view and central community layout of Vemavaram Grama Panchayat',
        emoji: '🏘️',
        color: 'from-green-500 to-emerald-700',
        tag: 'Community',
        category: 'Village Overview'
    },
    {
        id: 'road-damage',
        title: 'Road Damage Issue',
        desc: 'Pothole and asphalt erosion complaints identified on Main Village Road',
        emoji: '🚧',
        color: 'from-orange-500 to-amber-600',
        tag: 'Infrastructure',
        category: 'Road Issues'
    },
    {
        id: 'streetlight-problem',
        title: 'Streetlight Problem',
        desc: 'Inspection and reporting of non-functional street lighting in residential lanes',
        emoji: '💡',
        color: 'from-amber-400 to-orange-500',
        tag: 'Electrical',
        category: 'Streetlight Issues'
    },
    {
        id: 'drainage-system',
        title: 'Drainage System',
        desc: 'Addressing blocked surface drainage channels to prevent monsoon water-logging',
        emoji: '💧',
        color: 'from-blue-500 to-cyan-600',
        tag: 'Sanitation',
        category: 'Drainage Problems'
    },
    {
        id: 'water-supply',
        title: 'Water Supply',
        desc: 'Monitoring overhead tank distribution pipelines and tap water availability',
        emoji: '🚿',
        color: 'from-cyan-500 to-blue-600',
        tag: 'Water Works',
        category: 'Water Supply Problems'
    },
    {
        id: 'mobile-app-ui',
        title: 'Mobile App UI',
        desc: 'VillageConnect citizen application for fast local complaint registration',
        emoji: '📱',
        color: 'from-purple-500 to-indigo-600',
        tag: 'Mobile Portal',
        category: 'Digital Governance'
    },
    {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        desc: 'Centralized Panchayat command console with live complaint tracking and heatmaps',
        emoji: '💻',
        color: 'from-indigo-500 to-purple-600',
        tag: 'Admin Console',
        category: 'Digital Governance'
    },
    {
        id: 'community-meeting',
        title: 'Community Meeting',
        desc: 'Citizen awareness and digital onboarding sessions conducted at Vemavaram',
        emoji: '🤝',
        color: 'from-teal-500 to-emerald-600',
        tag: 'Awareness',
        category: 'Community Engagement'
    },
];

export default function Gallery() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [liveItems, setLiveItems] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    // Fetch live complaints with verified Cloudinary photos from backend API
    useEffect(() => {
        let isMounted = true;
        const fetchGallery = async () => {
            try {
                setIsLoading(true);
                const res = await complaintsApi.getGallery({ limit: 12 });
                if (isMounted && res.data?.success && Array.isArray(res.data?.data?.items)) {
                    const formatted = res.data.data.items
                        .filter(item => item.image_url || item.resolution_image_url)
                        .map(item => ({
                            id: item.complaint_id,
                            title: item.title || `${item.category} Evidence`,
                            desc: item.description || `Reported at ${item.location}`,
                            emoji: item.category?.includes('Road') ? '🚧' :
                                   item.category?.includes('Light') ? '💡' :
                                   item.category?.includes('Water') ? '🚿' :
                                   item.category?.includes('Drainage') ? '💧' : '📋',
                            color: item.status === 'Resolved' ? 'from-emerald-500 to-teal-700' : 'from-orange-500 to-amber-700',
                            tag: item.status === 'Resolved' ? 'Resolved Issue' : 'Active Issue',
                            category: item.category,
                            location: item.location,
                            status: item.status,
                            imageUrl: item.resolution_image_url || item.image_url,
                            evidenceImageUrl: item.image_url,
                            resolutionImageUrl: item.resolution_image_url,
                            resolutionNotes: item.resolution_notes,
                            createdAt: item.created_at,
                            resolvedAt: item.resolved_at,
                            isLive: true,
                        }));
                    setLiveItems(formatted);
                }
            } catch {
                // Graceful fallback to default showcase cards if backend is loading or empty
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchGallery();
        return () => { isMounted = false; };
    }, []);

    // Combine live evidence with default project showcase items
    const allItems = [...liveItems, ...defaultShowcase];

    // Filter items based on selected tab
    const filteredItems = allItems.filter(item => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'live') return item.isLive;
        if (activeFilter === 'project') return !item.isLive;
        return item.category === activeFilter;
    });

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    return (
        <section id="gallery" className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
            {/* Background subtle decorative blobs */}
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 -right-48 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center space-x-1.5 bg-teal-50 text-teal-700 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-teal-100 shadow-sm">
                        <Sparkles size={14} className="text-teal-600" />
                        <span>Visual Evidence & Highlights</span>
                    </span>
                    <h2 className="section-title text-3xl sm:text-4xl font-extrabold text-navy-900 font-poppins">
                        Project Gallery
                    </h2>
                    <p className="section-subtitle max-w-2xl mx-auto text-gray-600 text-sm sm:text-base mt-3">
                        A visual record of verified citizen complaints, field resolution proofs, and
                        digital governance tools deployed across Vemavaram Village.
                    </p>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                activeFilter === 'all'
                                    ? 'bg-navy-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            All Items ({allItems.length})
                        </button>
                        {liveItems.length > 0 && (
                            <button
                                onClick={() => setActiveFilter('live')}
                                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                                    activeFilter === 'live'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Live Village Evidence ({liveItems.length})</span>
                            </button>
                        )}
                        <button
                            onClick={() => setActiveFilter('project')}
                            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                activeFilter === 'project'
                                    ? 'bg-navy-900 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            Project Showcase ({defaultShowcase.length})
                        </button>
                    </div>
                </motion.div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map((item, i) => {
                        const hasRealImage = Boolean(item.imageUrl && !imageErrors[item.id]);

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                onClick={() => setSelectedItem(item)}
                                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all flex flex-col"
                            >
                                {/* Media Box */}
                                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                                    {hasRealImage ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            loading="lazy"
                                            onError={() => handleImageError(item.id)}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${item.color} flex flex-col items-center justify-center p-6 text-white relative`}>
                                            <div
                                                className="absolute inset-0 opacity-15"
                                                style={{
                                                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
                                                    backgroundSize: '16px 16px',
                                                }}
                                            />
                                            <span className="text-5xl mb-2 drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                                                {item.emoji}
                                            </span>
                                            <span className="text-xs uppercase tracking-wider font-semibold text-white/80">
                                                {item.category || item.tag}
                                            </span>
                                        </div>
                                    )}

                                    {/* Hover overlay with zoom icon */}
                                    <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="bg-white/90 text-navy-900 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-200">
                                            <ZoomIn size={20} />
                                        </div>
                                    </div>

                                    {/* Tag Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md ${
                                            item.isLive
                                                ? item.status === 'Resolved'
                                                    ? 'bg-emerald-500/90 text-white'
                                                    : 'bg-orange-500/90 text-white'
                                                : 'bg-white/90 text-navy-900'
                                        }`}>
                                            {item.tag}
                                        </span>
                                    </div>

                                    {item.isLive && (
                                        <div className="absolute top-3 right-3">
                                            <span className="flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Details */}
                                <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                                    <div>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <h3 className="font-bold text-navy-900 text-sm font-poppins line-clamp-1 group-hover:text-orange-500 transition-colors">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {item.location && (
                                        <div className="flex items-center space-x-1 text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                                            <MapPin size={12} className="text-orange-500 flex-shrink-0" />
                                            <span className="truncate">{item.location}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Lightbox / Image Preview Modal */}
                <AnimatePresence>
                    {selectedItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedItem(null)}
                                className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', duration: 0.5 }}
                                className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col z-10"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl">{selectedItem.emoji}</span>
                                        <div>
                                            <h3 className="font-bold text-base sm:text-lg text-navy-900 font-poppins leading-tight">
                                                {selectedItem.title}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {selectedItem.category || selectedItem.tag}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        aria-label="Close modal"
                                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-navy-900 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Media Body */}
                                <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
                                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                                        {selectedItem.imageUrl && !imageErrors[selectedItem.id] ? (
                                            <img
                                                src={selectedItem.imageUrl}
                                                alt={selectedItem.title}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${selectedItem.color} flex flex-col items-center justify-center p-6 text-white`}>
                                                <span className="text-6xl mb-3">{selectedItem.emoji}</span>
                                                <span className="font-bold text-lg font-poppins">{selectedItem.title}</span>
                                                <span className="text-xs text-white/80 mt-1">{selectedItem.tag}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description and Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Overview
                                            </h4>
                                            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                                {selectedItem.desc}
                                            </p>
                                        </div>

                                        {/* Status / Location Meta if Live Complaint */}
                                        {selectedItem.isLive && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                                {selectedItem.location && (
                                                    <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                                                        <MapPin size={16} className="text-orange-500 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-medium text-navy-900">Location</div>
                                                            <div className="truncate">{selectedItem.location}</div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                                                    {selectedItem.status === 'Resolved' ? (
                                                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                                                    ) : (
                                                        <Clock size={16} className="text-orange-500 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-navy-900">Status</div>
                                                        <div>{selectedItem.status}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedItem.resolutionNotes && (
                                            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800">
                                                <span className="font-semibold block mb-0.5">Resolution Notes:</span>
                                                {selectedItem.resolutionNotes}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-xl shadow transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
