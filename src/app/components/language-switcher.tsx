import { motion } from 'motion/react';
import { useLanguage } from '../i18n/language-context';
import { Language } from '../i18n/translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
  ];

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-2">
      {languages.map((lang, index) => (
        <div key={lang.code} className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(lang.code)}
            className={`px-2 py-1 text-sm tracking-wider transition-colors ${
              language === lang.code
                ? 'text-amber-500'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            {lang.label}
          </motion.button>
          {index < languages.length - 1 && (
            <span className="text-white/20 mx-1">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
