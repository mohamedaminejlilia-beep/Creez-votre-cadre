import { MOLDINGS_BY_ID, type Molding } from '../../data/moldings';

export type Unit = 'mm' | 'cm' | 'inch';

export type Glazing = 'none' | 'glass';

export interface FrameDefinition extends Molding {
  profileWidthMm: number;
  profileWidthCm: number;
  lookupLabel: string;
  cmLookupLabel: string;
  jbCode: string;
  workbookPricePerMl: number;
  cmAdd: number;
  minWidthCm: number;
  minHeightCm: number;
  maxWidthCm: number;
  maxHeightCm: number;
  priceMultiplier: number;
  previewDepth: number;
  supportsMat: boolean;
  supportsGlass: boolean;
  previewFrameOverlaySrc: string | null;
  previewSliceAssets: {
    cornerTl: string;
    cornerTr: string;
    cornerBl: string;
    cornerBr: string;
    edgeTop: string;
    edgeBottom: string;
    edgeLeft: string;
    edgeRight: string;
  } | null;
}

export interface MatColorOption {
  id: string;
  name: string;
  hex: string;
}

const FRAME_SOURCE = [
  { id: 'ENC31', lookupLabel: 'ENC31 Baguette Simple Blanche', cmLookupLabel: 'Enc31 Baguette Simple Blanche 600601', jbCode: 'ENC31', workbookPricePerMl: 9.54, cmAdd: 5, profileWidthMm: 14, minWidthCm: 15, minHeightCm: 15, maxWidthCm: 70, maxHeightCm: 100, priceMultiplier: 1.01, previewDepth: 0.68 },
  { id: 'L087', lookupLabel: 'L087 14mm Mat Noir', cmLookupLabel: 'L087 14mm Mat Noir', jbCode: 'ENC06', workbookPricePerMl: 5.9, cmAdd: 3, profileWidthMm: 12, minWidthCm: 12, minHeightCm: 12, maxWidthCm: 60, maxHeightCm: 80, priceMultiplier: 1, previewDepth: 0.65 },
  { id: 'L1318', lookupLabel: 'L1318', cmLookupLabel: 'L1318', jbCode: 'ENC85', workbookPricePerMl: 15.8, cmAdd: 5.2, profileWidthMm: 14, minWidthCm: 12, minHeightCm: 18, maxWidthCm: 70, maxHeightCm: 95, priceMultiplier: 1.01, previewDepth: 0.67 },
  { id: 'L1408', lookupLabel: 'L1408 Matt Black Médaille (Inclus px Chassis L1401)', cmLookupLabel: 'L1408 Matt Black Médaille', jbCode: 'ENC51', workbookPricePerMl: 36.81, cmAdd: 6.6, profileWidthMm: 13, minWidthCm: 12, minHeightCm: 18, maxWidthCm: 65, maxHeightCm: 90, priceMultiplier: 1, previewDepth: 0.64 },
  { id: 'L1532', lookupLabel: 'L1532', cmLookupLabel: 'L1532', jbCode: 'ENC78', workbookPricePerMl: 12.87, cmAdd: 6, profileWidthMm: 38, minWidthCm: 20, minHeightCm: 30, maxWidthCm: 100, maxHeightCm: 120, priceMultiplier: 1.02, previewDepth: 0.7 },
  { id: 'L1545', lookupLabel: 'L1545 Chêne', cmLookupLabel: 'L1545 Chêne', jbCode: 'ENC68', workbookPricePerMl: 13.19, cmAdd: 4, profileWidthMm: 18, minWidthCm: 15, minHeightCm: 20, maxWidthCm: 80, maxHeightCm: 110, priceMultiplier: 1.02, previewDepth: 0.74 },
  { id: 'L1701', lookupLabel: 'L1701 21mm Skane Beech', cmLookupLabel: 'L1701 21mm Skane Beech', jbCode: 'ENC14', workbookPricePerMl: 10.13, cmAdd: 4, profileWidthMm: 21, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.03, previewDepth: 0.78 },
  { id: 'L1709', lookupLabel: 'L1709 Noir Cajou	', cmLookupLabel: 'L1709 Noir Cajou	', jbCode: 'ENC75', workbookPricePerMl: 7.02, cmAdd: 3.5, profileWidthMm: 27, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.04, previewDepth: 0.86 },
  { id: 'L1716', lookupLabel: 'L1716 14mm Mat Blanc', cmLookupLabel: 'L1716 14mm Mat Blanc', jbCode: 'ENC18', workbookPricePerMl: 5.27, cmAdd: 3, profileWidthMm: 28, minWidthCm: 20, minHeightCm: 20, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.04, previewDepth: 0.84 },
  { id: 'L1743', lookupLabel: 'L1743 Cajou', cmLookupLabel: 'L1743 Cajou', jbCode: 'ENC71', workbookPricePerMl: 9.45, cmAdd: 3.5, profileWidthMm: 26, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 90, maxHeightCm: 120, priceMultiplier: 1.03, previewDepth: 0.82 },
  { id: 'L1744', lookupLabel: 'L1744 Gold Leonardo', cmLookupLabel: 'L1744 Gold Leonardo', jbCode: 'ENC52', workbookPricePerMl: 25.79, cmAdd: 11.4, profileWidthMm: 26, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 90, maxHeightCm: 120, priceMultiplier: 1.03, previewDepth: 0.8 },
  { id: 'L1798', lookupLabel: 'L1798 Baguette Simple Noire', cmLookupLabel: 'L1798 Baguette Simple Noire', jbCode: 'ENC01', workbookPricePerMl: 9.54, cmAdd: 5, profileWidthMm: 14, minWidthCm: 15, minHeightCm: 15, maxWidthCm: 70, maxHeightCm: 100, priceMultiplier: 1.01, previewDepth: 0.68 },
  { id: 'L1840', lookupLabel: 'L1840 Baguette Argent', cmLookupLabel: 'L1840 Baguette Argent', jbCode: 'ENC08', workbookPricePerMl: 30.74, cmAdd: 4, profileWidthMm: 22, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.03, previewDepth: 0.78 },
  { id: 'L1841', lookupLabel: 'L1841 Baguette Dorée', cmLookupLabel: 'L1841 Baguette Dorée', jbCode: 'ENC08', workbookPricePerMl: 20.7, cmAdd: 4, profileWidthMm: 22, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.03, previewDepth: 0.78 },
  { id: 'L1849', lookupLabel: 'L1849', cmLookupLabel: 'L1849', jbCode: 'ENC79', workbookPricePerMl: 6.17, cmAdd: 3, profileWidthMm: 36, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 110, maxHeightCm: 140, priceMultiplier: 1.08, previewDepth: 0.95 },
  { id: 'L1922', lookupLabel: 'L1922 25mm Mat Noir', cmLookupLabel: 'L1922 25mm Mat Noir', jbCode: 'ENC04', workbookPricePerMl: 10.26, cmAdd: 5, profileWidthMm: 32, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.06, previewDepth: 0.9 },
  { id: 'L1923', lookupLabel: 'L1923', cmLookupLabel: 'L1923', jbCode: 'ENC77', workbookPricePerMl: 9.95, cmAdd: 4, profileWidthMm: 34, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.07, previewDepth: 0.92 },
  { id: 'L1926', lookupLabel: 'L1926 30mm Arken Caisse Am Blanche (Inclus px Chassis L1929)', cmLookupLabel: 'L1926 30mm Arken Caisse Am Blanche', jbCode: 'ENC11', workbookPricePerMl: 23.99, cmAdd: 6, profileWidthMm: 30, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.05, previewDepth: 0.88 },
  { id: 'L1951', lookupLabel: 'L1951 Black Palladian', cmLookupLabel: 'L1951 Black Palladian', jbCode: 'ENC53', workbookPricePerMl: 18.68, cmAdd: 10.4, profileWidthMm: 21, minWidthCm: 18, minHeightCm: 20, maxWidthCm: 90, maxHeightCm: 120, priceMultiplier: 1.02, previewDepth: 0.77 },
  { id: 'L1952', lookupLabel: 'L1952', cmLookupLabel: 'L1952', jbCode: 'ENC82', workbookPricePerMl: 17.55, cmAdd: 5.2, profileWidthMm: 21, minWidthCm: 18, minHeightCm: 20, maxWidthCm: 90, maxHeightCm: 120, priceMultiplier: 1.02, previewDepth: 0.77 },
  { id: 'L1968', lookupLabel: 'L1968', cmLookupLabel: 'L1968', jbCode: 'ENC81', workbookPricePerMl: 10.4, cmAdd: 2, profileWidthMm: 24, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.04, previewDepth: 0.82 },
  { id: 'L1971', lookupLabel: 'L1971 Yellow Sundae', cmLookupLabel: 'L1971 Yellow Sundae', jbCode: 'ENC54', workbookPricePerMl: 11.61, cmAdd: 3.4, profileWidthMm: 20, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.02, previewDepth: 0.76 },
  { id: 'L1978', lookupLabel: 'L1978 Bleu Royal', cmLookupLabel: 'L1978 Bleu Royal', jbCode: 'ENC72', workbookPricePerMl: 10.58, cmAdd: 2.5, profileWidthMm: 22, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.03, previewDepth: 0.8 },
  { id: 'L1991', lookupLabel: 'L1991 Caisse Américaine', cmLookupLabel: 'L1991 Caisse Américaine', jbCode: 'ENC15', workbookPricePerMl: 22.23, cmAdd: 6, profileWidthMm: 30, minWidthCm: 20, minHeightCm: 24, maxWidthCm: 105, maxHeightCm: 135, priceMultiplier: 1.05, previewDepth: 0.85 },
  { id: 'L2000', lookupLabel: 'L2000 Caisse Américaine Blanche', cmLookupLabel: 'L2000 Caisse Américaine Blanche', jbCode: 'ENC69', workbookPricePerMl: 24.12, cmAdd: 6.5, profileWidthMm: 20, minWidthCm: 18, minHeightCm: 18, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.02, previewDepth: 0.78 },
  { id: 'L2044X', lookupLabel: 'L2044X', cmLookupLabel: 'L2044X', jbCode: 'ENC80', workbookPricePerMl: 11.16, cmAdd: 5, profileWidthMm: 29, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.05, previewDepth: 0.87 },
  { id: 'L2225', lookupLabel: 'L2225 21mm Domino Noir', cmLookupLabel: 'L2225 21mm Domino Noir', jbCode: 'ENC21', workbookPricePerMl: 9.18, cmAdd: 4, profileWidthMm: 20, minWidthCm: 18, minHeightCm: 18, maxWidthCm: 90, maxHeightCm: 120, priceMultiplier: 1.02, previewDepth: 0.75 },
  { id: 'L2356', lookupLabel: 'L2356 39mm Kyoto Charcoal', cmLookupLabel: 'L2356 39mm Kyoto Charcoal', jbCode: 'ENC12', workbookPricePerMl: 15.66, cmAdd: 7.6, profileWidthMm: 40, minWidthCm: 25, minHeightCm: 30, maxWidthCm: 120, maxHeightCm: 160, priceMultiplier: 1.1, previewDepth: 1 },
  { id: 'L2357', lookupLabel: 'L2357 39mm Kyoto Blanc', cmLookupLabel: 'L2357 39mm Kyoto Blanc', jbCode: 'ENC13', workbookPricePerMl: 15.66, cmAdd: 7.6, profileWidthMm: 42, minWidthCm: 25, minHeightCm: 30, maxWidthCm: 120, maxHeightCm: 160, priceMultiplier: 1.1, previewDepth: 1 },
  { id: 'L2383', lookupLabel: 'L2383', cmLookupLabel: 'L2383', jbCode: 'ENC83', workbookPricePerMl: 6.44, cmAdd: 2.5, profileWidthMm: 37, minWidthCm: 24, minHeightCm: 30, maxWidthCm: 115, maxHeightCm: 150, priceMultiplier: 1.09, previewDepth: 0.97 },
  { id: 'L2470', lookupLabel: 'L2470 Black Brushed', cmLookupLabel: 'L2470 Black Brushed', jbCode: 'ENC55', workbookPricePerMl: 23.54, cmAdd: 11.6, profileWidthMm: 25, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.03, previewDepth: 0.82 },
  { id: 'L2472', lookupLabel: 'L2472 Gris Argenté Pewter', cmLookupLabel: 'L2472 Gris Argenté Pewter', jbCode: 'ENC56', workbookPricePerMl: 31.05, cmAdd: 11.6, profileWidthMm: 25, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 95, maxHeightCm: 125, priceMultiplier: 1.03, previewDepth: 0.82 },
  { id: 'L2479', lookupLabel: 'L2479 15mm Regency Or', cmLookupLabel: 'L2479 15mm Regency Or', jbCode: 'ENC19', workbookPricePerMl: 31.32, cmAdd: 3, profileWidthMm: 24, minWidthCm: 18, minHeightCm: 24, maxWidthCm: 90, maxHeightCm: 120, priceMultiplier: 1.04, previewDepth: 0.82 },
  { id: 'L2497', lookupLabel: 'L2497 21mm Domino Gris', cmLookupLabel: 'L2497 21mm Domino Gris', jbCode: 'ENC20', workbookPricePerMl: 9.18, cmAdd: 4, profileWidthMm: 28, minWidthCm: 20, minHeightCm: 20, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.04, previewDepth: 0.85 },
  { id: 'L2531', lookupLabel: 'L2531 Gris Carrara', cmLookupLabel: 'L2531 Gris Carrara', jbCode: 'ENC57', workbookPricePerMl: 49.5, cmAdd: 14.8, profileWidthMm: 30, minWidthCm: 20, minHeightCm: 20, maxWidthCm: 100, maxHeightCm: 130, priceMultiplier: 1.05, previewDepth: 0.9 },
  { id: 'L2533', lookupLabel: 'L2533 Marbré', cmLookupLabel: 'L2533 Marbré', jbCode: 'ENC58', workbookPricePerMl: 38.61, cmAdd: 14.8, profileWidthMm: 32, minWidthCm: 20, minHeightCm: 20, maxWidthCm: 110, maxHeightCm: 140, priceMultiplier: 1.06, previewDepth: 0.92 },
  { id: 'L2555', lookupLabel: 'L2555 Noir Doré Arden', cmLookupLabel: 'L2555 Noir Doré Arden', jbCode: 'ENC59', workbookPricePerMl: 37.71, cmAdd: 9.2, profileWidthMm: 38, minWidthCm: 24, minHeightCm: 30, maxWidthCm: 115, maxHeightCm: 150, priceMultiplier: 1.09, previewDepth: 0.98 },
  { id: 'L2596', lookupLabel: 'L2596', cmLookupLabel: 'L2596', jbCode: 'ENC84', workbookPricePerMl: 10.98, cmAdd: 4, profileWidthMm: 35, minWidthCm: 20, minHeightCm: 25, maxWidthCm: 110, maxHeightCm: 140, priceMultiplier: 1.08, previewDepth: 0.94 },
  { id: 'L2737', lookupLabel: 'L2737 Black Sorrento', cmLookupLabel: 'L2737 Black Sorrento', jbCode: 'ENC60', workbookPricePerMl: 25.65, cmAdd: 4, profileWidthMm: 38, minWidthCm: 24, minHeightCm: 30, maxWidthCm: 115, maxHeightCm: 150, priceMultiplier: 1.09, previewDepth: 0.98 },
  { id: 'L284', lookupLabel: 'L284 Doré Antique', cmLookupLabel: 'L284 Doré Antique', jbCode: 'ENC70', workbookPricePerMl: 16.11, cmAdd: 3, profileWidthMm: 15, minWidthCm: 15, minHeightCm: 20, maxWidthCm: 70, maxHeightCm: 100, priceMultiplier: 1.01, previewDepth: 0.72 },
  { id: 'L2948', lookupLabel: 'L2948 Noir Doré Large', cmLookupLabel: 'L2948 Noir Doré Large', jbCode: 'ENC65', workbookPricePerMl: 28.08, cmAdd: 12.6, profileWidthMm: 46, minWidthCm: 30, minHeightCm: 40, maxWidthCm: 120, maxHeightCm: 160, priceMultiplier: 1.12, previewDepth: 1.05 },
  { id: 'L2993', lookupLabel: 'L2993 Noir Doré', cmLookupLabel: 'L2993 Noir Doré', jbCode: 'ENC73', workbookPricePerMl: 19.35, cmAdd: 6, profileWidthMm: 50, minWidthCm: 30, minHeightCm: 40, maxWidthCm: 130, maxHeightCm: 170, priceMultiplier: 1.14, previewDepth: 1.08 },
  { id: 'L963', lookupLabel: 'L963', cmLookupLabel: 'L963', jbCode: 'ENC76', workbookPricePerMl: 6.17, cmAdd: 2.5, profileWidthMm: 16, minWidthCm: 12, minHeightCm: 18, maxWidthCm: 75, maxHeightCm: 100, priceMultiplier: 1.01, previewDepth: 0.71 },
  { id: 'L998', lookupLabel: 'L998 Noir Doré Large', cmLookupLabel: 'L998 Noir Doré Large', jbCode: 'ENC74', workbookPricePerMl: 6.35, cmAdd: 4.5, profileWidthMm: 17, minWidthCm: 12, minHeightCm: 18, maxWidthCm: 75, maxHeightCm: 100, priceMultiplier: 1.02, previewDepth: 0.72 },
] as const;

