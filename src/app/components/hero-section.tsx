import { motion } from 'motion/react';
import { useLanguage } from '../i18n/language-context';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background Placeholder - In production, replace with actual video */}
      <div className="absolute inset-0">
        {/* Placeholder image for video background */}
        <img
          src="https://images.unsplash.com/photo-1615458509633-f15b61bdacb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMHN0dWRpbyUyMGxpZ2h0aW5nfGVufDF8fHx8MTc2ODIzMTA3Nnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Studio background"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Kinetic Typography */}
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-8"
          >
            {t.hero.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl lg:text-2xl tracking-wide text-white/80 max-w-3xl mx-auto"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <a 
              href="#studio"
              className="inline-block bg-amber-500 text-black px-12 py-4 hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-base tracking-widest uppercase"
            >
              {t.hero.cta}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}