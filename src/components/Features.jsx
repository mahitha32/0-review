import { motion } from 'framer-motion';
import {
    FileText, Camera, Activity, LayoutDashboard,
    UserCheck, ImagePlus, ThumbsUp, Bell,
} from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: 'Complaint Registration',
        description: 'Citizens can easily submit civic issues with a detailed description through the mobile app with a simple, intuitive interface.',
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        tag: 'Core Feature',
    },
    {
        icon: Camera,
        title: 'Photo Evidence',
        description: 'Attach high-quality photographs directly while reporting, providing visual proof and faster assessment of the complaint.',
        color: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50',
        tag: 'Evidence',
    },
    {
        icon: Activity,
        title: 'Complaint Tracking',
        description: 'Monitor your complaint status in real-time — from submission to resolution — with instant push notification updates.',
        color: 'from-cyan-500 to-cyan-600',
        bg: 'bg-cyan-50',
        tag: 'Real-Time',
    },
    {
        icon: LayoutDashboard,
        title: 'Admin Dashboard',
        description: 'Local authorities access a powerful React-based dashboard to monitor, filter, and manage all incoming complaints efficiently.',
        color: 'from-navy-700 to-navy-900',
        bg: 'bg-blue-50',
        tag: 'Governance',
    },
    {
        icon: UserCheck,
        title: 'Worker Assignment',
        description: 'Admins can digitally assign complaints to the appropriate maintenance workers with real-time task notifications.',
        color: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        tag: 'Management',
    },
    {
        icon: ImagePlus,
        title: 'Resolution Proof',
        description: 'Workers upload post-resolution photographs as proof of work completion, ensuring accountability and quality assurance.',
        color: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50',
        tag: 'Verification',
    },
    {
        icon: ThumbsUp,
        title: 'Citizen Feedback',
        description: 'After resolution, citizens can rate the quality of work and provide feedback to ensure continuous improvement of services.',
        color: 'from-pink-500 to-pink-600',
        bg: 'bg-pink-50',
        tag: 'Feedback',
    },
    {
        icon: Bell,
        title: 'Smart Notifications',
        description: 'Automated alerts keep citizens and workers informed at every stage — complaint received, assigned, in-progress, and resolved.',
        color: 'from-yellow-500 to-yellow-600',
        bg: 'bg-yellow-50',
        tag: 'Alerts',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-orange-50 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-orange-100">
                        Platform Capabilities
                    </span>
                    <h2 className="section-title">Key Features</h2>
                    <p className="section-subtitle">
                        Our platform is equipped with 8 powerful features designed to streamline civic complaint management
                        for citizens, authorities, and field workers alike.
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="feature-card group cursor-default"
                        >
                            {/* Tag */}
                            <div className="flex justify-between items-start mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                                >
                                    <feature.icon className="text-white" size={22} />
                                </motion.div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${feature.bg} text-gray-600`}>
                                    {feature.tag}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-2 font-poppins text-lg group-hover:text-navy-900 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>

                            {/* Hover accent */}
                            <div className={`mt-4 w-0 h-0.5 bg-gradient-to-r ${feature.color} group-hover:w-full transition-all duration-500 rounded-full`} />
                        </motion.div>
                    ))}
                </div>

                {/* Summary strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16 bg-gradient-to-r from-navy-900 via-navy-800 to-emerald-600 rounded-3xl p-8 text-white text-center"
                >
                    <h3 className="text-2xl font-bold font-poppins mb-2">Complete End-to-End Solution</h3>
                    <p className="text-white/75 max-w-2xl mx-auto text-sm">
                        From complaint submission to resolution proof — our system covers the complete lifecycle of every civic issue,
                        leaving no complaint unaddressed.
                    </p>
                    <div className="flex justify-center flex-wrap gap-4 mt-6">
                        {['Flutter App', 'REST API', 'Admin Dashboard', 'Real-time Alerts', 'Photo Evidence', 'Analytics'].map((t) => (
                            <span key={t} className="bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/20">
                                {t}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
