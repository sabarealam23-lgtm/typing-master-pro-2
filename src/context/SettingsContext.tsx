import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, ThemeMode, SoundType, FontSize, CursorStyle } from '../types';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundType: (type: SoundType) => void;
  setSoundVolume: (volume: number) => void;
  setShowVirtualKeyboard: (show: boolean) => void;
  setFontSize: (size: FontSize) => void;
  setCursorStyle: (style: CursorStyle) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings());

  useEffect(() => {
    // Apply theme class to document html element
    const root = document.documentElement;
    const isDark = settings.theme === 'dark' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  const setTheme = (theme: ThemeMode) => updateSettings({ theme });
  const setSoundEnabled = (soundEnabled: boolean) => updateSettings({ soundEnabled });
  const setSoundType = (soundType: SoundType) => updateSettings({ soundType });
  const setSoundVolume = (soundVolume: number) => updateSettings({ soundVolume });
  const setShowVirtualKeyboard = (showVirtualKeyboard: boolean) => updateSettings({ showVirtualKeyboard });
  const setFontSize = (fontSize: FontSize) => updateSettings({ fontSize });
  const setCursorStyle = (cursorStyle: CursorStyle) => updateSettings({ cursorStyle });

  const resetToDefaults = () => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        setTheme,
        setSoundEnabled,
        setSoundType,
        setSoundVolume,
        setShowVirtualKeyboard,
        setFontSize,
        setCursorStyle,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
