import type { PreviewStyleKey } from '../../data/moldings';

export interface PreviewStyleDefinition {
  borderColors: [string, string, string, string];
  shellBackground: string;
  highlightOverlay: string;
  innerShadow: string;
}

export const PREVIEW_STYLES: Record<PreviewStyleKey, PreviewStyleDefinition> = {
  'smooth-black-trafila': {
    borderColors: ['#4b5363', '#1d2330', '#0f141d', '#313846'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 18%, rgba(0,0,0,0.16) 58%, rgba(255,255,255,0.04) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%,rgba(0,0,0,0.15)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 10px 18px rgba(255,255,255,0.04), inset 0 -16px 18px rgba(0,0,0,0.12)',
  },
  'smooth-white-trafila': {
    borderColors: ['#f8f5ef', '#ddd5ca', '#beb3a4', '#ede7dc'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 18%, rgba(0,0,0,0.08) 58%, rgba(255,255,255,0.18) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0)_42%,rgba(0,0,0,0.10)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.24), inset 0 10px 18px rgba(255,255,255,0.12), inset 0 -16px 18px rgba(0,0,0,0.08)',
  },
  'open-grain-black': {
    borderColors: ['#525a66', '#222834', '#10161e', '#383f4b'],
    shellBackground:
      'repeating-linear-gradient(102deg, rgba(255,255,255,0.07) 0 7px, rgba(255,255,255,0.02) 7px 14px, rgba(0,0,0,0.07) 14px 21px)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0)_42%,rgba(0,0,0,0.18)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 12px 18px rgba(255,255,255,0.03), inset 0 -14px 18px rgba(0,0,0,0.14)',
  },
  'open-grain-grey': {
    borderColors: ['#b5b9bf', '#7c838e', '#5a616c', '#a1a7b2'],
    shellBackground:
      'repeating-linear-gradient(102deg, rgba(255,255,255,0.10) 0 7px, rgba(255,255,255,0.03) 7px 14px, rgba(0,0,0,0.06) 14px 21px)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%,rgba(0,0,0,0.12)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 12px 18px rgba(255,255,255,0.05), inset 0 -14px 18px rgba(0,0,0,0.12)',
  },
  'distressed-gold': {
    borderColors: ['#d6be7e', '#9e7c35', '#70551d', '#c49d4a'],
    shellBackground:
      'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.16), transparent 24%), linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.10) 68%, rgba(255,255,255,0.05) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%,rgba(99,68,12,0.16)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 10px 18px rgba(255,255,255,0.06), inset 0 -16px 18px rgba(91,64,19,0.16)',
  },
  'antique-gold-leaf': {
    borderColors: ['#dbc57f', '#a5812d', '#77591c', '#c9a24b'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 20%, rgba(0,0,0,0.12) 60%, rgba(255,255,255,0.06) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0)_42%,rgba(86,62,12,0.16)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 10px 18px rgba(255,255,255,0.07), inset 0 -16px 18px rgba(82,58,14,0.14)',
  },
  'antique-silver-leaf': {
    borderColors: ['#d9dee4', '#aeb6c1', '#7d8793', '#c9d1da'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 20%, rgba(0,0,0,0.10) 60%, rgba(255,255,255,0.08) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_42%,rgba(69,79,91,0.14)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 10px 18px rgba(255,255,255,0.08), inset 0 -16px 18px rgba(73,82,94,0.12)',
  },
  'oak-veneer': {
    borderColors: ['#d3ad7a', '#a9804e', '#7b5b38', '#c09361'],
    shellBackground:
      'repeating-linear-gradient(100deg, rgba(255,255,255,0.10) 0 9px, rgba(255,255,255,0.03) 9px 18px, rgba(77,46,17,0.08) 18px 27px)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%,rgba(94,59,24,0.14)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 10px 18px rgba(255,255,255,0.05), inset 0 -16px 18px rgba(88,59,30,0.12)',
  },
  walnut: {
    borderColors: ['#8a6a4f', '#563f31', '#34241c', '#705643'],
    shellBackground:
      'repeating-linear-gradient(102deg, rgba(255,255,255,0.08) 0 9px, rgba(255,255,255,0.02) 9px 18px, rgba(41,23,14,0.08) 18px 27px)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%,rgba(69,44,29,0.16)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 10px 18px rgba(255,255,255,0.04), inset 0 -16px 18px rgba(40,26,19,0.14)',
  },
  'walnut-gold-sight-edge': {
    borderColors: ['#8a6a4f', '#563f31', '#34241c', '#705643'],
    shellBackground:
      'repeating-linear-gradient(102deg, rgba(255,255,255,0.08) 0 9px, rgba(255,255,255,0.02) 9px 18px, rgba(41,23,14,0.08) 18px 27px)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%,rgba(69,44,29,0.16)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 10px 18px rgba(255,255,255,0.04), inset 0 -16px 18px rgba(40,26,19,0.14)',
  },
  'raw-wood': {
    borderColors: ['#d8c5a4', '#b89c71', '#8e734e', '#c9b28a'],
    shellBackground:
      'repeating-linear-gradient(100deg, rgba(255,255,255,0.08) 0 10px, rgba(255,255,255,0.03) 10px 20px, rgba(92,66,38,0.05) 20px 30px)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%,rgba(102,74,44,0.10)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 10px 18px rgba(255,255,255,0.05), inset 0 -16px 18px rgba(101,77,49,0.10)',
  },
  'textured-black': {
    borderColors: ['#4b525d', '#1a212d', '#0d1219', '#323945'],
    shellBackground:
      'radial-gradient(circle at 18% 20%, rgba(255,255,255,0.07), transparent 24%), radial-gradient(circle at 80% 78%, rgba(255,255,255,0.03), transparent 20%), linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 18%, rgba(0,0,0,0.16) 58%, rgba(255,255,255,0.04) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0)_42%,rgba(0,0,0,0.18)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 10px 18px rgba(255,255,255,0.03), inset 0 -16px 18px rgba(0,0,0,0.14)',
  },
  'deep-l-style-black': {
    borderColors: ['#515964', '#1e2531', '#0e131b', '#373e4a'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 18%, rgba(0,0,0,0.18) 60%, rgba(255,255,255,0.03) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%,rgba(0,0,0,0.20)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 12px 18px rgba(255,255,255,0.03), inset 0 -18px 20px rgba(0,0,0,0.16)',
  },
  'deep-l-style-white': {
    borderColors: ['#f8f5ef', '#ddd6cb', '#bbb1a3', '#ece6dc'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 18%, rgba(0,0,0,0.10) 60%, rgba(255,255,255,0.12) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_42%,rgba(0,0,0,0.10)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 12px 18px rgba(255,255,255,0.08), inset 0 -18px 20px rgba(0,0,0,0.10)',
  },
  'modern-white': {
    borderColors: ['#faf8f3', '#e3ddd3', '#c6bcae', '#eee9e0'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.18) 18%, rgba(0,0,0,0.08) 58%, rgba(255,255,255,0.16) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0)_42%,rgba(0,0,0,0.08)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 10px 18px rgba(255,255,255,0.10), inset 0 -16px 18px rgba(0,0,0,0.08)',
  },
  'bright-color-blue': {
    borderColors: ['#6b87c7', '#3154a7', '#20377a', '#5872b5'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 18%, rgba(0,0,0,0.10) 58%, rgba(255,255,255,0.05) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_42%,rgba(25,49,118,0.14)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 10px 18px rgba(255,255,255,0.05), inset 0 -16px 18px rgba(18,40,96,0.14)',
  },
  'bright-color-yellow': {
    borderColors: ['#efd26b', '#d1a52f', '#a57d17', '#e2bc4b'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 18%, rgba(0,0,0,0.10) 58%, rgba(255,255,255,0.06) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0)_42%,rgba(132,95,9,0.12)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 10px 18px rgba(255,255,255,0.06), inset 0 -16px 18px rgba(132,95,9,0.12)',
  },
  'black-gold-sight-edge': {
    borderColors: ['#4b5363', '#1d2330', '#0f141d', '#313846'],
    shellBackground:
      'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 18%, rgba(0,0,0,0.16) 58%, rgba(255,255,255,0.04) 100%)',
    highlightOverlay:
      'linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_42%,rgba(0,0,0,0.15)_100%)',
    innerShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 10px 18px rgba(255,255,255,0.04), inset 0 -16px 18px rgba(0,0,0,0.12)',
  },
};

export function getPreviewStyle(styleKey: PreviewStyleKey): PreviewStyleDefinition {
  return PREVIEW_STYLES[styleKey];
}
