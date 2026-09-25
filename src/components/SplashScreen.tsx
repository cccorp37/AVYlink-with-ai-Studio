import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setVisible(false);
      setTimeout(onComplete, 500); // wait for fade-out
    };

    video.addEventListener("ended", handleEnded);

    // Fallback timeout in case video fails to load
    const fallback = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 8000);

    return () => {
      video.removeEventListener("ended", handleEnded);
      clearTimeout(fallback);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <video
            ref={videoRef}
            src="/splash.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain max-w-md"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
