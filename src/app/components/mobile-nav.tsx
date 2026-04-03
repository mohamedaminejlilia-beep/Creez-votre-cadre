import { motion } from 'motion/react';
import { Home, Briefcase, Image, Mail } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function MobileNav() {
  const [activeTab, setActiveTab] = useState('home');
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', icon: Home, label: t.mobileNav.home, href: '#' },
    { id: 'studio', icon: Briefcase, label: t.nav.studio, href: '#studio' },
    { id: 'framing', icon: Image, label: t.nav.framing, href: '#framing' },
    { id: 'contact', icon: Mail, label: t.mobileNav.contact, href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="backdrop-blur-xl bg-black/80 border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab(item.id)}
                className="relative flex flex-col items-center gap-1 px-4 py-2"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative ${
                    isActive ? 'text-amber-500' : 'text-white/60'
                  }`}
                >
                  <Icon className="w-6 h-6" />

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"
                    />
                  )}
                </motion.div>

                <span
                  className={`text-xs ${
                    isActive ? 'text-amber-500' : 'text-white/60'
                  }`}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}