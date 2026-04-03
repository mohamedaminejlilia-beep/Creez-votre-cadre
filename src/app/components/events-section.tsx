import { motion } from 'motion/react';
import { useLanguage } from '../i18n/language-context';

export function EventsSection() {
  const { t } = useLanguage();

  const eventImages = [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
  ];

  return (
    <section id="events" className="bg-black py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl tracking-tight text-white mb-6">
            {t.events.title}
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {t.events.description}
          </p>
        </motion.div>

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-px bg-white/10"
        >
          {eventImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative aspect-[4/3] overflow-hidden group cursor-pointer"
            >
              <img
                src={image}
                alt={`Event ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="#portfolio"
            className="inline-block bg-white text-black px-10 py-3.5 hover:bg-white/90 transition-colors tracking-wider text-sm"
          >
            {t.events.cta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
