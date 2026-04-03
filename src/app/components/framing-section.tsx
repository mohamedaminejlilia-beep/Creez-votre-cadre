import { motion } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function FramingSection() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'ALL' },
    { id: 'matteBlack', label: t.framing.filters.matteBlack },
    { id: 'naturalWood', label: t.framing.filters.naturalWood },
    { id: 'galleryWhite', label: t.framing.filters.galleryWhite },
    { id: 'aluminum', label: t.framing.filters.aluminum },
  ];

  const frames = [
    { id: 1, type: 'matteBlack', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80' },
    { id: 2, type: 'naturalWood', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80' },
    { id: 3, type: 'galleryWhite', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80' },
    { id: 4, type: 'aluminum', image: 'https://images.unsplash.com/photo-1582139329655-1e6b1e6c8f6d?w=600&q=80' },
    { id: 5, type: 'matteBlack', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80' },
    { id: 6, type: 'naturalWood', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80' },
    { id: 7, type: 'galleryWhite', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
    { id: 8, type: 'aluminum', image: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=600&q=80' },
  ];

  const filteredFrames = activeFilter === 'all' 
    ? frames 
    : frames.filter(frame => frame.type === activeFilter);

  return (
    <section id="framing" className="bg-white py-24 px-6 border-t border-[#EEEEEE]">
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
            {t.framing.title}
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            {t.framing.description}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2.5 border transition-colors text-sm tracking-wide ${
                activeFilter === filter.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-[#EEEEEE] hover:border-black'
              }`}
            >
              {filter.label.toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Frame Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#EEEEEE] border border-[#EEEEEE]"
        >
          {filteredFrames.map((frame, index) => (
            <motion.div
              key={frame.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white aspect-[3/4] relative overflow-hidden group cursor-pointer"
            >
              <img
                src={frame.image}
                alt={`Frame ${frame.id}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
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
            href="#contact"
            className="inline-block bg-black text-white px-10 py-3.5 hover:bg-black/90 transition-colors tracking-wider text-sm"
          >
            {t.framing.cta}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
