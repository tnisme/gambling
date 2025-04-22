import React, { createContext, useContext, useEffect, useRef } from 'react';

interface AudioContextType {
  audio: HTMLAudioElement | null;
}

const AudioContext = createContext<AudioContextType>({ audio: null });

export const useAudio = () => useContext(AudioContext);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio instance only once
    audioRef.current = new Audio('/music/background_music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Try to play immediately
    const playMusic = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log('Failed to play background music:', error);
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

  return (
    <AudioContext.Provider value={{ audio: audioRef.current }}>
      {children}
    </AudioContext.Provider>
  );
};
