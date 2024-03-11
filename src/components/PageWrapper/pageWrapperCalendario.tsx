import { ReactNode } from 'react';
import { SidebarCalendario } from '../Sidebar/navbarCalendario';
import { motion } from 'framer-motion';
import { NavbarCalendario } from '../Navbar/navbarCalendario';

interface Props {
  children: ReactNode;
}

export function PageWrapperCalendario({ children }: Props) {
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
          <SidebarCalendario />
          <div className="flex flex-col grow h-screen max-h-screen overflow-hidden">
            <NavbarCalendario />
            <div className="overflow-y-auto">{children}</div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
