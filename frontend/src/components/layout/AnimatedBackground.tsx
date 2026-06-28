import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-accent-violet/10 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -right-32 top-1/3 h-[600px] w-[600px] rounded-full bg-accent-blue/8 blur-[140px]"
      />
      <motion.div
        animate={{
          x: [0, 20, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-accent-cyan/6 blur-[100px]"
      />

      <div className="noise-overlay absolute inset-0 opacity-50" />
    </div>
  );
}

export function LandingBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#030303]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 50%),
            radial-gradient(circle at 100% 50%, rgba(59, 130, 246, 0.1), transparent 40%),
            radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.08), transparent 40%)`,
        }}
      />
      <div className="absolute inset-0 dot-pattern opacity-20" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02]"
      />
    </div>
  );
}
