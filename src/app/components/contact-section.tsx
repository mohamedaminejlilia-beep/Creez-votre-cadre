import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function ContactSection() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would submit to a backend
    console.log('Form submitted:', formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl tracking-tighter text-white mb-6">
              {t.contact.title}
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              {t.contact.subtitle}
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-white text-xl mb-2">{t.contact.hours.title}</h3>
                <p className="text-white/60">{t.contact.hours.weekdays}</p>
                <p className="text-white/60">{t.contact.hours.saturday}</p>
                <p className="text-white/60">{t.contact.hours.sunday}</p>
              </div>

              <div>
                <h3 className="text-white text-xl mb-2">{t.contact.response.title}</h3>
                <p className="text-white/60">{t.contact.response.text}</p>
              </div>

              <div>
                <h3 className="text-white text-xl mb-2">{t.contact.expect.title}</h3>
                <ul className="space-y-2 text-white/60">
                  {t.contact.expect.items.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <form
              onSubmit={handleSubmit}
              className="backdrop-blur-xl bg-white/5 border border-white/10 p-8"
            >
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white mb-2 text-sm">
                    {t.contact.form.name} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder={t.contact.form.placeholder.name}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white mb-2 text-sm">
                    {t.contact.form.email} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder={t.contact.form.placeholder.email}
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-white mb-2 text-sm">
                    {t.contact.form.service} *
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="" className="bg-black">
                      {t.contact.form.placeholder.service}
                    </option>
                    <option value="studio-rental" className="bg-black">
                      {t.services.items.studio.title}
                    </option>
                    <option value="corporate" className="bg-black">
                      {t.services.items.corporate.title}
                    </option>
                    <option value="events" className="bg-black">
                      {t.services.items.events.title}
                    </option>
                    <option value="post-production" className="bg-black">
                      {t.services.items.production.title}
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white mb-2 text-sm">
                    {t.contact.form.message} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder={t.contact.form.placeholder.message}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black px-8 py-4 transition-all duration-300 flex items-center justify-center gap-2 group font-medium"
                >
                  <span className="tracking-wider">{t.contact.form.submit}</span>
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}