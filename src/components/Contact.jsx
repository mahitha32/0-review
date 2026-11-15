import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { contactApi, extractErrorMessage } from '../services/api';

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic client validation
        const trimmedName = form.name.trim();
        const trimmedEmail = form.email.trim();
        const trimmedMessage = form.message.trim();

        if (!trimmedName) {
            setError('Please enter your full name.');
            return;
        }
        if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!trimmedMessage) {
            setError('Please enter your message.');
            return;
        }

        setLoading(true);
        try {
            const res = await contactApi.submit({
                name: trimmedName,
                email: trimmedEmail,
                phone: form.phone.trim() || undefined,
                message: trimmedMessage,
            });

            const msg = res.data?.message || 'Thank you! Your message has been received.';
            setSuccessMsg(msg);
            setSubmitted(true);
        } catch (err) {
            const errMsg = extractErrorMessage(err);
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        setForm({ name: '', email: '', phone: '', message: '' });
        setError('');
        setSuccessMsg('');
    };

    return (
        <section id="contact" className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-orange-50 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-orange-100">
                        Get In Touch
                    </span>
                    <h2 className="section-title">Contact Us</h2>
                    <p className="section-subtitle">
                        Have questions about this project, or want to report an issue directly?
                        Reach out to the project team or the Vemavaram Village administration.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                    >
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                >
                                    <CheckCircle className="text-emerald-500 mx-auto mb-4" size={64} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-navy-900 font-poppins mb-2">Message Sent!</h3>
                                <p className="text-gray-500 max-w-md">
                                    {successMsg || 'Thank you for reaching out. The project team will get back to you within 24 hours.'}
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="mt-6 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl shadow-md transition-all"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <h3 className="text-xl font-bold text-navy-900 font-poppins mb-6">Send a Message</h3>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start space-x-2"
                                    >
                                        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {[
                                    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', required: true },
                                    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', required: true },
                                    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210', required: false },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            {field.label} {field.required && <span className="text-red-400">*</span>}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            required={field.required}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            disabled={loading}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-all text-sm disabled:bg-gray-100"
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Message <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={4}
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Describe your complaint, inquiry or suggestion..."
                                        disabled={loading}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-all text-sm resize-none disabled:bg-gray-100"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    className="w-full flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-60 shadow-lg"
                                >
                                    {loading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Submitting message...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        )}
                    </motion.div>

                    {/* Info + Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Contact info cards */}
                        {[
                            { icon: MapPin, title: 'Village Location', value: 'Vemavaram Village, Krishna District, Andhra Pradesh - 521 000', color: 'from-blue-500 to-blue-600', href: null },
                            { icon: Mail, title: 'Official Email', value: 'gadalamahithavasavi@gmail.com', color: 'from-emerald-500 to-emerald-600', href: 'mailto:gadalamahithavasavi@gmail.com' },
                            { icon: Phone, title: 'Helpline Number', value: '+91 8674 200 100', color: 'from-orange-500 to-orange-600', href: 'tel:+918674200100' },
                        ].map((info) => (
                            <motion.div
                                key={info.title}
                                whileHover={{ x: 4 }}
                                className="flex items-center space-x-4 bg-white rounded-2xl p-5 shadow-card border border-gray-100"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                    <info.icon className="text-white" size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-gray-800 font-poppins text-sm">{info.title}</div>
                                    {info.href ? (
                                        <a
                                            href={info.href}
                                            className="text-gray-500 hover:text-orange-500 transition-colors text-sm break-all font-medium inline-block"
                                        >
                                            {info.value}
                                        </a>
                                    ) : (
                                        <div className="text-gray-500 text-sm leading-relaxed">{info.value}</div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Google Maps / Location Info */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100">
                            <div className="h-52 bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center relative">
                                <div
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage: 'linear-gradient(rgba(15,76,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(15,76,129,0.3) 1px, transparent 1px)',
                                        backgroundSize: '30px 30px',
                                    }}
                                />
                                <div className="absolute inset-0">
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-navy-200/50 -translate-y-1/2" />
                                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-navy-200/50 -translate-x-1/2" />
                                </div>
                                <div className="z-10 text-center">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        <MapPin className="text-red-500 mx-auto" size={36} />
                                    </motion.div>
                                    <div className="font-bold text-navy-900 mt-2 font-poppins">Vemavaram Village</div>
                                    <div className="text-gray-500 text-xs">Krishna District, Andhra Pradesh</div>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm text-gray-600">📍 Gram Panchayat Office</span>
                                <a
                                    href="https://maps.google.com/?q=Vemavaram,Andhra+Pradesh"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-navy-700 font-semibold hover:underline"
                                >
                                    Open in Maps →
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
