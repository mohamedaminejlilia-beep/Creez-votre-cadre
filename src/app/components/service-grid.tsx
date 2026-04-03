import { motion } from 'motion/react';
import { Camera, Building2, PartyPopper, Film } from 'lucide-react';
import { useLanguage } from '../i18n/language-context';

export function ServiceGrid() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Building2,
      title: t.services.items.studio.title,
      description: t.services.items.studio.description,
      image: 'https://images.unsplash.com/photo-1767439567636-792a76f6e4b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoeSUyMHN0dWRpb3xlbnwxfHx8fDE3NjgyMjc4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Camera,
      title: t.services.items.corporate.title,
      description: t.services.items.corporate.description,
      image: 'https://images.unsplash.com/photo-1638896150174-bc4c5a858b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODIzNTc4NHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: PartyPopper,
      title: t.services.items.events.title,
      description: t.services.items.events.description,
      image: 'https://images.unsplash.com/photo-1719786625035-71f46082e385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3ZWRkaW5nJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY4MTUzMTkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      icon: Film,
      title: t.services.items.production.title,
      description: t.services.items.production.description,
      image: 'https://images.unsplash.com/photo-1639701386739-449a0e789367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHByb2R1Y3Rpb24lMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY4MTc2OTkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <section id="services" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl tracking-tighter text-white mb-4">
            {t.services.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            {t.services.subtitle}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`group relative overflow-hidden cursor-pointer ${
                  index === 0 ? 'md:col-span-2 md:row-span-1 h-96' : 'h-80'
                }`}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full p-8 flex flex-col justify-end">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Icon className="w-12 h-12 text-amber-400 mb-4" />
                    <h3 className="text-3xl tracking-tight text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-white/70 text-base max-w-md">
                      {service.description}
                    </p>
                  </motion.div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}