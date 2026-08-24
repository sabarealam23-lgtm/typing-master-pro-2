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
  setFontSize: (size: FontSize) => void;
  setCursorStyle: (style: CursorStyle) => void;
  toggleVirtualKeyboard: () => void;
  setShowVirtualKeyboard: (show: boolean) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings());

  useEffect(() => {
    // Apply theme class and data-theme attribute to document html element
    const root = document.documentElement;
    
    const applyTheme = () => {
      root.classList.remove(
        'light', 
        'dark', 
        'theme-warm', 
        'theme-ivory-sapphire', 
        'ivory-sapphire', 
        'theme-dark', 
        'theme-light'
      );
      root.removeAttribute('data-theme');

      const isWarm = settings.theme === 'warm' || settings.theme === 'ivory-sapphire';

      if (isWarm) {
        root.classList.add('light', 'theme-warm', 'theme-ivory-sapphire');
        root.setAttribute('data-theme', 'warm');
      } else if (settings.theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else if (settings.theme === 'light') {
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
      } else if (settings.theme === 'system') {
        const isSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', isSystemDark ? 'dark' : 'light');
        if (isSystemDark) {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
      }
    };

    applyTheme();

    if (settings.theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleMediaChange);
      return () => mediaQuery.removeEventListener('change', handleMediaChange);
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
  const setFontSize = (fontSize: FontSize) => updateSettings({ fontSize });
  const setCursorStyle = (cursorStyle: CursorStyle) => updateSettings({ cursorStyle });
  const toggleVirtualKeyboard = () => updateSettings({ showVirtualKeyboard: !settings.showVirtualKeyboard });
  const setShowVirtualKeyboard = (showVirtualKeyboard: boolean) => updateSettings({ showVirtualKeyboard });

  const resetToDefaults = () => {
    const defaultVals: UserSettings = { ...DEFAULT_SETTINGS };
    setSettingsState(defaultVals);
    saveSettings(defaultVals);
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
        setFontSize,
        setCursorStyle,
        toggleVirtualKeyboard,
        setShowVirtualKeyboard,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
