


import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
interface Props {
  title: string;
  subtitle?: string;
  cta?: {
    text: string;
    to?: string;
    onClick?: () => void;
  }
}

export function NotFound({ title, subtitle, cta }: Props) {

  const navigate = useNavigate();

  if (!cta) return (
    <div className="flex w-full items-center rounded-lg bg-white shadow-sm py-5 px-10 border-l-4 border-primary/90">
      <p className="text-primary/90 text-base font-semibold">{title}</p>
    </div>
  );

  return (
    <div className="flex flex-col w-full items-center rounded-lg bg-trasnparent border border-slate-300 shadow-sm">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.25 }}
        className="h-full w-full flex flex-col items-center px-4 py-8"
      >

        <p className="text-black text-lg font-semibold">{title}</p>
        <p className="text-slate-400 text-sm mt-1 w-8/12 text-center">{subtitle}</p>

        <button
          onClick={() => cta.to ? navigate(cta.to) : cta.onClick()}
          className="hover:bg-transparent border border-primary hover:text-primary transition-all duration-150 mt-4 bg-primary w-fit px-6 py-2.5 text-white font-semibold rounded-lg text-xs"
        >
          {cta.text}
        </button>
      </motion.div>
    </div>
  );

}
