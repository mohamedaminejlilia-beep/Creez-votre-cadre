import { motion } from 'motion/react';

export function TrustBar() {
  // Mock client logos - in a real scenario these would be actual brand logos
  const clients = [
    'VOGUE', 'NETFLIX', 'APPLE', 'NIKE', 'GUCCI', 'TESLA', 'SONY', 'DIOR'
  ];

  // Duplicate array for seamless loop
  const allClients = [...clients, ...clients];

  return (
    <section className="bg-black border-y border-white/10 py-8 overflow-hidden">
      <motion.div
        animate={{
          x: [0, -50 + '%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex gap-16 items-center whitespace-nowrap"
      >
        {allClients.map((client, index) => (
          <div
            key={index}
            className="text-white/40 text-2xl md:text-3xl tracking-widest font-light grayscale opacity-50 hover:opacity-100 transition-opacity duration-300"
          >
            {client}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
