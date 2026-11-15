import { motion } from 'framer-motion';
import {
    Smartphone, Upload, MapPin, Server, Shield,
    ClipboardList, Wrench, CheckCircle, Camera, Star,
} from 'lucide-react';

const steps = [
    { icon: Smartphone, label: 'Citizen Opens App', description: 'Opens VillageConnect mobile app', color: 'from-blue-500 to-blue-600' },
    { icon: Upload, label: 'Submit Complaint', description: 'Fills complaint form with details', color: 'from-purple-500 to-purple-600' },
    { icon: Camera, label: 'Upload Image', description: 'Attaches photo evidence of issue', color: 'from-pink-500 to-pink-600' },
    { icon: MapPin, label: 'Location Captured', description: 'GPS location auto-detected', color: 'from-red-500 to-red-600' },
    { icon: Server, label: 'Backend Verification', description: 'Flask API processes & validates', color: 'from-orange-500 to-orange-600' },
    { icon: Shield, label: 'Admin Review', description: 'Authority reviews complaint', color: 'from-yellow-500 to-yellow-600' },
    { icon: ClipboardList, label: 'Worker Assignment', description: 'Task assigned to field worker', color: 'from-emerald-500 to-emerald-600' },
    { icon: Wrench, label: 'Issue Resolved', description: 'Worker resolves the issue', color: 'from-teal-500 to-teal-600' },
    { icon: CheckCircle, label: 'Resolution Photo', description: 'Worker uploads proof photo', color: 'from-cyan-500 to-cyan-600' },
    { icon: Star, label: 'Citizen Feedback', description: 'Citizen rates the resolution', color: 'from-navy-700 to-navy-900' },
];

export default function Workflow() {
    return (
        <section id="workflow" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-emerald-100">
                        System Workflow
                    </span>
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">
                        A seamless 10-step process ensuring every complaint is addressed from
                        initial submission to verified resolution and citizen feedback.
                    </p>
                </motion.div>

                {/* Desktop Timeline */}
                <div className="hidden lg:block">
                    {/* Row 1: steps 1-5 */}
                    <div className="flex items-start justify-between mb-4">
                        {steps.slice(0, 5).map((step, i) => (
                            <motion.div
                                key={step.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex flex-col items-center w-[18%]"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-3`}
                                >
                                    <step.icon className="text-white" size={22} />
                                </motion.div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-navy-900 font-poppins mb-1">{step.label}</div>
                                    <div className="text-xs text-gray-500">{step.description}</div>
                                </div>
                                <div className="bg-navy-900 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center mt-2 font-bold">{i + 1}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Connector Row 1 */}
                    <div className="flex items-center px-16 mb-4">
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
                        <div className="mx-2 text-orange-500">▼</div>
                    </div>

                    {/* Row 2: steps 6-10 (reversed) */}
                    <div className="flex items-start justify-between flex-row-reverse">
                        {steps.slice(5).map((step, i) => (
                            <motion.div
                                key={step.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex flex-col items-center w-[18%]"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-3`}
                                >
                                    <step.icon className="text-white" size={22} />
                                </motion.div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-navy-900 font-poppins mb-1">{step.label}</div>
                                    <div className="text-xs text-gray-500">{step.description}</div>
                                </div>
                                <div className="bg-navy-900 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center mt-2 font-bold">{i + 6}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Connector Row 2 */}
                    <div className="flex items-center px-16 mt-4">
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-navy-900 via-teal-500 to-cyan-500" />
                    </div>
                </div>

                {/* Mobile: vertical list */}
                <div className="lg:hidden space-y-4">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="flex items-center space-x-4 bg-gray-50 rounded-2xl p-4"
                        >
                            <div className="flex-shrink-0 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md`}>
                                    <step.icon className="text-white" size={20} />
                                </div>
                                {i < steps.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-2" />}
                            </div>
                            <div>
                                <span className="text-xs font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-full mr-2">Step {i + 1}</span>
                                <div className="font-semibold text-gray-800 text-sm mt-1 font-poppins">{step.label}</div>
                                <div className="text-gray-500 text-xs">{step.description}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
