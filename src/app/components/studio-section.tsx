import { motion } from 'motion/react';
import { useLanguage } from '../i18n/language-context';

export function StudioSection() {
  const { t } = useLanguage();

  const features = [
    t.studio.features.equipment,
    t.studio.features.cyclorama,
    t.studio.features.makeup,
    t.studio.features.flexible,
  ];

  return (
    <section id="studio" className="bg-white py-24 px-6 border-t border-[#EEEEEE]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] lg:h-[600px] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
              alt="Studio Interior"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl lg:text-6xl tracking-tight text-black mb-6">
              {t.studio.title}
            </h2>
            <p className="text-lg text-black/70 mb-8 leading-relaxed">
              {t.studio.description}
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="border border-[#EEEEEE] p-4"
                >
                  <p className="text-sm tracking-wide text-black">{feature}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block bg-black text-white px-8 py-3.5 hover:bg-black/90 transition-colors tracking-wider text-sm"
            >
              {t.studio.cta}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
