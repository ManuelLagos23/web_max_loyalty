'use client';

import { motion } from 'framer-motion';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.42, 0, 0.58, 1], // ease-in-out suave
      }}
    >
      {children}
    </motion.div>
  );
}
