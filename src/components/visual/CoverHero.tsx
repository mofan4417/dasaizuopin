import { motion } from 'framer-motion';

type CoverHeroProps = {
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export default function CoverHero({ src, alt, eyebrow, title, subtitle }: CoverHeroProps) {
  return (
    <section className="relative w-full aspect-video max-h-[80vh] overflow-hidden">
      <img
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0505]/70 via-[#0A0505]/20 to-[#0A0505]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(139,0,0,0.25)_0%,_transparent_60%)]" />

      <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl space-y-6"
        >
          {eyebrow && (
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{eyebrow}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            <span className="bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#722F37] bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {subtitle && <p className="text-base md:text-xl text-white/50 font-medium leading-relaxed">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  );
}

