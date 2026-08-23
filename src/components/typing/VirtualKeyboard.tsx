import React from 'react';

export interface KeyDef {
  key: string;
  display: string;
  shiftDisplay?: string;
  width?: string;
  fingerZone: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
}

interface VirtualKeyboardProps {
  currentExpectedChar: string;
  onKeyPress?: (key: string) => void;
  hideFingerBadge?: boolean;
}

export interface FingerGuide {
  targetDisplay: string;
  handName: string;
  fingerName: string;
}

const KEYBOARD_ROWS: KeyDef[][] = [
  // Number Row (Row 0)
  [
    { key: '`', display: '`', shiftDisplay: '~', fingerZone: 'pinky' },
    { key: '1', display: '1', shiftDisplay: '!', fingerZone: 'pinky' },
    { key: '2', display: '2', shiftDisplay: '@', fingerZone: 'ring' },
    { key: '3', display: '3', shiftDisplay: '#', fingerZone: 'middle' },
    { key: '4', display: '4', shiftDisplay: '$', fingerZone: 'index' },
    { key: '5', display: '5', shiftDisplay: '%', fingerZone: 'index' },
    { key: '6', display: '6', shiftDisplay: '^', fingerZone: 'index' },
    { key: '7', display: '7', shiftDisplay: '&', fingerZone: 'index' },
    { key: '8', display: '8', shiftDisplay: '*', fingerZone: 'middle' },
    { key: '9', display: '9', shiftDisplay: '(', fingerZone: 'ring' },
    { key: '0', display: '0', shiftDisplay: ')', fingerZone: 'pinky' },
    { key: '-', display: '-', shiftDisplay: '_', fingerZone: 'pinky' },
    { key: '=', display: '=', shiftDisplay: '+', fingerZone: 'pinky' },
    { key: 'Backspace', display: 'Bksp', width: 'w-12 sm:w-16', fingerZone: 'pinky' },
  ],
  // Top Row (Row 1)
  [
    { key: 'Tab', display: 'Tab', width: 'w-10 sm:w-14', fingerZone: 'pinky' },
    { key: 'q', display: 'Q', fingerZone: 'pinky' },
    { key: 'w', display: 'W', fingerZone: 'ring' },
    { key: 'e', display: 'E', fingerZone: 'middle' },
    { key: 'r', display: 'R', fingerZone: 'index' },
    { key: 't', display: 'T', fingerZone: 'index' },
    { key: 'y', display: 'Y', fingerZone: 'index' },
    { key: 'u', display: 'U', fingerZone: 'index' },
    { key: 'i', display: 'I', fingerZone: 'middle' },
    { key: 'o', display: 'O', fingerZone: 'ring' },
    { key: 'p', display: 'P', fingerZone: 'pinky' },
    { key: '[', display: '[', shiftDisplay: '{', fingerZone: 'pinky' },
    { key: ']', display: ']', shiftDisplay: '}', fingerZone: 'pinky' },
    { key: '\\', display: '\\', shiftDisplay: '|', width: 'w-9 sm:w-12', fingerZone: 'pinky' },
  ],
  // Home Row (Row 2)
  [
    { key: 'CapsLock', display: 'Caps', width: 'w-12 sm:w-16', fingerZone: 'pinky' },
    { key: 'a', display: 'A', fingerZone: 'pinky' },
    { key: 's', display: 'S', fingerZone: 'ring' },
    { key: 'd', display: 'D', fingerZone: 'middle' },
    { key: 'f', display: 'F', fingerZone: 'index' },
    { key: 'g', display: 'G', fingerZone: 'index' },
    { key: 'h', display: 'H', fingerZone: 'index' },
    { key: 'j', display: 'J', fingerZone: 'index' },
    { key: 'k', display: 'K', fingerZone: 'middle' },
    { key: 'l', display: 'L', fingerZone: 'ring' },
    { key: ';', display: ';', shiftDisplay: ':', fingerZone: 'pinky' },
    { key: "'", display: "'", shiftDisplay: '"', fingerZone: 'pinky' },
    { key: 'Enter', display: 'Enter', width: 'w-14 sm:w-20', fingerZone: 'pinky' },
  ],
  // Bottom Row (Row 3)
  [
    { key: 'ShiftLeft', display: 'Shift', width: 'w-14 sm:w-20', fingerZone: 'pinky' },
    { key: 'z', display: 'Z', fingerZone: 'pinky' },
    { key: 'x', display: 'X', fingerZone: 'ring' },
    { key: 'c', display: 'C', fingerZone: 'middle' },
    { key: 'v', display: 'V', fingerZone: 'index' },
    { key: 'b', display: 'B', fingerZone: 'index' },
    { key: 'n', display: 'N', fingerZone: 'index' },
    { key: 'm', display: 'M', fingerZone: 'index' },
    { key: ',', display: ',', shiftDisplay: '<', fingerZone: 'middle' },
    { key: '.', display: '.', shiftDisplay: '>', fingerZone: 'ring' },
    { key: '/', display: '/', shiftDisplay: '?', fingerZone: 'pinky' },
    { key: 'ShiftRight', display: 'Shift', width: 'w-14 sm:w-20', fingerZone: 'pinky' },
  ],
  // Space Row (Row 4)
  [
    { key: 'ControlLeft', display: 'Ctrl', width: 'w-10 sm:w-12', fingerZone: 'pinky' },
    { key: 'AltLeft', display: 'Alt', width: 'w-9 sm:w-10', fingerZone: 'thumb' },
    { key: ' ', display: 'Space', width: 'flex-1 max-w-sm sm:max-w-md', fingerZone: 'thumb' },
    { key: 'AltRight', display: 'Alt', width: 'w-9 sm:w-10', fingerZone: 'thumb' },
    { key: 'ControlRight', display: 'Ctrl', width: 'w-10 sm:w-12', fingerZone: 'pinky' },
  ]
];

