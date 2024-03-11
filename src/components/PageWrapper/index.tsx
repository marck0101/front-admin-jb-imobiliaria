import { ReactNode } from 'react';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

interface Props {
  children: ReactNode;
}

import { motion } from 'framer-motion';

export function PageWrapper({ children }: Props) {
  return (
    <>
      <motion.div
        style={{
          overflow: 'hidden',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-row h-screen w-screen">
          <Sidebar />
          <div className="flex flex-col grow h-screen max-h-screen overflow-hidden">
            <Navbar />
            <div className="overflow-y-auto">{children}</div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
