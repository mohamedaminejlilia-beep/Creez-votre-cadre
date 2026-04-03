import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/language-context';

export function CaseStudies() {
  const { t, dir } = useLanguage();

  const caseStudies = [
    {
      id: 1,
      title: t.caseStudies.studies.corporate.title,
      client: t.caseStudies.studies.corporate.client,
      category: t.caseStudies.studies.corporate.category,
      description: t.caseStudies.studies.corporate.description,
      image: 'https://images.unsplash.com/photo-1638896150174-bc4c5a858b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODIzNTc4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      metrics: [
        '500+',
        t.caseStudies.studies.corporate.metrics.portraits,
        '5',
        t.caseStudies.studies.corporate.metrics.countries,
        '98%',
        t.caseStudies.studies.corporate.metrics.satisfaction,
      ],
    },
    {
      id: 2,
      title: t.caseStudies.studies.wedding.title,
      client: t.caseStudies.studies.wedding.client,
      category: t.caseStudies.studies.wedding.category,
      description: t.caseStudies.studies.wedding.description,
      image: 'https://images.unsplash.com/photo-1719786625035-71f46082e385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3ZWRkaW5nJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY4MTUzMTkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      metrics: [
        '72',
        t.caseStudies.studies.wedding.metrics.coverage,
        '10K+',
        t.caseStudies.studies.wedding.metrics.photos,
        '2',
        t.caseStudies.studies.wedding.metrics.videographers,
      ],
    },
    {
      id: 3,
      title: t.caseStudies.studies.campaign.title,
      client: t.caseStudies.studies.campaign.client,
      category: t.caseStudies.studies.campaign.category,
      description: t.caseStudies.studies.campaign.description,
      image: 'https://images.unsplash.com/photo-1639701386739-449a0e789367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMHByb2R1Y3Rpb24lMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY4MTc2OTkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      metrics: [
        '15',
        t.caseStudies.studies.campaign.metrics.assets,
        '200+',
        t.caseStudies.studies.campaign.metrics.postProduction,
        '3M+',
        t.caseStudies.studies.campaign.metrics.impressions,
      ],
    },
  ];

  return (
    <section id="case-studies" className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl tracking-tighter text-white mb-4">
            {t.caseStudies.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl">
            {t.caseStudies.subtitle}
          </p>
        </motion.div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div
                  className={`relative aspect-video overflow-hidden ${
                    index % 2 === 1 ? 'md:order-2' : ''
                  }`}
                >
                  <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <div className="mb-3">
                    <span className="text-amber-400 text-sm tracking-wider uppercase">
                      {study.category}
                    </span>
                  </div>

                  <h3 className="text-4xl tracking-tight text-white mb-2">
                    {study.title}
                  </h3>

                  <p className="text-white/40 text-sm tracking-wider mb-4">
                    {study.client}
                  </p>

                  <p className="text-white/70 text-base leading-relaxed mb-6">
                    {study.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {study.metrics.map((metric, i) => (
                      <div key={i}>
                        {i % 2 === 0 ? (
                          <div className="text-3xl text-amber-400 mb-1">
                            {metric}
                          </div>
                        ) : (
                          <div className="text-white/60 text-xs tracking-wider uppercase">
                            {metric}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ x: dir === 'rtl' ? -5 : 5 }}
                    className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors group"
                  >
                    <span className="tracking-wider text-sm">{t.caseStudies.viewFull}</span>
                    <ArrowRight
                      size={16}
                      className={`transition-transform ${
                        dir === 'rtl' ? 'rotate-180' : ''
                      } group-hover:${dir === 'rtl' ? '-translate-x-1' : 'translate-x-1'}`}
                    />
                  </motion.button>
                </div>
              </div>

              {/* Divider */}
              {index < caseStudies.length - 1 && (
                <div className="mt-8 h-px bg-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}