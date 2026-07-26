import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';

const teamMembers = [
    {
        name: 'Dr. [Guide Name]',
        role: 'Project Guide',
        dept: 'Prof & HOD, AI & Data Science',
        icon: '👩‍🏫',
        color: 'from-navy-700 to-navy-900',
        responsibilities: ['Project supervision', 'Technical guidance', 'Research direction', 'Quality assurance'],
        tag: 'Faculty',
    },
    {
        name: '[Student 1 Name]',
        role: 'Full Stack Developer',
        dept: 'B.Tech AI & DS, 2021-25',
        icon: '👨‍💻',
        color: 'from-blue-500 to-blue-700',
        responsibilities: ['Flutter mobile app', 'Flask backend API', 'Database design', 'System architecture'],
        tag: '22XXXXX',
    },
    {
        name: '[Student 2 Name]',
        role: 'Frontend Developer',
        dept: 'B.Tech AI & DS, 2021-25',
        icon: '👩‍💻',
        color: 'from-emerald-500 to-emerald-700',
        responsibilities: ['React admin panel', 'UI/UX design', 'Framer animations', 'Responsive layouts'],
        tag: '22XXXXX',
    },
    {
        name: '[Student 3 Name]',
        role: 'Data & AI Engineer',
        dept: 'B.Tech AI & DS, 2021-25',
        icon: '🧑‍💻',
        color: 'from-purple-500 to-purple-700',
        responsibilities: ['Data modeling & MySQL', 'Firebase integration', 'Analytics module', 'Testing & QA'],
        tag: '22XXXXX',
    },
    {
        name: '[Student 4 Name]',
        role: 'Community Liaison',
        dept: 'B.Tech AI & DS, 2021-25',
        icon: '👩‍🔬',
        color: 'from-orange-500 to-orange-700',
        responsibilities: ['Citizen requirement gathering', 'Field testing', 'Documentation', 'Stakeholder coordination'],
        tag: '22XXXXX',
    },
];

export default function Team() {
    return (
        <section id="team" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-navy-50 text-navy-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-navy-100">
                        Our Team
                    </span>
                    <h2 className="section-title">Meet the Team</h2>
                    <p className="section-subtitle">
                        A dedicated team of students from the Department of Artificial Intelligence & Data Science,
                        Seshadri Rao Gudlavalleru Engineering College.
                    </p>
                </motion.div>

                {/* Guide card (Wide) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    whileHover={{ y: -4 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
                        <div className="md:w-1/3 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center py-12 md:py-0">
                            <div className="text-center">
                                <div className="text-8xl mb-3">{teamMembers[0].icon}</div>
                                <div className="bg-white/10 rounded-full px-3 py-1 text-white/70 text-xs inline-block">
                                    Project Guide
                                </div>
                            </div>
                        </div>
                        <div className="md:w-2/3 p-8 text-white">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold font-poppins">{teamMembers[0].name}</h3>
                                    <div className="text-orange-400 font-medium mt-1">{teamMembers[0].role}</div>
                                    <div className="text-white/60 text-sm mt-1">{teamMembers[0].dept}</div>
                                </div>
                                <GraduationCap className="text-white/30" size={40} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {teamMembers[0].responsibilities.map((r) => (
                                    <div key={r} className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                        <span className="text-white/80 text-sm">{r}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 bg-white/10 rounded-xl px-4 py-2 inline-block">
                                <span className="text-white/50 text-xs">Dept. of AI & Data Science • SRGEC</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Student cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamMembers.slice(1).map((member, i) => (
                        <motion.div
                            key={member.name + i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-gray-100 group"
                        >
                            {/* Avatar area */}
                            <div className={`bg-gradient-to-br ${member.color} h-32 flex items-center justify-center relative`}>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="text-6xl"
                                >
                                    {member.icon}
                                </motion.div>
                                <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                                    <span className="text-white text-xs font-mono font-bold">{member.tag}</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-800 font-poppins mb-0.5">{member.name}</h3>
                                <div className="text-orange-500 text-sm font-medium mb-0.5">{member.role}</div>
                                <div className="text-gray-400 text-xs mb-4">{member.dept}</div>

                                <div className="space-y-2">
                                    {member.responsibilities.map((r) => (
                                        <div key={r} className="flex items-center space-x-2">
                                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center flex-shrink-0`}>
                                                <span className="text-white text-xs">▸</span>
                                            </div>
                                            <span className="text-gray-600 text-xs">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Institution Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl p-6 text-center"
                >
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <BookOpen className="text-navy-900" size={24} />
                        <div className="font-bold text-navy-900 font-poppins">Seshadri Rao Gudlavalleru Engineering College</div>
                    </div>
                    <div className="text-gray-500 text-sm">Department of Artificial Intelligence & Data Science • Community Service Project 2024-25</div>
                </motion.div>
            </div>
        </section>
    );
}
