export type BackgroundTheme =
  | 'obsidian'
  | 'deepspace'
  | 'cyber'
  | 'aurora'
  | 'sunset'
  | 'nebula'
  | 'blood'
  | 'solar';

export interface ThemeMeta {
  id: BackgroundTheme;
  label: string;
  accent: string;
  secondary: string;
  previewGradient: string;
  description: string;
}

export const THEME_LIST: ThemeMeta[] = [
  {
    id: 'obsidian',
    label: 'Obsidian Velvet',
    accent: '#A855F7',
    secondary: '#F97316',
    previewGradient: 'linear-gradient(135deg, #0D0B0F, #211A28, #A855F7)',
    description: 'Exact Palette: #0D0B0F base, #211A28 cards, #A855F7 primary, #F97316 secondary',
  },
  {
    id: 'deepspace',
    label: 'Deep Space',
    accent: '#8b5cf6',
    secondary: '#38bdf8',
    previewGradient: 'linear-gradient(135deg, #1e1b4b, #6d28d9, #0b1528)',
    description: 'Royal violet, midnight blue & charcoal starlight',
  },
  {
    id: 'cyber',
    label: 'Cyber Cyan',
    accent: '#06b6d4',
    secondary: '#3b82f6',
    previewGradient: 'linear-gradient(135deg, #082f49, #06b6d4, #040d21)',
    description: 'Electric cyan, neon azure & oceanic sapphire',
  },
  {
    id: 'aurora',
    label: 'Emerald Aurora',
    accent: '#10b981',
    secondary: '#14b8a6',
    previewGradient: 'linear-gradient(135deg, #064e3b, #10b981, #022c22)',
    description: 'Northern lights borealis, mint glow & forest jade',
  },
  {
    id: 'sunset',
    label: 'Synthwave Sunset',
    accent: '#f43f5e',
    secondary: '#f59e0b',
    previewGradient: 'linear-gradient(135deg, #881337, #f43f5e, #f59e0b)',
    description: 'Neon coral, magenta sunset & molten gold',
  },
  {
    id: 'nebula',
    label: 'Cosmic Nebula',
    accent: '#d946ef',
    secondary: '#a855f7',
    previewGradient: 'linear-gradient(135deg, #581c87, #d946ef, #1e1b4b)',
    description: 'Electric fuchsia, psychedelic violet & pulsar pink',
  },
  {
    id: 'blood',
    label: 'Crimson Arena',
    accent: '#ef4444',
    secondary: '#f97316',
    previewGradient: 'linear-gradient(135deg, #7f1d1d, #ef4444, #180507)',
    description: 'Volcanic obsidian, scarlet flame & ruby combat',
  },
  {
    id: 'solar',
    label: 'Solar Eclipse',
    accent: '#f59e0b',
    secondary: '#eab308',
    previewGradient: 'linear-gradient(135deg, #78350f, #f59e0b, #eab308)',
    description: 'Molten gold, sunburst corona & bronze amber',
  },
];

const STORAGE_KEY = 'codearena_bg_theme';

export function getStoredTheme(): BackgroundTheme {
  const stored = localStorage.getItem(STORAGE_KEY) as BackgroundTheme;
  if (stored && THEME_LIST.some((t) => t.id === stored)) {
    return stored;
  }
  return 'obsidian';
}

export function setStoredTheme(theme: BackgroundTheme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new CustomEvent('codearena_theme_changed', { detail: { theme } }));
}
