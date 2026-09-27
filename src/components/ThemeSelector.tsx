import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import {
  BackgroundTheme,
  THEME_LIST,
  getStoredTheme,
  setStoredTheme,
} from '../services/theme';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(getStoredTheme);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
      }
    };
    window.addEventListener('codearena_theme_changed', handleThemeChange);
    return () => window.removeEventListener('codearena_theme_changed', handleThemeChange);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: BackgroundTheme) => {
    setCurrentTheme(id);
    setStoredTheme(id);
    setIsOpen(false);
  };

  const activeMeta = THEME_LIST.find((t) => t.id === currentTheme) || THEME_LIST[0];

  return (
    <div className="relative theme-selector-container" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg text-[#FAFAFA] bg-[#211A28] hover:bg-[#2e2439] border border-[#2e2439] hover:border-[#A855F7]/40 transition-all cursor-pointer group"
        title={`Change Colors (Current: ${activeMeta.label})`}
        aria-label="Change color theme"
      >
        <Palette
          className="w-3.5 h-3.5 transition-transform group-hover:rotate-45"
          style={{ color: activeMeta.accent }}
        />
        {!compact && (
          <span className="hidden sm:inline text-[#FAFAFA]">
            {activeMeta.label}
          </span>
        )}
        <span
          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20 shadow-sm"
          style={{ background: activeMeta.accent }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-2 bg-[#17131C]/95 border border-[#211A28] backdrop-blur-xl rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#211A28] mb-1">
            <span className="text-xs font-mono font-bold text-[#FAFAFA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              Theme Colors
            </span>
            <span className="text-[10px] font-mono text-[#A1A1AA]">
              {THEME_LIST.length} presets
            </span>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
            {THEME_LIST.map((thm) => {
              const isSelected = thm.id === currentTheme;
              return (
                <button
                  key={thm.id}
                  onClick={() => handleSelect(thm.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-[#211A28] text-[#FAFAFA] ring-1 ring-[#A855F7]/50'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#211A28]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full ring-1 ring-white/20 shrink-0 shadow-sm"
                      style={{ background: thm.previewGradient }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#FAFAFA]">
                        {thm.label}
                      </div>
                      <div className="text-[10px] text-[#A1A1AA] line-clamp-1">
                        {thm.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#A855F7] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
