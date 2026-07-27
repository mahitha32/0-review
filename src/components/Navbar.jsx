import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPin, AlertCircle } from 'lucide-react';

const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Team', href: '#team' },
    { label: 'Future Scope', href: '#future' },
    { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('#home');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const smoothScroll = (href) => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setActiveLink(href);
        setMenuOpen(false);
    };

    return (
        <motion.nav
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-nav py-2'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => smoothScroll('#home')}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-navy-900 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <MapPin className="text-white" size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-poppins font-bold text-sm leading-tight ${scrolled ? 'text-navy-900' : 'text-white'}`}>
                                VillageConnect
                            </span>
                            <span className={`text-xs leading-tight ${scrolled ? 'text-gray-500' : 'text-white/70'}`}>
                                Vemavaram
                            </span>
                        </div>
                    </motion.div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => smoothScroll(link.href)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeLink === link.href
                                    ? 'text-orange-500 bg-orange-50'
                                    : scrolled
                                        ? 'text-gray-700 hover:text-navy-900 hover:bg-navy-50'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => smoothScroll('#contact')}
                            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-orange-200 hover:shadow-xl text-sm"
                        >
                            <AlertCircle size={16} />
                            <span>Report Complaint</span>
                        </motion.button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-navy-900' : 'text-white'}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => smoothScroll(link.href)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeLink === link.href
                                        ? 'bg-navy-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.label}
                                </button>
                            ))}
                            <button
                                onClick={() => smoothScroll('#contact')}
                                className="w-full mt-2 flex items-center justify-center space-x-2 bg-orange-500 text-white font-semibold px-4 py-3 rounded-xl"
                            >
                                <AlertCircle size={16} />
                                <span>Report Complaint</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
