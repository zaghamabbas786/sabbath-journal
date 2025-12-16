'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MusicIcon, PlayIcon, PauseIcon, VolumeIcon, XIcon } from './Icons';
import { SOUNDSCAPES } from '@/constants';
import { SoundscapeTrack } from '@/types';

export const SoundPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SoundscapeTrack>(SOUNDSCAPES[0]);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Load the new audio source
    audio.load();

    const attemptPlay = async () => {
      if (isPlaying) {
        try {
          await audio.play();
        } catch (err) {
          console.warn("Autoplay prevented by browser policy. Waiting for user interaction to start audio.");
          
          const enableAudio = () => {
            audio.play().then(() => {
              document.removeEventListener('click', enableAudio, { capture: true });
              document.removeEventListener('keydown', enableAudio, { capture: true });
            }).catch(e => console.error("Still unable to play audio:", e));
          };

          document.addEventListener('click', enableAudio, { capture: true });
          document.addEventListener('keydown', enableAudio, { capture: true });
        }
      } else {
        audio.pause();
      }
    };

    attemptPlay();
  }, [isPlaying, currentTrack]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const selectTrack = (track: SoundscapeTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in">
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        loop 
        preload="auto"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error("Audio loading error for:", currentTrack.label, currentTrack.src);
          console.error("Error details:", e);
        }}
        onCanPlay={() => console.log("Audio can play:", currentTrack.label)}
        onLoadStart={() => console.log("Audio loading started:", currentTrack.label)}
      />

      {isOpen && (
        <div className="mb-4 bg-paper shadow-paper border border-stone-200 rounded-sm p-4 w-64 animate-slide-up">
          <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
            <span className="text-xs font-serif text-stone-400 uppercase tracking-widest">Soundscape</span>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-ink">
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4 text-stone-500">
            <VolumeIcon className="w-4 h-4" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          <div className="space-y-1">
            {SOUNDSCAPES.map((track) => (
              <button
                key={track.id}
                onClick={() => selectTrack(track)}
                className={`w-full text-left px-3 py-2 text-sm font-body rounded-sm transition-colors flex items-center justify-between ${
                  currentTrack.id === track.id 
                    ? 'bg-stone-100 text-ink font-medium' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-ink'
                }`}
              >
                {track.label}
                {currentTrack.id === track.id && isPlaying && (
                  <span className="block w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center bg-paper shadow-paper border border-stone-200 rounded-full p-1 pr-5 transition-all hover:shadow-lg">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-ink transition-colors focus:outline-none ring-1 ring-black/5"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
        </button>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="ml-3 flex flex-col items-start text-left group"
        >
          <span className="text-[10px] font-sans text-stone-400 uppercase tracking-wider leading-none mb-0.5">
            Soundscape
          </span>
          <span className={`text-sm font-serif leading-none transition-colors ${isOpen ? 'text-gold' : 'text-ink group-hover:text-stone-600'}`}>
            {currentTrack.label}
          </span>
        </button>
      </div>
    </div>
  );
};
