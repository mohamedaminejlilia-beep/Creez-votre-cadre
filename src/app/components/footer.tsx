import { motion } from 'motion/react';
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/language-context';

export function Footer() {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t.nav.studio, href: '#studio' },
    { label: t.nav.framing, href: '#framing' },
    { label: t.nav.photoBook, href: '#photo-book' },
    { label: t.nav.events, href: '#events' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-black border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl tracking-wider text-white mb-4"
            >
              YAPAS
            </motion.h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-md">
              {t.footer.description}
            </p>

            {/* Social Links */}
            <div className="flex gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-amber-500 text-sm tracking-wider transition-colors uppercase"
              >
                {t.footer.social.instagram}
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-amber-500 text-sm tracking-wider transition-colors uppercase"
              >
                {t.footer.social.linkedin}
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-amber-500 text-sm tracking-wider transition-colors uppercase"
              >
                {t.footer.social.facebook}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm tracking-wider mb-4 uppercase">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-sm tracking-wider mb-4 uppercase">{t.footer.contactTitle}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">
                  {t.footer.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-white/60 text-sm">{t.footer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-white/60 text-sm">{t.footer.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs tracking-wide uppercase">
            {t.footer.rights}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white text-xs transition-colors uppercase">
              {t.footer.privacy}
            </a>
            <a href="#" className="text-white/40 hover:text-white text-xs transition-colors uppercase">
              {t.footer.terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}