export function getFingerGuide(char: string): FingerGuide {
  if (!char) {
    return {
      targetDisplay: 'None',
      handName: 'Left Hand',
      fingerName: 'Index Finger',
    };
  }

  if (char === ' ') {
    return {
      targetDisplay: 'SPACEBAR',
      handName: 'Both Hands',
      fingerName: 'Thumb',
    };
  }

  if (char === '\n') {
    return {
      targetDisplay: 'ENTER',
      handName: 'Right Hand',
      fingerName: 'Pinky Finger',
    };
  }

  const c = char.toLowerCase();
  const targetDisplay = char.toUpperCase();

  // Left Hand Fingers
  if (['1', '!', '`', '~', 'q', 'a', 'z'].includes(c)) {
    return { targetDisplay, handName: 'Left Hand', fingerName: 'Pinky Finger' };
  }
  if (['2', '@', 'w', 's', 'x'].includes(c)) {
    return { targetDisplay, handName: 'Left Hand', fingerName: 'Ring Finger' };
  }
  if (['3', '#', 'e', 'd', 'c'].includes(c)) {
    return { targetDisplay, handName: 'Left Hand', fingerName: 'Middle Finger' };
  }
  if (['4', '$', '5', '%', 'r', 't', 'f', 'g', 'v', 'b'].includes(c)) {
    return { targetDisplay, handName: 'Left Hand', fingerName: 'Index Finger' };
  }

  // Right Hand Fingers
  if (['6', '^', '7', '&', 'y', 'u', 'h', 'j', 'n', 'm'].includes(c)) {
    return { targetDisplay, handName: 'Right Hand', fingerName: 'Index Finger' };
  }
  if (['8', '*', 'i', 'k', ',', '<'].includes(c)) {
    return { targetDisplay, handName: 'Right Hand', fingerName: 'Middle Finger' };
  }
  if (['9', '(', 'o', 'l', '.', '>'].includes(c)) {
    return { targetDisplay, handName: 'Right Hand', fingerName: 'Ring Finger' };
  }

  // Default to Right Pinky for remaining symbols and keys
  return { targetDisplay, handName: 'Right Hand', fingerName: 'Pinky Finger' };
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  currentExpectedChar, 
  onKeyPress,
  hideFingerBadge = false
}) => {
  const needsShift = React.useMemo(() => {
    if (!currentExpectedChar) return false;
    if (currentExpectedChar.length === 1 && /[A-Z]/.test(currentExpectedChar)) return true;
    const shiftSymbols = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?'];
    return shiftSymbols.includes(currentExpectedChar);
  }, [currentExpectedChar]);

  const targetKeyLower = (currentExpectedChar || '').toLowerCase();
  const fingerGuide = React.useMemo(() => getFingerGuide(currentExpectedChar), [currentExpectedChar]);

  const isKeyActive = (keyDef: KeyDef): boolean => {
    if (!currentExpectedChar) return false;
    if (currentExpectedChar === '\n' && (keyDef.key === 'Enter' || keyDef.key === ' ')) return true;
    if (keyDef.key === ' ' && currentExpectedChar === ' ') return true;
    if (needsShift && (keyDef.key === 'ShiftLeft' || keyDef.key === 'ShiftRight')) {
      return true;
    }
    if (keyDef.key.toLowerCase() === targetKeyLower) return true;
    if (keyDef.shiftDisplay && keyDef.shiftDisplay === currentExpectedChar) return true;
    if (keyDef.display && keyDef.display === currentExpectedChar) return true;
    return false;
  };

  const handleKeyClick = (key: string) => {
    if (onKeyPress) {
      if (key === 'Space') onKeyPress(' ');
      else if (key === 'Enter') onKeyPress('\n');
      else if (key === 'Bksp' || key === 'Backspace') onKeyPress('Backspace');
      else onKeyPress(key);
    }
  };

  return (
    <div 
      id="virtual-keyboard-root" 
      className="w-full max-w-4xl mx-auto select-none space-y-2"
    >
      {/* Target Key & Finger Guide Badge (rendered only if not rendered above in parent) */}
      {!hideFingerBadge && (
        <div 
          id="dynamic-finger-guide-badge"
          className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>Target:</span>
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              {fingerGuide.targetDisplay}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Use:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {fingerGuide.handName} • {fingerGuide.fingerName}
            </span>
          </div>

          {/* Home Row Reminder Hint */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
            <span>Home Row: ASDF JKL;</span>
          </div>
        </div>
      )}

      {/* Clean Minimal Virtual Keyboard Matrix (No outer frame/border/background panel) */}
      <div 
        id="virtual-keyboard-matrix"
        className="w-full flex flex-col gap-1 sm:gap-1.5 items-center overflow-x-auto select-none py-1"
      >
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 sm:gap-1.5 justify-center w-full">
            {row.map((k) => {
              const active = isKeyActive(k);
              const isHomeAnchor = k.key === 'f' || k.key === 'j';
              const widthClass = k.width || 'w-6 sm:w-9 md:w-10';

              return (
                <div
                  key={k.key}
                  id={`key-${k.key}`}
                  onClick={() => handleKeyClick(k.display)}
                  className={`
                    ${widthClass} h-8 sm:h-9 md:h-10
                    flex flex-col items-center justify-center
                    rounded-md sm:rounded-lg transition-all duration-100 relative cursor-pointer select-none border shadow-xs
                    ${
                      active
                        ? 'bg-cyan-500 dark:bg-cyan-500 text-white shadow-md shadow-cyan-500/40 scale-105 font-bold z-10 ring-2 ring-cyan-300 dark:ring-cyan-400 border-cyan-400'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/80'
                    }
                  `}
                >
                  {/* Shift Symbol */}
                  {k.shiftDisplay ? (
                    <div className="flex flex-col items-center leading-none">
                      <span className={`text-[8px] sm:text-[9px] font-mono leading-none ${active ? 'text-cyan-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        {k.shiftDisplay}
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs font-semibold leading-tight mt-0.5">
                        {k.display}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] sm:text-xs font-semibold leading-none">
                      {k.display}
                    </span>
                  )}

                  {/* Subtle tactile bump indicator on F and J */}
                  {isHomeAnchor && !active && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 bg-cyan-500/80 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
