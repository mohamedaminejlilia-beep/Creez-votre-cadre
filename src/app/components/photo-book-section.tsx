import { motion } from 'motion/react';
import { useLanguage } from '../i18n/language-context';
import { Sparkles } from 'lucide-react';

export function PhotoBookSection() {
  const { t } = useLanguage();

  return (
    <section id="photo-book" className="bg-white py-24 px-6 border-t border-[#EEEEEE]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl tracking-tight text-black mb-6">
            {t.photoBook.title}
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            {t.photoBook.description}
          </p>
        </motion.div>

        {/* New Badge + Offer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-16 border border-amber-500 bg-amber-50 p-8 relative overflow-hidden"
        >
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-amber-500 text-black px-4 py-1.5 text-xs tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t.photoBook.badge}
            </div>
          </div>

          <div className="pr-32">
            <p className="text-xl text-black mb-2">
              {t.photoBook.offer}
            </p>
            <p className="text-sm text-black/60">
              {t.photoBook.price}
            </p>
          </div>
        </motion.div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden border border-[#EEEEEE]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Before"
                className="w-full h-full object-cover"
              />
              {/* Label */}
              <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 text-xs tracking-widest">
                {t.photoBook.before}
              </div>
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden border border-[#EEEEEE]">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80"
                alt="After"
                className="w-full h-full object-cover"
              />
              {/* Label */}
              <div className="absolute top-4 left-4 bg-amber-500 text-black px-4 py-2 text-xs tracking-widest">
                {t.photoBook.after}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <a
            href="#contact"
            className="inline-block bg-amber-500 text-black px-10 py-4 hover:bg-amber-400 transition-colors tracking-wider text-sm"
          >
            {t.photoBook.cta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
