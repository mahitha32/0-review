import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target, Eye, CheckSquare, TrendingUp, ArrowDown, ArrowRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.15 },
    }),
};

const cards = [
    {
        icon: Target,
        title: 'Our Mission',
        color: 'from-blue-600 to-blue-400',
        bg: 'bg-blue-50',
        description:
            'To digitally transform the complaint management process in Vemavaram Village, providing a transparent, efficient, and accessible platform for citizens to report and track civic issues.',
    },
    {
        icon: Eye,
        title: 'Our Vision',
        color: 'from-emerald-600 to-emerald-400',
        bg: 'bg-emerald-50',
        description:
            'To build a model Smart Village where every citizen\'s voice is heard, every issue is addressed promptly, and local governance is strengthened through digital innovation.',
    },
    {
        icon: CheckSquare,
        title: 'Objectives',
        color: 'from-orange-500 to-orange-400',
        bg: 'bg-orange-50',
        description:
            'Digitize complaint registration, enable real-time tracking, ensure accountability through worker assignment, and measure resolution quality via citizen feedback.',
    },
    {
        icon: TrendingUp,
        title: 'Why This Project?',
        color: 'from-purple-600 to-purple-400',
        bg: 'bg-purple-50',
        description:
            'Vemavaram faced persistent civic issues with no transparent resolution system. Our platform bridges the gap between citizens and authorities using technology.',
    },
];

const problemSteps = [
    'Manual Complaint Process',
    'No Transparency',
    'Delayed Resolution',
    'Poor Communication',
    'Citizen Dissatisfaction',
];

const solutionSteps = [
    'Digital Platform',
    'Photo Upload',
    'Real-Time Tracking',
    'Worker Assignment',
    'Citizen Feedback',
];

function FlowColumn({ title, steps, dotColor, titleColor, bgColor }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`font-bold text-lg mb-4 px-6 py-2 rounded-full ${titleColor} font-poppins`}>
                {title}
            </div>
            {steps.map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                    <motion.div
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className={`${bgColor} rounded-xl px-5 py-3 text-sm font-medium text-center shadow-sm w-48`}
                    >
                        {step}
                    </motion.div>
                    {i < steps.length - 1 && (
                        <div className="flex flex-col items-center py-1">
                            <div className={`w-0.5 h-4 ${dotColor === 'red' ? 'bg-red-200' : 'bg-emerald-200'}`} />
                            <ArrowDown size={14} className={dotColor === 'red' ? 'text-red-400' : 'text-emerald-400'} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function About() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="about" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-navy-50 text-navy-900 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-navy-100">
                        About the Initiative
                    </span>
                    <h2 className="section-title">About the Project</h2>
                    <p className="section-subtitle">
                        This Community Service Project aims to digitally transform the complaint management process in Vemavaram Village
                        by enabling citizens to report civic issues and track resolution with complete transparency.
                    </p>
                </motion.div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`${card.bg} rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <card.icon className="text-white" size={22} />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2 font-poppins">{card.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Problem vs Solution */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12"
                >
                    <h3 className="text-2xl font-bold text-center text-navy-900 mb-10 font-poppins">
                        Problem → Solution: Our Approach
                    </h3>

                    <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-12">
                        <FlowColumn
                            title="❌ The Problem"
                            steps={problemSteps}
                            dotColor="red"
                            titleColor="bg-red-100 text-red-700"
                            bgColor="bg-red-50 text-red-800 border border-red-100"
                        />

                        <div className="flex items-center justify-center md:mt-24">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-12 h-12 rounded-full bg-navy-900 flex items-center justify-center shadow-lg"
                            >
                                <ArrowRight className="text-white" size={22} />
                            </motion.div>
                        </div>

                        <FlowColumn
                            title="✅ Our Solution"
                            steps={solutionSteps}
                            dotColor="green"
                            titleColor="bg-emerald-100 text-emerald-700"
                            bgColor="bg-emerald-50 text-emerald-800 border border-emerald-100"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