export const FRAME_STYLES: FrameDefinition[] = FRAME_SOURCE.map(
  ({ id, profileWidthMm, lookupLabel, cmLookupLabel, jbCode, workbookPricePerMl, cmAdd, minWidthCm, minHeightCm, maxWidthCm, maxHeightCm, priceMultiplier, previewDepth }) => {
    const molding = MOLDINGS_BY_ID[id] ?? MOLDINGS_BY_ID[id.replace('X', '')] ?? {
      id,
      name: lookupLabel,
      finish: 'Workbook',
      referenceSource: 'User-confirmed' as const,
      needsReview: true,
      previewStyleKey: 'smooth-black-trafila' as const,
    };

    return {
      ...molding,
      id,
      profileWidthMm,
      profileWidthCm: profileWidthMm / 10,
      lookupLabel,
      cmLookupLabel,
      jbCode,
      workbookPricePerMl,
      cmAdd,
      minWidthCm,
      minHeightCm,
      maxWidthCm,
      maxHeightCm,
      priceMultiplier,
      previewDepth,
      supportsMat: id !== 'L1991',
      supportsGlass: true,
      previewFrameOverlaySrc: id === 'L1991' ? '/frames/L1991/preview-frame.png' : null,
      previewSliceAssets: id === 'L1991'
        ? {
            cornerTl: '/frames/L1991/corner-tl.png',
            cornerTr: '/frames/L1991/corner-tr.png',
            cornerBl: '/frames/L1991/corner-bl.png',
            cornerBr: '/frames/L1991/corner-br.png',
            edgeTop: '/frames/L1991/edge-top.png',
            edgeBottom: '/frames/L1991/edge-bottom.png',
            edgeLeft: '/frames/L1991/edge-left.png',
            edgeRight: '/frames/L1991/edge-right.png',
          }
        : null,
    };
  },
);

export const MAT_COLORS: MatColorOption[] = [
  { id: 'black', name: 'Black', hex: '#111111' },
  { id: 'gray', name: 'Gray', hex: '#9ca3af' },
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'red', name: 'Red', hex: '#c64545' },
  { id: 'blue', name: 'Blue', hex: '#315b96' },
  { id: 'yellow', name: 'Yellow', hex: '#e8cc57' },
];
