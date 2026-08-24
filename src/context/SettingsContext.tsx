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
    // Apply theme class to document html element
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'theme-ivory-sapphire', 'ivory-sapphire', 'royal', 'nordic', 'espresso', 'theme-royal', 'theme-nordic', 'theme-espresso');
    root.removeAttribute('data-theme');

    if (settings.theme === 'ivory-sapphire') {
      root.classList.add('light', 'theme-ivory-sapphire');
      root.setAttribute('data-theme', 'ivory-sapphire');
    } else {
      const isDark = settings.theme === 'dark' || 
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
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
