import { motion } from 'framer-motion';
import { Brain, Wifi, Map, QrCode, Mic, MessageCircle, Phone, TrendingUp, Globe } from 'lucide-react';

const futureItems = [
    { icon: Brain, title: 'AI Complaint Classification', desc: 'Automatic categorization and priority scoring of complaints using NLP models', color: 'from-purple-500 to-purple-700', tag: 'AI/ML' },
    { icon: Wifi, title: 'Offline Mode Support', desc: 'Submit complaints even without internet; sync automatically when connected', color: 'from-blue-500 to-blue-700', tag: 'Connectivity' },
    { icon: Map, title: 'GIS Mapping Integration', desc: 'Visual heatmap of complaint locations across the entire village geography', color: 'from-emerald-500 to-emerald-700', tag: 'Geospatial' },
    { icon: QrCode, title: 'QR Complaint Registration', desc: 'Scan a QR code at issue location to instantly pre-fill location data', color: 'from-gray-600 to-gray-800', tag: 'Innovation' },
    { icon: Mic, title: 'Voice-Based Complaints', desc: 'Register complaints through voice commands for illiterate or elderly users', color: 'from-red-500 to-red-700', tag: 'Accessibility' },
    { icon: MessageCircle, title: 'WhatsApp Notifications', desc: 'Receive complaint status updates directly through WhatsApp messaging', color: 'from-green-500 to-green-700', tag: 'Integration' },
    { icon: Phone, title: 'SMS Alert System', desc: 'Fallback notification system via SMS for users without smartphones', color: 'from-orange-500 to-orange-700', tag: 'Inclusive' },
    { icon: TrendingUp, title: 'Predictive Analytics', desc: 'Forecast issue hotspots and seasonal patterns using historical data', color: 'from-cyan-500 to-cyan-700', tag: 'Analytics' },
    { icon: Globe, title: 'Multilingual Support', desc: 'Telugu, Hindi, and English language support for broader accessibility', color: 'from-indigo-500 to-indigo-700', tag: 'Regional' },
];

export default function FutureScope() {
    return (
        <section id="future" className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-indigo-100">
                        What's Next
                    </span>
                    <h2 className="section-title">Future Scope</h2>
                    <p className="section-subtitle">
                        Our roadmap includes 9 planned enhancements that will make this platform even more
                        powerful, accessible, and intelligent for every citizen of Vemavaram.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {futureItems.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all border border-gray-100 group"
                        >
                            <div className="flex items-start space-x-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                                >
                                    <item.icon className="text-white" size={20} />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-gray-800 text-sm font-poppins">{item.title}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full ml-2 flex-shrink-0">{item.tag}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>

                            {/* Hover bar */}
                            <div className={`mt-4 w-0 h-0.5 bg-gradient-to-r ${item.color} group-hover:w-full transition-all duration-500 rounded-full`} />
                        </motion.div>
                    ))}
                </div>

                {/* Roadmap bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 bg-gradient-to-r from-navy-900 to-emerald-700 rounded-2xl p-6 text-white text-center"
                >
                    <div className="text-lg font-bold font-poppins mb-1">🚀 Phase 2 Development Planned for 2025-26</div>
                    <div className="text-white/70 text-sm">
                        These features will be implemented in the next phase of this community service project, pending approval and funding.
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
