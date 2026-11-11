import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MapPin, AlertCircle, Search, User, LogOut, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

export default function Navbar({ onOpenTrack, onOpenReport, onOpenAuth, onOpenDashboard, onOpenWorker }) {
    const { isAuthenticated, user, logout } = useAuth();
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
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-nav py-2.5'
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
                    <div className="hidden xl:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <button
                                key={link.href}
                                onClick={() => smoothScroll(link.href)}
                                className={`px-2.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${activeLink === link.href
                                    ? 'text-orange-500 bg-orange-50 font-semibold'
                                    : scrolled
                                        ? 'text-gray-700 hover:text-navy-900 hover:bg-navy-50'
                                        : 'text-white/90 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* CTA Actions */}
                    <div className="hidden lg:flex items-center space-x-2.5">
                        {/* Track Button */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onOpenTrack}
                            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                                scrolled
                                    ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
                                    : 'border-white/30 text-white hover:bg-white/10 backdrop-blur-sm'
                            }`}
                        >
                            <Search size={14} className="text-orange-400" />
                            <span>Track Status</span>
                        </motion.button>

                        {/* Report Complaint Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onOpenReport}
                            className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-300 text-xs"
                        >
                            <AlertCircle size={15} />
                            <span>Report Issue</span>
                        </motion.button>

                        {/* Citizen Auth / Dashboard Button */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-1.5">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onOpenDashboard}
                                    className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-3.5 py-2 rounded-full text-xs font-semibold shadow-md"
                                >
                                    <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                                        {user?.name?.charAt(0) || 'C'}
                                    </div>
                                    <span className="max-w-[90px] truncate">{user?.name || 'Dashboard'}</span>
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={onOpenAuth}
                                className={`flex items-center space-x-1 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                                    scrolled
                                        ? 'bg-navy-100 text-navy-900 hover:bg-navy-200'
                                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                                }`}
                            >
                                <User size={14} />
                                <span>Citizen Login</span>
                            </motion.button>
                        )}

                        {onOpenWorker && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onOpenWorker}
                                title="Field Worker Portal"
                                aria-label="Field Worker Portal"
                                className={`p-2 rounded-full border transition-all ${
                                    scrolled
                                        ? 'border-gray-200 text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                                        : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                                }`}
                            >
                                <Wrench size={14} />
                            </motion.button>
                        )}
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
                        className="lg:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {/* Mobile Citizen Profile / Auth */}
                            <div className="p-3 bg-gray-50 rounded-xl mb-2 flex items-center justify-between">
                                {isAuthenticated ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                                                {user?.name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-navy-900">{user?.name}</div>
                                                <div className="text-[10px] text-gray-500">{user?.mobile}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setMenuOpen(false); onOpenDashboard(); }}
                                            className="px-3 py-1.5 bg-navy-900 text-white text-xs font-semibold rounded-lg"
                                        >
                                            Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-xs text-gray-600 font-medium">Citizen Portal Access</span>
                                        <button
                                            onClick={() => { setMenuOpen(false); onOpenAuth(); }}
                                            className="px-3 py-1.5 bg-navy-900 text-white text-xs font-semibold rounded-lg"
                                        >
                                            Log In / Register
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                    onClick={() => { setMenuOpen(false); onOpenTrack(); }}
                                    className="flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-navy-900 font-semibold py-2.5 px-3 rounded-xl text-xs"
                                >
                                    <Search size={14} className="text-orange-500" />
                                    <span>Track Status</span>
                                </button>
                                <button
                                    onClick={() => { setMenuOpen(false); onOpenReport(); }}
                                    className="flex items-center justify-center space-x-1.5 bg-orange-500 text-white font-semibold py-2.5 px-3 rounded-xl text-xs"
                                >
                                    <AlertCircle size={14} />
                                    <span>Report Issue</span>
                                </button>
                            </div>

                            {/* Nav links */}
                            <div className="border-t border-gray-100 pt-2 space-y-0.5">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => smoothScroll(link.href)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeLink === link.href
                                            ? 'bg-navy-900 text-white'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </div>

                            {onOpenWorker && (
                                <div className="border-t border-gray-100 pt-2">
                                    <button
                                        onClick={() => { setMenuOpen(false); onOpenWorker(); }}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Wrench size={14} />
                                            <span>Field Worker Portal</span>
                                        </span>
                                        <span>→</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
