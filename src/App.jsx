import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Workflow from './components/Workflow';
import Gallery from './components/Gallery';
import Statistics from './components/Statistics';
import FutureScope from './components/FutureScope';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';

function Loader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-600 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Logo */}
        <div className="w-20 h-20 bg-white/10 border border-white/30 rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="text-4xl">🏘️</span>
        </div>

        <div className="text-center">
          <h1 className="text-white font-bold text-2xl font-poppins">VillageConnect</h1>
          <p className="text-white/60 text-sm mt-1">Vemavaram Digital Governance Portal</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </div>

        <div className="text-white/50 text-sm">Loading platform...</div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>

      {!loading && (
        <div className="min-h-screen font-inter">
          <Navbar />
          <main>
            <Hero />
            <About />
            <Features />
            <Workflow />
            <Gallery />
            <Statistics />
            <FutureScope />
            <Team />
            <Contact />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
