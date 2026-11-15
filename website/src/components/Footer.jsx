import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, ExternalLink, Link2, Share2, ArrowUp, Heart, Wrench } from 'lucide-react';

const quickLinks = ['Home', 'About', 'Features', 'Workflow', 'Gallery', 'Contact'];

export default function Footer({ onOpenWorker }) {
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollTo = (id) => {
        document.querySelector(`#${id.toLowerCase().replace(' ', '')}`)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="bg-gradient-to-br from-navy-950 to-navy-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <MapPin className="text-white" size={20} />
                            </div>
                            <div>
                                <div className="font-bold font-poppins">VillageConnect</div>
                                <div className="text-white/50 text-xs">Vemavaram Digital Governance Portal</div>
                            </div>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-6">
                            A Smart Digital Governance Platform designed to simplify complaint registration,
                            improve transparency, and strengthen communication between citizens and local
                            authorities in Vemavaram Village.
                        </p>
                        <div className="flex space-x-3">
                            {[
                                { icon: ExternalLink, href: '#', label: 'GitHub' },
                                { icon: Link2, href: '#', label: 'LinkedIn' },
                                { icon: Share2, href: '#', label: 'Share' },
                            ].map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="w-9 h-9 bg-white/10 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-colors duration-300"
                                >
                                    <social.icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold font-poppins mb-5 text-sm uppercase tracking-wider text-white/80">Quick Links</h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link}>
                                    <button
                                        onClick={() => scrollTo(link)}
                                        className="text-white/50 hover:text-orange-400 text-sm transition-colors duration-200 hover:translate-x-1 transform inline-block"
                                    >
                                        → {link}
                                    </button>
                                </li>
                            ))}
                            {onOpenWorker && (
                                <li className="pt-2 border-t border-white/10">
                                    <button
                                        onClick={onOpenWorker}
                                        className="text-orange-400 hover:text-orange-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                                    >
                                        <Wrench size={13} />
                                        <span>Worker Portal</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold font-poppins mb-4 text-sm uppercase tracking-wider text-white/80">Contact</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                                <span className="text-white/50 text-xs leading-relaxed">Vemavaram, Krishna Dist., AP</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail size={14} className="text-orange-400 flex-shrink-0" />
                                <span className="text-white/50 text-xs">villageconnect@srgec.ac.in</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone size={14} className="text-orange-400 flex-shrink-0" />
                                <span className="text-white/50 text-xs">+91 XXXXX XXXXX</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <div className="text-white/50 text-sm">
                            © 2024–25 Community Service Project
                        </div>
                        <div className="text-white/30 text-xs mt-1">
                            Seshadri Rao Gudlavalleru Engineering College, Krishna District, Andhra Pradesh
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 text-white/40 text-xs">
                        <span>Built with</span>
                        <Heart size={12} className="text-red-400" />
                        <span>for Vemavaram Village</span>
                    </div>
                </div>
            </div>

            {/* Back to Top */}
            <motion.button
                onClick={scrollTop}
                aria-label="Back to top"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 right-6 w-12 h-12 bg-orange-500 hover:bg-orange-400 text-white rounded-full shadow-xl flex items-center justify-center transition-colors z-40"
            >
                <ArrowUp size={20} />
            </motion.button>
        </footer>
    );
}
