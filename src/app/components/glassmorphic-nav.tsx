import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';
import { LanguageSwitcher } from './language-switcher';

export function GlassmorphicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { key: 'studio', label: t.nav.studio },
    { key: 'framing', label: t.nav.framing },
    { key: 'photo-book', label: t.nav.photoBook },
    { key: 'events', label: t.nav.events },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-8 py-6"
      >
        <div className="backdrop-blur-xl bg-black/80 border border-white/10 rounded-none px-8 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl tracking-wider text-white cursor-pointer"
            >
              YAPAS
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <motion.a
                  key={item.key}
                  href={`#${item.key}`}
                  whileHover={{ y: -2 }}
                  className="text-white/80 hover:text-white transition-colors text-sm tracking-wider"
                >
                  {item.label}
                </motion.a>
              ))}
              
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* CTA Button */}
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-amber-500 text-black tracking-wider text-sm hover:bg-amber-400 transition-colors"
              >
                {t.nav.bookNow}
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-4 right-4 z-40 md:hidden"
        >
          <div className="backdrop-blur-xl bg-black/90 border border-white/10 rounded-none p-6">
            <div className="flex flex-col gap-4">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.key}
                  href={`#${item.key}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors text-base tracking-wider py-2"
                >
                  {item.label}
                </motion.a>
              ))}
              
              {/* Mobile Language Switcher */}
              <div className="pt-4 border-t border-white/10">
                <LanguageSwitcher />
              </div>
              
              {/* Mobile CTA Button */}
              <motion.a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="mt-2 px-6 py-3 bg-amber-500 text-black tracking-wider text-center hover:bg-amber-400 transition-colors"
              >
                {t.nav.bookNow}
              </motion.a>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}