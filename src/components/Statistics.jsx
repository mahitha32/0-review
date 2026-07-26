import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Star, Users, Zap } from 'lucide-react';

const stats = [
    { icon: FileText, value: 156, suffix: '', label: 'Total Complaints Filed', color: 'from-blue-500 to-blue-600' },
    { icon: CheckCircle, value: 134, suffix: '', label: 'Complaints Resolved', color: 'from-emerald-500 to-emerald-600' },
    { icon: Clock, value: 22, suffix: '', label: 'Currently Pending', color: 'from-orange-500 to-orange-600' },
    { icon: Zap, value: 24, suffix: 'hrs', label: 'Avg Resolution Time', color: 'from-purple-500 to-purple-600' },
    { icon: Star, value: 97, suffix: '%', label: 'Citizen Satisfaction', color: 'from-yellow-500 to-yellow-600' },
    { icon: Users, value: 320, suffix: '+', label: 'Active Citizens', color: 'from-pink-500 to-pink-600' },
];

function Counter({ value, suffix }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    let start = 0;
                    const duration = 2000;
                    const step = Math.ceil(value / (duration / 16));
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= value) {
                            setCount(value);
                            clearInterval(timer);
                        } else {
                            setCount(start);
                        }
                    }, 16);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <span ref={ref} className="text-4xl font-bold font-poppins text-white">
            {count}{suffix}
        </span>
    );
}

const benefits = [
    {
        audience: 'For Citizens',
        emoji: '👨‍👩‍👧‍👦',
        color: 'from-blue-600 to-blue-800',
        items: ['Easy complaint reporting via app', 'Transparent real-time tracking', 'Quick & verified resolutions', 'Push notification updates', 'Rate & review completed work'],
    },
    {
        audience: 'For Authorities',
        emoji: '🏛️',
        color: 'from-emerald-600 to-emerald-800',
        items: ['Digital complaint monitoring', 'Analytics & performance metrics', 'Better governance transparency', 'Evidence-based decision making', 'Accountability trail maintained'],
    },
    {
        audience: 'For Workers',
        emoji: '👷',
        color: 'from-orange-500 to-orange-700',
        items: ['Clear digital task assignments', 'GPS-based location guidance', 'Upload resolution proof photos', 'Performance tracking system', 'Paperless work management'],
    },
];

export default function Statistics() {
    return (
        <>
            {/* Statistics */}
            <section className="py-24 bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20">
                            📊 Live Statistics
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-poppins">
                            Impact in Numbers
                        </h2>
                        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
                            Demo statistics showcasing the potential impact of this platform on Vemavaram Village's civic management.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ y: -4 }}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                                    <stat.icon className="text-white" size={18} />
                                </div>
                                <Counter value={stat.value} suffix={stat.suffix} />
                                <div className="text-white/60 text-xs mt-2 leading-tight">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section id="benefits" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-blue-100">
                            Who Benefits?
                        </span>
                        <h2 className="section-title">Benefits for Everyone</h2>
                        <p className="section-subtitle">
                            Our platform creates value at every level — for citizens reporting issues, authorities managing resolutions,
                            and workers completing tasks.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={benefit.audience}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                whileHover={{ y: -6 }}
                                className="rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all"
                            >
                                {/* Card header */}
                                <div className={`bg-gradient-to-br ${benefit.color} p-6 text-white text-center`}>
                                    <div className="text-4xl mb-2">{benefit.emoji}</div>
                                    <div className="text-xl font-bold font-poppins">{benefit.audience}</div>
                                </div>

                                {/* Card body */}
                                <div className="bg-white p-6">
                                    <ul className="space-y-3">
                                        {benefit.items.map((item) => (
                                            <li key={item} className="flex items-center space-x-3">
                                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                                                <span className="text-gray-700 text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
