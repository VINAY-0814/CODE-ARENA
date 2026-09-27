import React, { useEffect, useRef, useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import {
  BackgroundTheme,
  THEME_LIST,
  getStoredTheme,
  setStoredTheme,
} from '../services/theme';

interface ThemeConfig {
  name: BackgroundTheme;
  label: string;
  accent: string;
  bgGradient: string;
  orb1: string;
  orb2: string;
  orb3: string;
  particleColor: string;
  lineColor: string;
  packetColor: string;
  meshFillColor: string;
  scanBeamColor: string;
  gridColor: string;
  tokens: Array<{
    text: string;
    top: string;
    left: string;
    color: string;
    glow: string;
    animClass: string;
    delay: string;
    size: string;
  }>;
}

const THEMES: Record<BackgroundTheme, ThemeConfig> = {
  obsidian: {
    name: 'obsidian',
    label: 'Obsidian Velvet',
    accent: '#A855F7',
    bgGradient: 'radial-gradient(ellipse at 50% -10%, #211A28 0%, #17131C 40%, #0D0B0F 85%, #08060A 100%)',
    orb1: 'rgba(168, 85, 247, 0.35)',
    orb2: 'rgba(249, 115, 22, 0.28)',
    orb3: 'rgba(33, 26, 40, 0.45)',
    particleColor: 'rgba(168, 85, 247, ',
    lineColor: 'rgba(168, 85, 247, ',
    packetColor: '#F97316',
    meshFillColor: 'rgba(168, 85, 247, 0.045)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(168, 85, 247, 0.16), rgba(249, 115, 22, 0.2), transparent)',
    gridColor: 'rgba(168, 85, 247, 0.04)',
    tokens: [
      { text: '< >', top: '14%', left: '7%', color: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: '{ }', top: '24%', left: '89%', color: '#F97316', glow: 'rgba(249, 115, 22, 0.6)', animClass: 'animate-float-2', delay: '0.8s', size: 'text-base' },
      { text: '[ ]', top: '76%', left: '11%', color: '#FAFAFA', glow: 'rgba(250, 250, 250, 0.55)', animClass: 'animate-float-1', delay: '1.8s', size: 'text-sm' },
      { text: '( )', top: '84%', left: '85%', color: '#22C55E', glow: 'rgba(34, 197, 94, 0.55)', animClass: 'animate-float-2', delay: '1.2s', size: 'text-sm' },
      { text: '01', top: '42%', left: '4%', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', animClass: 'animate-float-1', delay: '1.4s', size: 'text-xs' },
      { text: '1010', top: '62%', left: '93%', color: '#A1A1AA', glow: 'rgba(161, 161, 170, 0.5)', animClass: 'animate-float-2', delay: '2.4s', size: 'text-xs' },
      { text: 'const', top: '16%', left: '76%', color: '#A855F7', glow: 'rgba(168, 85, 247, 0.5)', animClass: 'animate-float-1', delay: '0.5s', size: 'text-xs' },
      { text: 'function', top: '90%', left: '40%', color: '#F97316', glow: 'rgba(249, 115, 22, 0.5)', animClass: 'animate-float-2', delay: '2.1s', size: 'text-xs' },
      { text: 'if', top: '34%', left: '19%', color: '#EF4444', glow: 'rgba(239, 68, 68, 0.45)', animClass: 'animate-float-1', delay: '0.3s', size: 'text-xs' },
      { text: 'for', top: '69%', left: '74%', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', animClass: 'animate-float-2', delay: '1.6s', size: 'text-xs' },
      { text: '=>', top: '50%', left: '86%', color: '#22C55E', glow: 'rgba(34, 197, 94, 0.55)', animClass: 'animate-float-1', delay: '1.0s', size: 'text-sm' },
      { text: 'return', top: '11%', left: '46%', color: '#FAFAFA', glow: 'rgba(250, 250, 250, 0.5)', animClass: 'animate-float-2', delay: '2.8s', size: 'text-xs' },
    ],
  },
  deepspace: {
    name: 'deepspace',
    label: 'Deep Space',
    accent: '#8b5cf6',
    bgGradient: 'radial-gradient(ellipse at 50% -10%, #1e1b4b 0%, #0c1228 35%, #080a12 70%, #040508 100%)',
    orb1: 'rgba(109, 40, 217, 0.38)',
    orb2: 'rgba(30, 58, 138, 0.35)',
    orb3: 'rgba(76, 29, 149, 0.3)',
    particleColor: 'rgba(167, 139, 250, ',
    lineColor: 'rgba(124, 58, 237, ',
    packetColor: '#a78bfa',
    meshFillColor: 'rgba(109, 40, 217, 0.05)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(139, 92, 246, 0.18), rgba(30, 58, 138, 0.25), transparent)',
    gridColor: 'rgba(139, 92, 246, 0.045)',
    tokens: [
      { text: '< >', top: '14%', left: '7%', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: '{ }', top: '24%', left: '89%', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.6)', animClass: 'animate-float-2', delay: '0.8s', size: 'text-base' },
      { text: '[ ]', top: '76%', left: '11%', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.55)', animClass: 'animate-float-1', delay: '1.8s', size: 'text-sm' },
      { text: '( )', top: '84%', left: '85%', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.55)', animClass: 'animate-float-2', delay: '1.2s', size: 'text-sm' },
      { text: '01', top: '42%', left: '4%', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', animClass: 'animate-float-1', delay: '1.4s', size: 'text-xs' },
      { text: '1010', top: '62%', left: '93%', color: '#93c5fd', glow: 'rgba(147, 197, 253, 0.5)', animClass: 'animate-float-2', delay: '2.4s', size: 'text-xs' },
      { text: 'const', top: '16%', left: '76%', color: '#d8b4fe', glow: 'rgba(216, 180, 254, 0.5)', animClass: 'animate-float-1', delay: '0.5s', size: 'text-xs' },
      { text: 'function', top: '90%', left: '40%', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.5)', animClass: 'animate-float-2', delay: '2.1s', size: 'text-xs' },
      { text: 'if', top: '34%', left: '19%', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.45)', animClass: 'animate-float-1', delay: '0.3s', size: 'text-xs' },
      { text: 'for', top: '69%', left: '74%', color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.5)', animClass: 'animate-float-2', delay: '1.6s', size: 'text-xs' },
      { text: '=>', top: '50%', left: '86%', color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.55)', animClass: 'animate-float-1', delay: '1.0s', size: 'text-sm' },
      { text: 'return', top: '11%', left: '46%', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)', animClass: 'animate-float-2', delay: '2.8s', size: 'text-xs' },
    ],
  },
  cyber: {
    name: 'cyber',
    label: 'Cyber Cyan',
    accent: '#06b6d4',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #041f33 0%, #031020 45%, #02070e 100%)',
    orb1: 'rgba(6, 182, 212, 0.35)',
    orb2: 'rgba(14, 165, 233, 0.3)',
    orb3: 'rgba(59, 130, 246, 0.25)',
    particleColor: 'rgba(103, 232, 249, ',
    lineColor: 'rgba(56, 189, 248, ',
    packetColor: '#38bdf8',
    meshFillColor: 'rgba(6, 182, 212, 0.045)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.25), transparent)',
    gridColor: 'rgba(6, 182, 212, 0.045)',
    tokens: [
      { text: '< >', top: '14%', left: '7%', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: '{ }', top: '24%', left: '89%', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)', animClass: 'animate-float-2', delay: '1.2s', size: 'text-base' },
      { text: '[ ]', top: '76%', left: '11%', color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.55)', animClass: 'animate-float-1', delay: '2.8s', size: 'text-sm' },
      { text: '( )', top: '84%', left: '85%', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.55)', animClass: 'animate-float-2', delay: '1.8s', size: 'text-sm' },
      { text: '01', top: '42%', left: '4%', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', animClass: 'animate-float-1', delay: '2.2s', size: 'text-xs' },
      { text: '1010', top: '62%', left: '93%', color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.5)', animClass: 'animate-float-2', delay: '3.6s', size: 'text-xs' },
      { text: 'const', top: '16%', left: '76%', color: '#7dd3fc', glow: 'rgba(125, 211, 252, 0.5)', animClass: 'animate-float-1', delay: '0.8s', size: 'text-xs' },
      { text: 'function', top: '90%', left: '40%', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', animClass: 'animate-float-2', delay: '3.2s', size: 'text-xs' },
      { text: 'if', top: '34%', left: '19%', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)', animClass: 'animate-float-1', delay: '0.4s', size: 'text-xs' },
      { text: 'for', top: '69%', left: '74%', color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.45)', animClass: 'animate-float-2', delay: '2.5s', size: 'text-xs' },
      { text: '=>', top: '50%', left: '86%', color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.55)', animClass: 'animate-float-1', delay: '1.6s', size: 'text-sm' },
      { text: 'return', top: '11%', left: '46%', color: '#bae6fd', glow: 'rgba(186, 230, 253, 0.5)', animClass: 'animate-float-2', delay: '4.0s', size: 'text-xs' },
    ],
  },
  aurora: {
    name: 'aurora',
    label: 'Emerald Aurora',
    accent: '#10b981',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #032b1b 0%, #021a10 50%, #010a06 100%)',
    orb1: 'rgba(16, 185, 129, 0.35)',
    orb2: 'rgba(20, 184, 166, 0.3)',
    orb3: 'rgba(5, 150, 105, 0.25)',
    particleColor: 'rgba(52, 211, 153, ',
    lineColor: 'rgba(16, 185, 129, ',
    packetColor: '#34d399',
    meshFillColor: 'rgba(16, 185, 129, 0.05)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.26), transparent)',
    gridColor: 'rgba(16, 185, 129, 0.045)',
    tokens: [
      { text: '0101', top: '12%', left: '8%', color: '#34d399', glow: 'rgba(52, 211, 153, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: '1100', top: '22%', left: '88%', color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', animClass: 'animate-float-2', delay: '1s', size: 'text-sm' },
      { text: '0x7F', top: '78%', left: '10%', color: '#6ee7b7', glow: 'rgba(110, 231, 183, 0.5)', animClass: 'animate-float-1', delay: '2.5s', size: 'text-xs' },
      { text: 'ptr*', top: '82%', left: '83%', color: '#a7f3d0', glow: 'rgba(167, 243, 208, 0.5)', animClass: 'animate-float-2', delay: '1.5s', size: 'text-sm' },
      { text: 'exec', top: '40%', left: '5%', color: '#059669', glow: 'rgba(5, 150, 105, 0.5)', animClass: 'animate-float-1', delay: '2s', size: 'text-xs' },
      { text: 'malloc', top: '64%', left: '91%', color: '#34d399', glow: 'rgba(52, 211, 153, 0.5)', animClass: 'animate-float-2', delay: '3.2s', size: 'text-xs' },
      { text: 'asm', top: '18%', left: '74%', color: '#6ee7b7', glow: 'rgba(110, 231, 183, 0.4)', animClass: 'animate-float-1', delay: '0.6s', size: 'text-xs' },
      { text: 'thread', top: '88%', left: '42%', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', animClass: 'animate-float-2', delay: '2.8s', size: 'text-xs' },
      { text: '0x00', top: '32%', left: '17%', color: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', animClass: 'animate-float-1', delay: '0.3s', size: 'text-xs' },
      { text: 'loop', top: '66%', left: '70%', color: '#86efac', glow: 'rgba(134, 239, 172, 0.4)', animClass: 'animate-float-2', delay: '2.2s', size: 'text-xs' },
      { text: '0xFF', top: '53%', left: '85%', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.6)', animClass: 'animate-float-1', delay: '1.4s', size: 'text-sm' },
      { text: 'sys.call', top: '10%', left: '44%', color: '#a3e635', glow: 'rgba(163, 230, 53, 0.5)', animClass: 'animate-float-2', delay: '3.8s', size: 'text-xs' },
    ],
  },
  sunset: {
    name: 'sunset',
    label: 'Synthwave Sunset',
    accent: '#f43f5e',
    bgGradient: 'radial-gradient(ellipse at 50% -10%, #3b0720 0%, #1e0515 45%, #0a0208 100%)',
    orb1: 'rgba(244, 63, 94, 0.38)',
    orb2: 'rgba(245, 158, 11, 0.32)',
    orb3: 'rgba(217, 70, 239, 0.28)',
    particleColor: 'rgba(251, 113, 133, ',
    lineColor: 'rgba(244, 63, 94, ',
    packetColor: '#fbbf24',
    meshFillColor: 'rgba(244, 63, 94, 0.05)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.25), transparent)',
    gridColor: 'rgba(244, 63, 94, 0.045)',
    tokens: [
      { text: '< >', top: '15%', left: '8%', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: '{ }', top: '26%', left: '87%', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)', animClass: 'animate-float-2', delay: '1.1s', size: 'text-base' },
      { text: '[ ]', top: '74%', left: '13%', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.55)', animClass: 'animate-float-1', delay: '2.7s', size: 'text-sm' },
      { text: '( )', top: '83%', left: '84%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)', animClass: 'animate-float-2', delay: '1.7s', size: 'text-sm' },
      { text: 'synth', top: '44%', left: '5%', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)', animClass: 'animate-float-1', delay: '2.1s', size: 'text-xs' },
      { text: 'wave', top: '61%', left: '92%', color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)', animClass: 'animate-float-2', delay: '3.5s', size: 'text-xs' },
      { text: 'glow', top: '17%', left: '77%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', animClass: 'animate-float-1', delay: '0.7s', size: 'text-xs' },
      { text: 'neon', top: '89%', left: '38%', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', animClass: 'animate-float-2', delay: '3.1s', size: 'text-xs' },
      { text: 'sunset', top: '36%', left: '20%', color: '#fb923c', glow: 'rgba(251, 146, 60, 0.45)', animClass: 'animate-float-1', delay: '0.5s', size: 'text-xs' },
      { text: 'drift', top: '67%', left: '71%', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.45)', animClass: 'animate-float-2', delay: '2.4s', size: 'text-xs' },
      { text: '=>', top: '51%', left: '85%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)', animClass: 'animate-float-1', delay: '1.5s', size: 'text-sm' },
      { text: 'return', top: '12%', left: '47%', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.5)', animClass: 'animate-float-2', delay: '3.9s', size: 'text-xs' },
    ],
  },
  nebula: {
    name: 'nebula',
    label: 'Cosmic Nebula',
    accent: '#d946ef',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #2b0638 0%, #15021e 50%, #08010d 100%)',
    orb1: 'rgba(217, 70, 239, 0.35)',
    orb2: 'rgba(168, 85, 247, 0.32)',
    orb3: 'rgba(236, 72, 153, 0.28)',
    particleColor: 'rgba(232, 121, 249, ',
    lineColor: 'rgba(217, 70, 239, ',
    packetColor: '#f472b6',
    meshFillColor: 'rgba(217, 70, 239, 0.05)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(217, 70, 239, 0.2), rgba(168, 85, 247, 0.26), transparent)',
    gridColor: 'rgba(217, 70, 239, 0.045)',
    tokens: [
      { text: '< >', top: '15%', left: '8%', color: '#e879f9', glow: 'rgba(232, 121, 249, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: '{ }', top: '26%', left: '87%', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', animClass: 'animate-float-2', delay: '1.1s', size: 'text-base' },
      { text: '[ ]', top: '74%', left: '13%', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)', animClass: 'animate-float-1', delay: '2.7s', size: 'text-sm' },
      { text: '( )', top: '83%', left: '84%', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.5)', animClass: 'animate-float-2', delay: '1.7s', size: 'text-sm' },
      { text: 'lambda', top: '44%', left: '5%', color: '#d946ef', glow: 'rgba(217, 70, 239, 0.5)', animClass: 'animate-float-1', delay: '2.1s', size: 'text-xs' },
      { text: 'async', top: '61%', left: '92%', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', animClass: 'animate-float-2', delay: '3.5s', size: 'text-xs' },
      { text: 'await', top: '17%', left: '77%', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)', animClass: 'animate-float-1', delay: '0.7s', size: 'text-xs' },
      { text: 'Promise', top: '89%', left: '38%', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', animClass: 'animate-float-2', delay: '3.1s', size: 'text-xs' },
      { text: 'yield', top: '36%', left: '20%', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)', animClass: 'animate-float-1', delay: '0.5s', size: 'text-xs' },
      { text: 'pure', top: '67%', left: '71%', color: '#e879f9', glow: 'rgba(232, 121, 249, 0.45)', animClass: 'animate-float-2', delay: '2.4s', size: 'text-xs' },
      { text: '=>', top: '51%', left: '85%', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.55)', animClass: 'animate-float-1', delay: '1.5s', size: 'text-sm' },
      { text: 'return', top: '12%', left: '47%', color: '#f9a8d4', glow: 'rgba(249, 168, 212, 0.45)', animClass: 'animate-float-2', delay: '3.9s', size: 'text-xs' },
    ],
  },
  blood: {
    name: 'blood',
    label: 'Crimson Arena',
    accent: '#ef4444',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #2e0509 0%, #150204 50%, #080102 100%)',
    orb1: 'rgba(239, 68, 68, 0.38)',
    orb2: 'rgba(249, 115, 22, 0.32)',
    orb3: 'rgba(185, 28, 28, 0.28)',
    particleColor: 'rgba(252, 165, 165, ',
    lineColor: 'rgba(239, 68, 68, ',
    packetColor: '#fca5a5',
    meshFillColor: 'rgba(239, 68, 68, 0.05)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.25), transparent)',
    gridColor: 'rgba(239, 68, 68, 0.045)',
    tokens: [
      { text: '1v1', top: '14%', left: '7%', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-sm' },
      { text: 'DUEL', top: '24%', left: '88%', color: '#f97316', glow: 'rgba(249, 115, 22, 0.6)', animClass: 'animate-float-2', delay: '1.2s', size: 'text-sm' },
      { text: '⚔️', top: '75%', left: '11%', color: '#f87171', glow: 'rgba(248, 113, 113, 0.55)', animClass: 'animate-float-1', delay: '2.8s', size: 'text-base' },
      { text: 'WIN', top: '83%', left: '84%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)', animClass: 'animate-float-2', delay: '1.8s', size: 'text-sm' },
      { text: 'RUN', top: '42%', left: '5%', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)', animClass: 'animate-float-1', delay: '2.2s', size: 'text-xs' },
      { text: 'FAST', top: '62%', left: '92%', color: '#f97316', glow: 'rgba(249, 115, 22, 0.45)', animClass: 'animate-float-2', delay: '3.6s', size: 'text-xs' },
      { text: 'O(1)', top: '16%', left: '75%', color: '#f87171', glow: 'rgba(248, 113, 113, 0.5)', animClass: 'animate-float-1', delay: '0.8s', size: 'text-xs' },
      { text: 'O(log N)', top: '89%', left: '41%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', animClass: 'animate-float-2', delay: '3.2s', size: 'text-xs' },
      { text: 'AC', top: '35%', left: '18%', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', animClass: 'animate-float-1', delay: '0.4s', size: 'text-xs' },
      { text: 'ACCEPTED', top: '68%', left: '73%', color: '#f97316', glow: 'rgba(249, 115, 22, 0.45)', animClass: 'animate-float-2', delay: '2.5s', size: 'text-xs' },
      { text: '=>', top: '51%', left: '85%', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.55)', animClass: 'animate-float-1', delay: '1.6s', size: 'text-sm' },
      { text: 'return', top: '11%', left: '45%', color: '#fca5a5', glow: 'rgba(252, 165, 165, 0.45)', animClass: 'animate-float-2', delay: '4.0s', size: 'text-xs' },
    ],
  },
  solar: {
    name: 'solar',
    label: 'Solar Eclipse',
    accent: '#f59e0b',
    bgGradient: 'radial-gradient(ellipse at 50% -10%, #2e1605 0%, #170b02 50%, #090401 100%)',
    orb1: 'rgba(245, 158, 11, 0.38)',
    orb2: 'rgba(234, 179, 8, 0.34)',
    orb3: 'rgba(217, 119, 6, 0.28)',
    particleColor: 'rgba(253, 230, 138, ',
    lineColor: 'rgba(245, 158, 11, ',
    packetColor: '#fde047',
    meshFillColor: 'rgba(245, 158, 11, 0.05)',
    scanBeamColor: 'linear-gradient(180deg, transparent, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.26), transparent)',
    gridColor: 'rgba(245, 158, 11, 0.045)',
    tokens: [
      { text: '☀️', top: '14%', left: '8%', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', animClass: 'animate-float-1', delay: '0s', size: 'text-base' },
      { text: '{ }', top: '24%', left: '88%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)', animClass: 'animate-float-2', delay: '1.2s', size: 'text-base' },
      { text: '[ ]', top: '75%', left: '11%', color: '#fde047', glow: 'rgba(253, 224, 71, 0.55)', animClass: 'animate-float-1', delay: '2.8s', size: 'text-sm' },
      { text: '( )', top: '83%', left: '84%', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.55)', animClass: 'animate-float-2', delay: '1.8s', size: 'text-sm' },
      { text: 'corona', top: '42%', left: '5%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', animClass: 'animate-float-1', delay: '2.2s', size: 'text-xs' },
      { text: 'fusion', top: '62%', left: '92%', color: '#fde047', glow: 'rgba(253, 224, 71, 0.45)', animClass: 'animate-float-2', delay: '3.6s', size: 'text-xs' },
      { text: 'photon', top: '16%', left: '75%', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', animClass: 'animate-float-1', delay: '0.8s', size: 'text-xs' },
      { text: 'flare', top: '89%', left: '41%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', animClass: 'animate-float-2', delay: '3.2s', size: 'text-xs' },
      { text: '0xGOLD', top: '35%', left: '18%', color: '#fde047', glow: 'rgba(253, 224, 71, 0.5)', animClass: 'animate-float-1', delay: '0.4s', size: 'text-xs' },
      { text: 'ray', top: '68%', left: '73%', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)', animClass: 'animate-float-2', delay: '2.5s', size: 'text-xs' },
      { text: '=>', top: '51%', left: '85%', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)', animClass: 'animate-float-1', delay: '1.6s', size: 'text-sm' },
      { text: 'return', top: '11%', left: '45%', color: '#fde047', glow: 'rgba(253, 224, 71, 0.45)', animClass: 'animate-float-2', delay: '4.0s', size: 'text-xs' },
    ],
  },
};

interface Particle {
  x: number;
  y: number;
  baseVx: number;
  baseVy: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  type: 'star' | 'node' | 'hub';
}

interface DataPacket {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
  color: string;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>(getStoredTheme);
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: -1000, rawY: -1000 });

  const themeConfig = THEMES[currentTheme] || THEMES.obsidian;

  // Listen to external theme changes (e.g. from Navbar)
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
      }
    };
    window.addEventListener('codearena_theme_changed', handleThemeChange);
    return () => window.removeEventListener('codearena_theme_changed', handleThemeChange);
  }, []);

  const handleSelectTheme = (theme: BackgroundTheme) => {
    setCurrentTheme(theme);
    setStoredTheme(theme);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Multi-tier celestial particle mesh
    const particleCount = Math.min(85, Math.max(50, Math.floor(width / 22)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const typeRand = Math.random();
      const type: 'star' | 'node' | 'hub' =
        typeRand < 0.15 ? 'hub' : typeRand < 0.65 ? 'node' : 'star';

      const speedMult = type === 'star' ? 1.6 : type === 'hub' ? 0.7 : 1.25;
      const baseVx = (Math.random() - 0.5) * 1.5 * speedMult;
      const baseVy = (Math.random() - 0.5) * 1.5 * speedMult;

      const baseAlpha =
        type === 'hub'
          ? Math.random() * 0.3 + 0.6
          : type === 'star'
          ? Math.random() * 0.4 + 0.4
          : Math.random() * 0.3 + 0.3;

      const size =
        type === 'hub'
          ? Math.random() * 1.8 + 2.5
          : type === 'star'
          ? Math.random() * 1.2 + 0.8
          : Math.random() * 1.4 + 1.4;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseVx,
        baseVy,
        vx: baseVx,
        vy: baseVy,
        size,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        type,
      });
    }

    const packets: DataPacket[] = [];
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Grid with cursor parallax
      const gridSize = 56;
      ctx.strokeStyle = themeConfig.gridColor;
      ctx.lineWidth = 1;

      const offsetX = (mousePos.x * 0.04) % gridSize;
      const offsetY = (mousePos.y * 0.04) % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Deep space crosshairs
      for (let x = offsetX; x < width; x += gridSize * 2) {
        for (let y = offsetY; y < height; y += gridSize * 2) {
          const distToMouse = Math.hypot(x - mousePos.rawX, y - mousePos.rawY);
          if (distToMouse < 240) {
            ctx.fillStyle = themeConfig.gridColor.replace(/0\.045\)/, '0.25)');
            ctx.fillRect(x - 3, y - 0.5, 6, 1);
            ctx.fillRect(x - 0.5, y - 3, 1, 6);
          }
        }
      }

      // 2. Physics & particles
      const time = tick * 0.02;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += p.twinkleSpeed;
        const waveX = Math.sin(time + p.phase) * 0.45;
        const waveY = Math.cos(time * 0.8 + p.phase) * 0.45;

        p.vx = p.baseVx + waveX;
        p.vy = p.baseVy + waveY;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Interactive cursor repulsion
        const distMouse = Math.hypot(p.x - mousePos.rawX, p.y - mousePos.rawY);
        if (distMouse < 200) {
          const force = 1 - distMouse / 200;
          p.alpha = Math.min(1, p.baseAlpha + force * 0.6);
          const angle = Math.atan2(p.y - mousePos.rawY, p.x - mousePos.rawX);
          p.x += Math.cos(angle + 0.4) * force * 2.2;
          p.y += Math.sin(angle + 0.4) * force * 2.2;
        } else {
          p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.2;
        }

        ctx.fillStyle = `${themeConfig.particleColor}${Math.max(0.1, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.type === 'hub') {
          ctx.strokeStyle = `${themeConfig.particleColor}${p.alpha * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Multi-node constellation web
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const lineAlpha = (1 - dist / 135) * 0.28;
            ctx.strokeStyle = `${themeConfig.lineColor}${lineAlpha})`;
            ctx.lineWidth = p.type === 'hub' || p2.type === 'hub' ? 1.2 : 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            if (packets.length < 12 && Math.random() < 0.007) {
              packets.push({
                fromX: p.x,
                fromY: p.y,
                toX: p2.x,
                toY: p2.y,
                progress: 0,
                speed: 0.035 + Math.random() * 0.045,
                color: themeConfig.packetColor,
              });
            }

            // Polygon triad mesh fill
            for (let k = j + 1; k < Math.min(particles.length, j + 8); k++) {
              const p3 = particles[k];
              const d2 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
              const d3 = Math.hypot(p.x - p3.x, p.y - p3.y);

              if (d2 < 95 && d3 < 95) {
                ctx.fillStyle = themeConfig.meshFillColor;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.closePath();
                ctx.fill();
              }
            }
          }
        }
      }

      // 4. Data packets
      for (let k = packets.length - 1; k >= 0; k--) {
        const pkt = packets[k];
        pkt.progress += pkt.speed;

        if (pkt.progress >= 1) {
          packets.splice(k, 1);
          continue;
        }

        const curX = pkt.fromX + (pkt.toX - pkt.fromX) * pkt.progress;
        const curY = pkt.fromY + (pkt.toY - pkt.fromY) * pkt.progress;

        ctx.fillStyle = pkt.color;
        ctx.shadowColor = pkt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const prevProg = Math.max(0, pkt.progress - 0.08);
        const trailX = pkt.fromX + (pkt.toX - pkt.fromX) * prevProg;
        const trailY = pkt.fromY + (pkt.toY - pkt.fromY) * prevProg;
        ctx.fillStyle = `${pkt.color}88`;
        ctx.beginPath();
        ctx.arc(trailX, trailY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos, themeConfig]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 50,
      y: (e.clientY / window.innerHeight - 0.5) * 50,
      rawX: e.clientX,
      rawY: e.clientY,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-0 overflow-hidden select-none transition-colors duration-700"
      style={{
        background: themeConfig.bgGradient,
      }}
      aria-hidden="true"
    >
      {/* Morphing Orbs */}
      <div
        className="absolute top-[-15%] left-[12%] w-[720px] h-[720px] rounded-full blur-[140px] pointer-events-none animate-morph-1 transition-colors duration-1000"
        style={{
          background: themeConfig.orb1,
          transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px)`,
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[8%] w-[680px] h-[680px] rounded-full blur-[160px] pointer-events-none animate-morph-2 transition-colors duration-1000"
        style={{
          background: themeConfig.orb2,
          transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
        }}
      />
      <div
        className="absolute top-[35%] right-[30%] w-[480px] h-[480px] rounded-full blur-[140px] pointer-events-none animate-morph-1 transition-colors duration-1000 opacity-60"
        style={{
          background: themeConfig.orb3,
          transform: `translate(${mousePos.x * 0.35}px, ${mousePos.y * 0.35}px)`,
        }}
      />

      {/* Aurora Scanline */}
      <div
        className="absolute left-0 right-0 h-44 pointer-events-none animate-scan-beam"
        style={{
          background: themeConfig.scanBeamColor,
        }}
      />

      {/* Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />

      {/* Floating Syntax Code Tokens */}
      {themeConfig.tokens.map((token, index) => (
        <span
          key={index}
          className={`absolute font-mono font-bold pointer-events-none ${token.animClass} ${token.size} transition-all duration-700 ease-out`}
          style={{
            top: token.top,
            left: token.left,
            color: token.color,
            textShadow: `0 0 14px ${token.glow}`,
            animationDelay: token.delay,
            transform: `translate(${mousePos.x * (0.25 + (index % 4) * 0.14)}px, ${
              mousePos.y * (0.25 + (index % 4) * 0.14)
            }px)`,
          }}
        >
          {token.text}
        </span>
      ))}

      {/* Theme Switcher Widget (bottom right) */}
      <div className="fixed bottom-4 right-4 z-40 pointer-events-auto flex items-center gap-2">
        {showThemePicker && (
          <div className="flex flex-col gap-1.5 p-2 bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-xl rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 min-w-[220px]">
            <div className="flex items-center justify-between px-2 py-1 text-xs font-mono font-bold text-neutral-400 border-b border-neutral-800 pb-1.5">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Color Theme
              </span>
              <span className="text-[10px] text-neutral-500">{THEME_LIST.length} Palettes</span>
            </div>

            <div className="grid grid-cols-1 gap-1 max-h-[280px] overflow-y-auto">
              {THEME_LIST.map((thm) => {
                const isSelected = currentTheme === thm.id;
                return (
                  <button
                    key={thm.id}
                    onClick={() => {
                      handleSelectTheme(thm.id);
                      setShowThemePicker(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                      isSelected
                        ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/20'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full ring-2 ring-white/10 shadow-sm"
                        style={{ background: thm.previewGradient }}
                      />
                      <div>
                        <div className="text-[12px] font-semibold text-white leading-tight">
                          {thm.label}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {thm.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="px-3 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 hover:border-neutral-500 text-neutral-200 hover:text-white backdrop-blur-md shadow-2xl transition-all active:scale-95 group flex items-center gap-2"
          title="Change Color Theme"
          aria-label="Change Color Theme"
        >
          <Palette
            className="w-4 h-4 transition-transform group-hover:rotate-45"
            style={{ color: themeConfig.accent }}
          />
          <span className="text-xs font-mono font-medium text-neutral-200">
            Colors
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30"
            style={{ backgroundColor: themeConfig.accent }}
          />
        </button>
      </div>
    </div>
  );
};

export default AnimatedBackground;
