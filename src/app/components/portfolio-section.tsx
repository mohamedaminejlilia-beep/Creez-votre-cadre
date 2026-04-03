import { motion } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../i18n/language-context';

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { t } = useLanguage();

  const categories = [
    { key: 'all', label: t.portfolio.categories.all },
    { key: 'corporate', label: t.portfolio.categories.corporate },
    { key: 'editorial', label: t.portfolio.categories.editorial },
    { key: 'events', label: t.portfolio.categories.events },
    { key: 'commercial', label: t.portfolio.categories.commercial },
  ];

  const portfolioItems = [
    {
      id: 1,
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1638896150174-bc4c5a858b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODIzNTc4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      title: t.portfolio.items.executive.title,
      client: t.portfolio.items.executive.client,
    },
    {
      id: 2,
      category: 'editorial',
      image: 'https://images.unsplash.com/photo-1719786625035-71f46082e385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3ZWRkaW5nJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY4MTUzMTkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: t.portfolio.items.luxury.title,
      client: t.portfolio.items.luxury.client,
    },
    {
      id: 3,
      category: 'events',
      image: 'https://images.unsplash.com/photo-1763256377588-f29bdc912698?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBldmVudCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODIzNTc4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      title: t.portfolio.items.tech.title,
      client: t.portfolio.items.tech.client,
    },
    {
      id: 4,
      category: 'commercial',
      image: 'https://images.unsplash.com/photo-1639701386739-449a0e789367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHByb2R1Y3Rpb24lMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY4MTc2OTkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: t.portfolio.items.product.title,
      client: t.portfolio.items.product.client,
    },
    {
      id: 5,
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1767439567636-792a76f6e4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoeSUyMHN0dWRpb3xlbnwxfHx8fDE3NjgyMjc4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: t.portfolio.items.annual.title,
      client: t.portfolio.items.annual.client,
    },
    {
      id: 6,
      category: 'commercial',
      image: 'https://images.unsplash.com/photo-1615458509633-f15b61bdacb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMHN0dWRpbyUyMGxpZ2h0aW5nfGVufDF8fHx8MTc2ODIzMTA3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      title: t.portfolio.items.fashion.title,
      client: t.portfolio.items.fashion.client,
    },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl tracking-tighter text-white mb-4">
            {t.portfolio.title}
          </h2>
          <p className="text-white/60 text-lg">
            {t.portfolio.subtitle}
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.key)}
              className={`px-6 py-2 tracking-wider text-sm transition-all duration-300 ${
                activeCategory === category.key
                  ? 'bg-amber-500 text-black font-medium'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.label.toUpperCase()}
            </motion.button>
          ))}
        </div>

        {/* Full-Bleed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative aspect-square overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-2xl text-white mb-1">{item.title}</h3>
                  <p className="text-amber-400 text-sm tracking-wider">
                    {item.client}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}