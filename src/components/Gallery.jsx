import { motion } from 'framer-motion';
import { Image } from 'lucide-react';

const galleryItems = [
    { title: 'Vemavaram Village', desc: 'Aerial view of our village community', emoji: '🏘️', color: 'from-green-400 to-emerald-600' },
    { title: 'Road Damage Issue', desc: 'Pothole complaints from Main Street', emoji: '🚧', color: 'from-orange-400 to-red-500' },
    { title: 'Streetlight Problem', desc: 'Non-functional street lighting areas', emoji: '💡', color: 'from-yellow-400 to-orange-500' },
    { title: 'Drainage System', desc: 'Blocked drainage causing water-logging', emoji: '💧', color: 'from-blue-400 to-cyan-600' },
    { title: 'Water Supply', desc: 'Water distribution infrastructure', emoji: '🚿', color: 'from-cyan-400 to-blue-600' },
    { title: 'Mobile App UI', desc: 'VillageConnect flutter application', emoji: '📱', color: 'from-purple-400 to-indigo-600' },
    { title: 'Admin Dashboard', desc: 'React-based complaint management panel', emoji: '💻', color: 'from-indigo-400 to-purple-600' },
    { title: 'Community Meeting', desc: 'Citizen awareness & onboarding session', emoji: '🤝', color: 'from-teal-400 to-emerald-600' },
];

export default function Gallery() {
    return (
        <section id="gallery" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-teal-100">
                        Visual Evidence
                    </span>
                    <h2 className="section-title">Project Gallery</h2>
                    <p className="section-subtitle">
                        A visual overview of the issues addressed, app screens, and community engagement activities
                        as part of this digital governance initiative.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryItems.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                            className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover transition-all"
                            style={{ aspectRatio: '1' }}
                        >
                            {/* Gradient background as placeholder */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />

                            {/* Pattern overlay */}
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                }}
                            />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                                <span className="text-4xl mb-3">{item.emoji}</span>
                                <div className="font-bold text-sm text-center font-poppins">{item.title}</div>
                                <div className="text-white/70 text-xs text-center mt-1 leading-tight">{item.desc}</div>
                            </div>

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                                    <Image className="text-white" size={20} />
                                </div>
                            </div>

                            {/* Replace label */}
                            <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                Replace
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm text-gray-400 mt-6"
                >
                    💡 All gallery placeholders are replaceable with actual project photos
                </motion.p>
            </div>
        </section>
    );
}
