import { motion } from 'framer-motion';

const technologies = [
    {
        name: 'Flutter',
        description: 'Cross-platform mobile app for Android & iOS citizen interface',
        color: 'from-sky-400 to-sky-600',
        bg: 'bg-sky-50',
        letter: 'F',
        category: 'Mobile',
    },
    {
        name: 'Python',
        description: 'Core backend language powering the server-side logic',
        color: 'from-yellow-400 to-yellow-600',
        bg: 'bg-yellow-50',
        letter: 'Py',
        category: 'Backend',
    },
    {
        name: 'Flask',
        description: 'Lightweight REST API framework handling all HTTP requests',
        color: 'from-gray-500 to-gray-700',
        bg: 'bg-gray-50',
        letter: 'Fl',
        category: 'Backend',
    },
    {
        name: 'React.js',
        description: 'Component-based admin dashboard for local authorities',
        color: 'from-cyan-400 to-cyan-600',
        bg: 'bg-cyan-50',
        letter: 'R',
        category: 'Frontend',
    },
    {
        name: 'MySQL',
        description: 'Relational database storing complaints, users, and assignments',
        color: 'from-blue-500 to-blue-700',
        bg: 'bg-blue-50',
        letter: 'DB',
        category: 'Database',
    },
    {
        name: 'Firebase',
        description: 'Authentication, push notifications, and real-time messaging',
        color: 'from-orange-400 to-orange-600',
        bg: 'bg-orange-50',
        letter: 'FB',
        category: 'Cloud',
    },
    {
        name: 'Git',
        description: 'Version control system for collaborative development',
        color: 'from-red-400 to-red-600',
        bg: 'bg-red-50',
        letter: 'G',
        category: 'DevOps',
    },
    {
        name: 'VS Code',
        description: 'Integrated development environment for the entire project',
        color: 'from-indigo-400 to-indigo-600',
        bg: 'bg-indigo-50',
        letter: 'VS',
        category: 'Tools',
    },
];

const archNodes = [
    { label: 'Citizen', sub: 'Flutter App', icon: '📱', color: 'bg-sky-500' },
    { label: 'REST API', sub: 'HTTP / JSON', icon: '🔗', color: 'bg-purple-500' },
    { label: 'Flask Backend', sub: 'Python Server', icon: '⚙️', color: 'bg-yellow-500' },
    { label: 'MySQL DB', sub: 'Data Storage', icon: '🗄️', color: 'bg-blue-600' },
    { label: 'Admin Panel', sub: 'React Dashboard', icon: '💻', color: 'bg-cyan-500' },
    { label: 'Authorities', sub: 'Village Admin', icon: '🏛️', color: 'bg-emerald-600' },
    { label: 'Workers', sub: 'Field Workforce', icon: '👷', color: 'bg-orange-500' },
    { label: 'Resolution', sub: 'Issue Closed', icon: '✅', color: 'bg-green-500' },
];

export default function Technology() {
    return (
        <section id="technology" className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-purple-50 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-purple-100">
                        Tech Stack
                    </span>
                    <h2 className="section-title">Technology Stack</h2>
                    <p className="section-subtitle">
                        Built with industry-standard modern technologies to ensure reliability, scalability,
                        and a seamless user experience.
                    </p>
                </motion.div>

                {/* Tech Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
                    {technologies.map((tech, i) => (
                        <motion.div
                            key={tech.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all border border-gray-100 group"
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <motion.div
                                    whileHover={{ rotate: 10 }}
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-lg`}
                                >
                                    <span className="text-white font-bold text-lg font-poppins">{tech.letter}</span>
                                </motion.div>
                                <div>
                                    <div className="font-bold text-gray-800 font-poppins">{tech.name}</div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tech.bg} text-gray-600`}>
                                        {tech.category}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed">{tech.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Architecture Diagram */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-navy-900 to-navy-950 rounded-3xl p-8 md:p-12 text-white"
                >
                    <h3 className="text-2xl font-bold text-center mb-2 font-poppins">System Architecture</h3>
                    <p className="text-white/60 text-center text-sm mb-10">End-to-end data flow from citizen to resolution</p>

                    {/* Architecture flow */}
                    <div className="flex flex-wrap justify-center items-center gap-3">
                        {archNodes.map((node, i) => (
                            <div key={node.label} className="flex items-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className={`${node.color} w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg border-2 border-white/10 text-2xl mb-2`}>
                                        {node.icon}
                                    </div>
                                    <div className="text-white text-xs font-semibold text-center font-poppins">{node.label}</div>
                                    <div className="text-white/50 text-xs text-center">{node.sub}</div>
                                </motion.div>
                                {i < archNodes.length - 1 && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        whileInView={{ scaleX: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                                        className="mx-2 text-white/30 text-lg"
                                    >
                                        →
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Architecture description */}
                    <div className="mt-8 grid md:grid-cols-3 gap-4">
                        {[
                            { title: 'Client Layer', desc: 'Flutter mobile app for citizens with offline capability and Firebase push notifications', icon: '📱' },
                            { title: 'API Layer', desc: 'Flask REST API with JWT authentication, image storage, and complaint lifecycle management', icon: '⚙️' },
                            { title: 'Management Layer', desc: 'React admin portal for real-time monitoring, worker assignment, and analytics', icon: '📊' },
                        ].map((layer) => (
                            <div key={layer.title} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-2xl mb-2">{layer.icon}</div>
                                <div className="font-bold text-sm mb-1 font-poppins">{layer.title}</div>
                                <div className="text-white/60 text-xs leading-relaxed">{layer.desc}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
