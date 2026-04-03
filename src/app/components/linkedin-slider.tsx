import { motion } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function LinkedInSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const { t } = useLanguage();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-sm tracking-wider uppercase text-black/60 mb-4 block">
            {t.linkedin?.badge || 'NOUVEAUTÉ'}
          </span>
          <h2 className="text-5xl md:text-6xl tracking-tighter text-black mb-6">
            {t.linkedin?.title || 'Portrait LinkedIn Professionnel'}
          </h2>
          <p className="text-black/60 text-lg max-w-2xl mx-auto">
            {t.linkedin?.description ||
              'Transformez votre selfie en portrait professionnel de haute qualité. Voyez la différence par vous-même.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Before/After Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-black">
            {/* After Image (Professional Portrait) */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzfGVufDF8fHx8MTc2ODIzNTc4M3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Portrait Professionnel Yapas"
                className="w-full h-full object-cover"
              />
              {/* Label */}
              <div className="absolute top-4 right-4 bg-white text-black px-4 py-2 text-sm tracking-wider">
                {t.linkedin?.after || 'YAPAS PRO'}
              </div>
            </div>

            {/* Before Image (Selfie) - Clipped by slider position */}
            <div
              className="absolute inset-0 transition-all duration-100"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBwb3J0cmFpdCUyMHNlbGZpZXxlbnwxfHx8fDE3NjgyMzU3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Selfie Standard"
                className="w-full h-full object-cover"
              />
              {/* Label */}
              <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 text-sm tracking-wider">
                {t.linkedin?.before || 'SELFIE'}
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Slider Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-ew-resize">
                <div className="flex gap-1">
                  <div className="w-0.5 h-4 bg-black"></div>
                  <div className="w-0.5 h-4 bg-black"></div>
                </div>
              </div>
            </div>

            {/* Hidden Range Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <button className="bg-amber-500 text-black px-12 py-4 hover:bg-amber-400 transition-all duration-300 hover:scale-105 text-sm tracking-wider font-medium">
              {t.linkedin?.cta || 'RÉSERVER MA SESSION LINKEDIN'}
            </button>
            <p className="text-black/60 text-sm mt-4">
              {t.linkedin?.price || 'À partir de 299 DH | Session 30 min | Retouches incluses'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}