import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const { t, dir } = useLanguage();

  // WhatsApp number - replace with actual number
  const whatsappNumber = '+212XXXXXXXXX';
  const whatsappMessage = encodeURIComponent(
    t.whatsapp?.defaultMessage ||
      'Bonjour, je souhaite obtenir plus d\'informations sur vos services.'
  );

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className={`fixed bottom-24 z-50 ${dir === 'rtl' ? 'left-8' : 'right-8'}`}
    >
      <motion.a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group block"
      >
        {/* Button */}
        <div className="bg-[#25D366] p-4 rounded-full shadow-2xl shadow-[#25D366]/20 transition-all duration-300 hover:shadow-[#25D366]/40">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: dir === 'rtl' ? -10 : 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : dir === 'rtl' ? -10 : 10,
          }}
          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${
            dir === 'rtl' ? 'left-full ml-4' : 'right-full mr-4'
          }`}
        >
          <div className="bg-black border border-white/20 px-4 py-2">
            <span className="text-white text-sm tracking-wider">
              {t.whatsapp?.tooltip || 'CONTACTEZ-NOUS SUR WHATSAPP'}
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
          className="absolute inset-0 rounded-full bg-[#25D366]"
        />
      </motion.a>
    </motion.div>
  );
}
