import { motion } from 'framer-motion';
import { AlertCircle, ChevronDown, Shield, Users, Star } from 'lucide-react';

const floatingBadges = [
    { icon: Shield, label: 'Secure & Verified', color: 'from-blue-500 to-blue-600', x: 'left-4', y: 'top-24' },
    { icon: Users, label: '500+ Citizens Served', color: 'from-emerald-500 to-emerald-600', x: 'right-4', y: 'top-28' },
    { icon: Star, label: '4.8 Satisfaction Rate', color: 'from-orange-400 to-orange-500', x: 'left-4', y: 'bottom-32' },
];

export default function Hero() {
    const scrollTo = (id) => {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-600/80" />

            {/* Animated Circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-white/10"
                        style={{
                            width: `${(i + 1) * 200}px`,
                            height: `${(i + 1) * 200}px`,
                            left: '60%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }}
                    />
                ))}

                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`p-${i}`}
                        className="absolute rounded-full bg-white/20"
                        style={{
                            width: Math.random() * 6 + 2,
                            height: Math.random() * 6 + 2,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 1, 0.2],
                        }}
                        transition={{
                            duration: Math.random() * 4 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-poppins"
                        >
                            Complaint{' '}
                            <span className="text-orange-400">Redressal</span>{' '}
                            System for{' '}
                            <span className="text-emerald-400">Village Issues</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl"
                        >
                            A Smart Digital Governance Platform designed to simplify complaint registration, improve transparency, and strengthen communication between citizens and local authorities in <span className="text-orange-300 font-semibold">Vemavaram Village</span>.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mt-8 flex flex-wrap gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => scrollTo('#contact')}
                                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-2xl hover:shadow-orange-500/40 glow"
                            >
                                <AlertCircle size={20} />
                                <span>Report Complaint</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => scrollTo('#about')}
                                className="flex items-center space-x-2 border-2 border-white/50 text-white hover:bg-white hover:text-navy-900 font-semibold px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm"
                            >
                                <span>Learn More</span>
                                <ChevronDown size={18} />
                            </motion.button>
                        </motion.div>

                        {/* Stats row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="mt-12 grid grid-cols-3 gap-6"
                        >
                            {[
                                { value: '120+', label: 'Complaints Resolved' },
                                { value: '98%', label: 'Satisfaction Rate' },
                                { value: '24hrs', label: 'Avg Resolution' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl font-bold text-white font-poppins">{stat.value}</div>
                                    <div className="text-white/60 text-xs mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right — Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative flex items-center justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative"
                        >
                            {/* Phone frame */}
                            <div className="relative w-64 h-[520px] md:w-72 md:h-[580px] mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-700">
                                    {/* Notch */}
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-10" />

                                    {/* Screen */}
                                    <div className="absolute inset-2 bg-gradient-to-b from-navy-900 to-navy-800 rounded-[2.5rem] overflow-hidden">
                                        {/* App Header */}
                                        <div className="bg-navy-900 pt-8 pb-3 px-4">
                                            <div className="text-white font-semibold text-sm font-poppins">VillageConnect</div>
                                            <div className="text-white/60 text-xs mt-0.5">File a Complaint</div>
                                        </div>

                                        {/* App Content */}
                                        <div className="px-3 py-3 space-y-2">
                                            {/* Form fields */}
                                            {['Issue Type', 'Location', 'Description'].map((field) => (
                                                <div key={field} className="bg-white/10 rounded-xl px-3 py-2">
                                                    <div className="text-white/50 text-xs">{field}</div>
                                                    <div className="text-white text-xs mt-1 font-medium">
                                                        {field === 'Issue Type' ? 'Road Damage' : field === 'Location' ? 'Vemavaram Main St.' : 'Potholes causing...'}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Photo upload */}
                                            <div className="bg-white/10 rounded-xl p-3 border-2 border-dashed border-white/20 text-center">
                                                <div className="text-white/50 text-xs">📷 Add Photo Evidence</div>
                                            </div>

                                            {/* Status badges */}
                                            <div className="flex gap-2 flex-wrap">
                                                {[{ label: 'Submitted', color: 'bg-blue-500' }, { label: 'In Progress', color: 'bg-orange-500' }, { label: 'Resolved', color: 'bg-green-500' }].map((s) => (
                                                    <span key={s.label} className={`${s.color} text-white text-xs px-2 py-1 rounded-full`}>{s.label}</span>
                                                ))}
                                            </div>

                                            {/* Submit */}
                                            <motion.button
                                                animate={{ scale: [1, 1.03, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-full bg-orange-500 text-white font-bold text-sm py-3 rounded-xl"
                                            >
                                                Submit Complaint →
                                            </motion.button>

                                            {/* Complaint list */}
                                            {[
                                                { id: '#VEM-101', type: 'Drainage', status: 'Resolved', color: 'bg-green-100 text-green-700' },
                                                { id: '#VEM-102', type: 'Streetlight', status: 'Pending', color: 'bg-orange-100 text-orange-700' },
                                            ].map((c) => (
                                                <div key={c.id} className="bg-white/5 rounded-xl px-3 py-2 flex justify-between items-center">
                                                    <div>
                                                        <div className="text-white text-xs font-medium">{c.id}</div>
                                                        <div className="text-white/50 text-xs">{c.type}</div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.color}`}>{c.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating info cards */}
                            <motion.div
                                animate={{ x: [-5, 5, -5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -left-8 top-16 bg-white rounded-2xl shadow-2xl p-3 flex items-center space-x-2 min-w-max"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg">✅</div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-800">Complaint Resolved!</div>
                                    <div className="text-xs text-gray-500">Road repair completed</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ x: [5, -5, 5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -right-8 bottom-24 bg-white rounded-2xl shadow-2xl p-3 flex items-center space-x-2 min-w-max"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">🔔</div>
                                <div>
                                    <div className="text-xs font-semibold text-gray-800">New Assignment</div>
                                    <div className="text-xs text-gray-500">Worker assigned to #VEM-103</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center cursor-pointer"
                onClick={() => scrollTo('#about')}
            >
                <span className="text-xs mb-2">Scroll Down</span>
                <ChevronDown size={20} />
            </motion.div>
        </section>
    );
}
