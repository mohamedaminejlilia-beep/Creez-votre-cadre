import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function StickyCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const { t, dir } = useLanguage();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className={`fixed bottom-8 z-50 ${dir === 'rtl' ? 'left-8' : 'right-8'}`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group"
      >
        {/* Button */}
        <div className="backdrop-blur-xl bg-amber-500 p-4 rounded-full shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:shadow-amber-500/50 hover:bg-amber-400">
          <Calendar className="w-6 h-6 text-black" />
        </div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: dir === 'rtl' ? -10 : 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : (dir === 'rtl' ? -10 : 10),
          }}
          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${
            dir === 'rtl' ? 'left-full ml-4' : 'right-full mr-4'
          }`}
        >
          <div className="backdrop-blur-xl bg-black border border-white/20 px-4 py-2 rounded-none">
            <span className="text-white text-sm tracking-wider">
              {t.cta.book}
            </span>
          </div>
        </motion.div>

        {/* Pulse effect */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-amber-500"
        />
      </motion.button>
    </motion.div>
  );
}