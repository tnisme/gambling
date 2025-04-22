import { useEffect, useRef } from "react";

export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create and configure audio
    audioRef.current = new Audio("/music/background_music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // Set a comfortable volume level

    // Try to play immediately
    const playMusic = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log("Failed to play background music:", error);
      }
    };

    playMusic();

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
};
