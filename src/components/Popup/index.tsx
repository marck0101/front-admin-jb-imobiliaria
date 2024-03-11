import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
// import { generateRandomUUID } from "../../helpers/generate-random-uuid";

interface Props {
  isVisible: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onClickOutside?: () => void;
  children: ReactNode;
}

export function Popup({ isVisible, onClickOutside, children }: Props) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleClickOutside = () => {
    if (onClickOutside && typeof onClickOutside == 'function') {
      onClickOutside();
    }
  };

  useEffect(() => {
    setIsPopupVisible(isVisible);
  }, [isVisible]);

  return (
    <>
      <AnimatePresence>
        {isPopupVisible && (
          <motion.div
            onClick={handleClickOutside}
            exit={{
              opacity: 0,
            }}
            // style={{
            //     marginLeft: -480,
            //     width: '110%',
            //     // width: calc(100% - 80)
            // }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="absolute w-screen h-screen top-0 flex flex-col items-center justify-center bg-black/30 z-30"
          >
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
