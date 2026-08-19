import React from 'react';

interface VirtualKeyboardProps {
  currentExpectedChar: string;
  isPressed?: string | null;
}

interface KeyDef {
  key: string;
  display: string;
  shiftDisplay?: string;
  width?: string; // Tailwind class
  finger?: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';
}

const KEYBOARD_ROWS: KeyDef[][] = [
  // Number row
  [
    { key: '`', display: '`', shiftDisplay: '~' },
    { key: '1', display: '1', shiftDisplay: '!' },
    { key: '2', display: '2', shiftDisplay: '@' },
    { key: '3', display: '3', shiftDisplay: '#' },
    { key: '4', display: '4', shiftDisplay: '$' },
    { key: '5', display: '5', shiftDisplay: '%' },
    { key: '6', display: '6', shiftDisplay: '^' },
    { key: '7', display: '7', shiftDisplay: '&' },
    { key: '8', display: '8', shiftDisplay: '*' },
    { key: '9', display: '9', shiftDisplay: '(' },
    { key: '0', display: '0', shiftDisplay: ')' },
    { key: '-', display: '-', shiftDisplay: '_' },
    { key: '=', display: '=', shiftDisplay: '+' },
    { key: 'Backspace', display: 'Bksp', width: 'w-16 sm:w-20' },
  ],
  // Top row
  [
    { key: 'Tab', display: 'Tab', width: 'w-14 sm:w-16' },
    { key: 'q', display: 'Q' },
    { key: 'w', display: 'W' },
    { key: 'e', display: 'E' },
    { key: 'r', display: 'R' },
    { key: 't', display: 'T' },
    { key: 'y', display: 'Y' },
    { key: 'u', display: 'U' },
    { key: 'i', display: 'I' },
    { key: 'o', display: 'O' },
    { key: 'p', display: 'P' },
    { key: '[', display: '[', shiftDisplay: '{' },
    { key: ']', display: ']', shiftDisplay: '}' },
    { key: '\\', display: '\\', shiftDisplay: '|', width: 'w-12 sm:w-14' },
  ],
  // Home row
  [
    { key: 'CapsLock', display: 'Caps', width: 'w-16 sm:w-18' },
    { key: 'a', display: 'A' },
    { key: 's', display: 'S' },
    { key: 'd', display: 'D' },
    { key: 'f', display: 'F' }, // Anchor key
    { key: 'g', display: 'G' },
    { key: 'h', display: 'H' },
    { key: 'j', display: 'J' }, // Anchor key
    { key: 'k', display: 'K' },
    { key: 'l', display: 'L' },
    { key: ';', display: ';', shiftDisplay: ':' },
    { key: "'", display: "'", shiftDisplay: '"' },
    { key: 'Enter', display: 'Enter', width: 'w-18 sm:w-22' },
  ],
  // Bottom row
  [
    { key: 'ShiftLeft', display: 'Shift', width: 'w-20 sm:w-24' },
    { key: 'z', display: 'Z' },
    { key: 'x', display: 'X' },
    { key: 'c', display: 'C' },
    { key: 'v', display: 'V' },
    { key: 'b', display: 'B' },
    { key: 'n', display: 'N' },
    { key: 'm', display: 'M' },
    { key: ',', display: ',', shiftDisplay: '<' },
    { key: '.', display: '.', shiftDisplay: '>' },
    { key: '/', display: '/', shiftDisplay: '?' },
    { key: 'ShiftRight', display: 'Shift', width: 'w-20 sm:w-24' },
  ],
  // Space row
  [
    { key: 'ControlLeft', display: 'Ctrl', width: 'w-14 sm:w-16' },
    { key: 'AltLeft', display: 'Alt', width: 'w-12 sm:w-14' },
    { key: ' ', display: 'Space', width: 'flex-1 max-w-sm sm:max-w-md' },
    { key: 'AltRight', display: 'Alt', width: 'w-12 sm:w-14' },
    { key: 'ControlRight', display: 'Ctrl', width: 'w-14 sm:w-16' },
  ]
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ currentExpectedChar }) => {
  const needsShift = React.useMemo(() => {
    if (!currentExpectedChar) return false;
    if (currentExpectedChar.length === 1 && /[A-Z]/.test(currentExpectedChar)) return true;
    const shiftSymbols = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?'];
    return shiftSymbols.includes(currentExpectedChar);
  }, [currentExpectedChar]);

  const targetKeyLower = (currentExpectedChar || '').toLowerCase();

  const isKeyActive = (keyDef: KeyDef): boolean => {
    if (!currentExpectedChar) return false;
    if (currentExpectedChar === '\n' && (keyDef.key === 'Enter' || keyDef.key === ' ')) return true;
    if (keyDef.key === ' ' && currentExpectedChar === ' ') return true;
    if (needsShift && (keyDef.key === 'ShiftLeft' || keyDef.key === 'ShiftRight')) {
      // Light up opposite shift or standard shift
      return true;
    }
    if (keyDef.key.toLowerCase() === targetKeyLower) return true;
    if (keyDef.shiftDisplay && keyDef.shiftDisplay === currentExpectedChar) return true;
    if (keyDef.display && keyDef.display === currentExpectedChar) return true;
    return false;
  };

  return (
    <div id="virtual-keyboard-container" className="w-full max-w-4xl mx-auto select-none bg-slate-900/80 dark:bg-slate-950/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2 px-1 text-xs text-slate-400 font-medium">
        <span>Interactive Touch Guide</span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
          Next Key: <span className="text-emerald-400 font-mono font-bold uppercase">{currentExpectedChar === ' ' ? 'SPACE' : currentExpectedChar || 'None'}</span>
        </span>
      </div>

      <div className="flex flex-col gap-1 sm:gap-1.5 items-center w-full overflow-x-auto py-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 sm:gap-1.5 justify-center w-full">
            {row.map((k) => {
              const active = isKeyActive(k);
              const isHomeAnchor = k.key === 'f' || k.key === 'j';
              const widthClass = k.width || 'w-7 sm:w-10 md:w-11';

              return (
                <div
                  key={k.key}
                  id={`key-${k.key}`}
                  className={`
                    ${widthClass} h-8 sm:h-11 md:h-12
                    flex flex-col items-center justify-center
                    rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 relative
                    ${
                      active
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105 font-bold z-10 ring-2 ring-emerald-300'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/60 shadow-sm'
                    }
                  `}
                >
                  {k.shiftDisplay && (
                    <span className={`text-[9px] sm:text-[10px] leading-none mb-0.5 ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                      {k.shiftDisplay}
                    </span>
                  )}
                  <span className="leading-tight">{k.display}</span>
                  {isHomeAnchor && !active && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 bg-slate-400/80 rounded-full" />
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
