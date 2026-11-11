import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, Star, Users, Zap, RefreshCw } from 'lucide-react';
import { publicApi } from '../services/api';

function Counter({ value, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const numValue = Number(value) || 0;
        if (numValue === 0) {
            setCount(0);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    let start = 0;
                    const duration = 1200;
                    const step = Math.max(1, Math.ceil(numValue / (duration / 16)));
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= numValue) {
                            setCount(numValue);
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
        items: [
            'Easy complaint reporting via web & app',
            'Transparent real-time status tracking',
            'Quick & verified field resolutions',
            'SMS & in-portal notification updates',
            'Rate & review completed civic work'
        ],
    },
    {
        audience: 'For Authorities',
        emoji: '🏛️',
        color: 'from-emerald-600 to-emerald-800',
        items: [
            'Digital complaint monitoring & analytics',
            'Ward-level issue concentration insights',
            'Better governance and SLA accountability',
            'Evidence-based decision making with photos',
            'Audit trails preserved in MySQL database'
        ],
    },
    {
        audience: 'For Workers',
        emoji: '👷',
        color: 'from-orange-500 to-orange-700',
        items: [
            'Clear task assignments with GPS locations',
            'Department-specific problem routing',
            'Upload resolution proof photographs',
            'Transparent performance records',
            'Paperless field task management'
        ],
    },
];

export default function Statistics() {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);

    const loadStats = async () => {
        try {
            setLoading(true);
            const res = await publicApi.getStats();
            if (res.data?.data) {
                setStatsData(res.data.data);
                setIsLive(true);
            }
        } catch {
            // Keep default zero counters if server unreachable
            setIsLive(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const statItems = [
        {
            icon: FileText,
            value: statsData?.total_complaints ?? 0,
            suffix: '',
            label: 'Total Complaints Filed',
            color: 'from-blue-500 to-blue-600',
        },
        {
            icon: CheckCircle,
            value: statsData?.resolved_complaints ?? 0,
            suffix: '',
            label: 'Complaints Resolved',
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            icon: Clock,
            value: statsData?.pending_complaints ?? 0,
            suffix: '',
            label: 'Currently Pending',
            color: 'from-orange-500 to-orange-600',
        },
        {
            icon: Zap,
            value: statsData?.avg_resolution_hours ?? 24,
            suffix: 'hrs',
            label: 'Avg Resolution Time',
            color: 'from-purple-500 to-purple-600',
        },
        {
            icon: Star,
            value: statsData?.citizen_satisfaction ?? 100,
            suffix: '%',
            label: 'Citizen Satisfaction',
            color: 'from-yellow-500 to-yellow-600',
        },
        {
            icon: Users,
            value: statsData?.active_citizens ?? 0,
            suffix: '',
            label: 'Active Citizens',
            color: 'from-pink-500 to-pink-600',
        },
    ];

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
                        <div className="inline-flex items-center space-x-2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{isLive ? 'Live Database Statistics' : 'Vemavaram System Metrics'}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white font-poppins">
                            Impact in Numbers
                        </h2>
                        <p className="text-white/70 mt-4 max-w-2xl mx-auto">
                            Real-time governance analytics directly from the Vemavaram Village civic database.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {statItems.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                whileHover={{ y: -4 }}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center flex flex-col justify-between"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                                    <stat.icon className="text-white" size={18} />
                                </div>
                                {loading ? (
                                    <div className="h-10 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <Counter value={stat.value} suffix={stat.suffix} />
                                )}
                                <div className="text-white/70 text-xs mt-2 leading-tight font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={loadStats}
                            className="inline-flex items-center space-x-2 text-xs text-white/60 hover:text-white transition-colors"
                        >
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            <span>Refresh live metrics</span>
                        </button>
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
                            and workers completing tasks in Vemavaram Village.
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
                                className="rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-gray-100 flex flex-col"
                            >
                                <div className={`bg-gradient-to-br ${benefit.color} p-6 text-white text-center`}>
                                    <div className="text-4xl mb-2">{benefit.emoji}</div>
                                    <div className="text-xl font-bold font-poppins">{benefit.audience}</div>
                                </div>

                                <div className="bg-white p-6 flex-1 flex flex-col justify-between">
                                    <ul className="space-y-3">
                                        {benefit.items.map((item) => (
                                            <li key={item} className="flex items-center space-x-3">
                                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs flex-shrink-0 font-bold">✓</span>
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
