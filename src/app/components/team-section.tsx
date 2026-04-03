import { motion } from 'motion/react';
import { useLanguage } from '../i18n/language-context';

interface TeamMember {
  name: string;
  description: string;
  image: string;
}

export function TeamSection() {
  const { t } = useLanguage();

  const teamMembers: TeamMember[] = [
    {
      name: t.team?.members?.[0]?.name || 'Directeur Technique',
      description: t.team?.members?.[0]?.description || 'Expertise en éclairage et mise en scène.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
    {
      name: t.team?.members?.[1]?.name || 'Lead Photographe',
      description: t.team?.members?.[1]?.description || 'Spécialiste du portrait et de l\'émotion.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    },
    {
      name: t.team?.members?.[2]?.name || 'Expert Post-Production',
      description: t.team?.members?.[2]?.description || 'Retouche haute précision et étalonnage.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    },
  ];

  return (
    <section id="team" className="py-24 px-6 bg-black">
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
            {t.team?.title || 'L\'ÉQUIPE DE PRODUCTION'}
          </h2>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="border border-white/10"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden bg-zinc-900">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl text-white mb-2 tracking-tight uppercase">
                  {member.name}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}