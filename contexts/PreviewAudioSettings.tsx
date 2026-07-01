// Global "mute song previews" setting, persisted so it survives app restarts.
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'previewAudioMuted';

interface PreviewAudioSettingsValue {
  muted: boolean;
  loaded: boolean;
  toggleMuted: () => void;
}

const PreviewAudioSettingsContext = createContext<PreviewAudioSettingsValue>({
  muted: false,
  loaded: false,
  toggleMuted: () => {},
});

export const PreviewAudioSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setMuted(value === 'true'))
      .finally(() => setLoaded(true));
  }, []);

  const toggleMuted = () => {
    setMuted((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <PreviewAudioSettingsContext.Provider value={{ muted, loaded, toggleMuted }}>
      {children}
    </PreviewAudioSettingsContext.Provider>
  );
};

export const usePreviewAudioSettings = () => useContext(PreviewAudioSettingsContext);
