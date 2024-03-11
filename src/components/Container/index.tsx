import { ReactNode } from 'react';
import './index.css';

import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

export function Container({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}
