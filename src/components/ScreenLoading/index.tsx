import { Player } from '@lottiefiles/react-lottie-player';
import { useEffect, useState } from 'react';
import { useInterval } from '../../hooks/useInterval';

import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  captions?: Array<string>;
  timeBetweenCaptions?: number;
  isVisible: boolean;
}

export function ScreenLoading({
  isVisible,
  captions = ['Carregando...'],
  timeBetweenCaptions,
}: Props) {
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    setCaptionIndex(0);
  }, [isVisible]);

  useInterval(() => {
    if (captionIndex != captions.length - 1) {
      setCaptionIndex(captionIndex + 1);
    }
  }, timeBetweenCaptions || 3000);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            onClick={() => (isVisible = false)}
            exit={{
              opacity: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute w-screen h-screen top-0 flex flex-col items-center justify-center bg-primary z-30"
          >
            <Player
              src="https://lottie.host/e5f7bd94-5f65-4c7e-9b9d-4b4b3a4edf36/7gTu4dO7UI.json"
              className="player w-96"
              style={{
                width: 450,
                marginTop: -90,
              }}
              loop
              autoplay
            />
            <p
              style={{
                marginTop: 0,
              }}
              className="font-bold text-white text-3xl w-6/12 text-center"
            >
              Carregando...
            </p>
            <p className="font-light text-white text-xl w-3/12 text-center mt-4 line-clamp-2	">
              {captions[captionIndex]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
