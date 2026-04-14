import type { FrameConfig } from '../../App';
import type { Glazing } from './configurator-data';
import { getEffectiveGlazing, getEffectiveMatEnabled, getEffectiveMatThicknesses, getFrameById } from './configurator-utils';

export interface WorkbookPricingResult {
  selectedTotal: number;
  baseSelectedTotal: number;
  selectedLabel: string;
  selectedRounded: boolean;
  pricedWidthCm: number;
  pricedHeightCm: number;
  baguettePriceNoMatPerMl: number;
  workbookAreaChargeNoMat: number;
  workbookBaguettePriceSimple: number;
  workbookAreaChargeSimple: number;
  workbookBaguettePriceDouble: number;
  workbookAreaChargeDouble: number;
  workbookBaguettePriceTriple: number;
  workbookAreaChargeTriple: number;
  workbookBaguettePriceVGroove: number;
  workbookAreaChargeVGroove: number;
  workbookBaguettePriceBoite: number;
  workbookAreaChargeBoite: number;
  customerNoMatPrice: number;
  customerWithMatSimple: number;
  customerWithMatDouble: number;
  customerWithMatTriple: number;
  customerWithMatVGroove: number;
  customerWithMatBoite: number;
  framePricePerMl: number;
  cmAdd: number;
  baguetteLengthM: number;
  areaM2: number;
  frameBaseRaw: number;
  isorellePrice: number;
  glassPrice: number;
  noMatPrice: number;
  roundedNoMatPrice: number;
  matSimplePrice: number;
  withMatSimple: number;
  roundedWithMatSimple: number;
  withMatDouble: number;
  roundedWithMatDouble: number;
  withMatTriple: number;
  roundedWithMatTriple: number;
  withMatVGroove: number;
  roundedWithMatVGroove: number;
  withMatBoite: number;
  roundedWithMatBoite: number;
  glazingUsed: Glazing;
  missingSource: null | 'Liste Baguette' | 'CM';
}

function getMatPricingProfile(config: FrameConfig) {
  if (!config.matEnabled) {
    return { label: 'NO_MAT', baseType: 'none' as const };
  }

  switch (config.matType) {
    case 'double':
      return { label: 'WITH_MAT_DOUBLE', baseType: 'double' as const };
    case 'triple':
      return { label: 'WITH_MAT_TRIPLE', baseType: 'triple' as const };
    case 'multiple':
      return { label: 'WITH_MAT_MULTIPLE', baseType: 'multiple' as const };
    case 'v_groove':
      return { label: 'WITH_MAT_V_GROOVE', baseType: 'v_groove' as const };
    case 'box':
      return { label: 'WITH_MAT_BOX', baseType: 'box' as const };
    case 'single':
    default:
      return { label: 'WITH_MAT_SINGLE', baseType: 'single' as const };
  }
}

function mround10(value: number): number {
  return Math.round(value / 10) * 10;
}

function consultationBaguettePrice(controlTotal: number, baguetteLengthM: number, deduction: number) {
  return (controlTotal / baguetteLengthM) - deduction;
}

export function calculateWorkbookPricing(config: FrameConfig): WorkbookPricingResult {
  const frame = getFrameById(config.frameStyle);
  const glazing = getEffectiveGlazing(config);
  const matEnabled = getEffectiveMatEnabled(config);
  const workbookIncludesGlass = frame.supportsGlass;
  const framePricePerMl = frame.workbookPricePerMl;
  const cmAdd = frame.cmAdd;

  if (!Number.isFinite(framePricePerMl)) {
    return emptyPricing('Liste Baguette');
  }

  if (!Number.isFinite(cmAdd)) {
    return emptyPricing('CM');
  }

  const totalMatThicknessCm = matEnabled ? getEffectiveMatThicknesses(config).total : 0;
  const widthCm = matEnabled
    ? config.artworkWidthCm + (totalMatThicknessCm * 2)
    : config.artworkWidthCm;
  const heightCm = matEnabled
    ? config.artworkHeightCm + (totalMatThicknessCm * 2)
    : config.artworkHeightCm;
  const baguetteLengthM = (((widthCm / 100) + (heightCm / 100) + ((cmAdd * 2) / 100)) * 2);
  const areaM2 = (widthCm / 100) * (heightCm / 100);
  const frameBaseRaw = ((((widthCm / 100) * 2) + ((heightCm / 100) * 2)) * framePricePerMl + 4) * 12;
  const isorellePrice = (areaM2 * 40) * 12;
  const workbookGlassPrice = (areaM2 * 90) * 12;
  const glassPrice = workbookIncludesGlass ? workbookGlassPrice : 0;
  const noMatPrice = frameBaseRaw + isorellePrice + glassPrice;
  const roundedNoMatPrice = mround10(noMatPrice);
  const matSimplePrice = (areaM2 * 40) * 12;
  const withMatSimple = noMatPrice + matSimplePrice;
  const roundedWithMatSimple = mround10(withMatSimple);
  const withMatDouble = noMatPrice + (matSimplePrice * 2);
  const roundedWithMatDouble = mround10(withMatDouble);
  const withMatTriple = noMatPrice + (matSimplePrice * 3);
  const roundedWithMatTriple = mround10(withMatTriple);
  const withMatVGroove = noMatPrice + matSimplePrice + 50;
  const roundedWithMatVGroove = mround10(withMatVGroove);
  const withMatBoite = noMatPrice + (matSimplePrice * 3);
  const roundedWithMatBoite = mround10(withMatBoite);
  const workbookAreaChargeNoMat = 200;
  const baguettePriceNoMatPerMl = roundedNoMatPrice / baguetteLengthM;
  const customerNoMatPrice = baguetteLengthM * baguettePriceNoMatPerMl;

  const workbookAreaChargeSimple = workbookAreaChargeNoMat + matSimplePrice;
  const workbookBaguettePriceSimple = consultationBaguettePrice(roundedWithMatSimple, baguetteLengthM, 25.92);
  const customerWithMatSimple = (baguetteLengthM * workbookBaguettePriceSimple) + (areaM2 * workbookAreaChargeSimple);

  const workbookAreaChargeDouble = workbookAreaChargeSimple * 2;
  const workbookBaguettePriceDouble = consultationBaguettePrice(roundedWithMatDouble, baguetteLengthM, 51.84);
  const customerWithMatDouble = (baguetteLengthM * workbookBaguettePriceDouble) + (areaM2 * workbookAreaChargeDouble);

  const workbookAreaChargeTriple = workbookAreaChargeSimple * 3;
  const workbookBaguettePriceTriple = consultationBaguettePrice(roundedWithMatTriple, baguetteLengthM, 77.76);
  const customerWithMatTriple = (baguetteLengthM * workbookBaguettePriceTriple) + (areaM2 * workbookAreaChargeTriple);

  const workbookAreaChargeVGroove = workbookAreaChargeNoMat + withMatVGroove - noMatPrice;
  const workbookBaguettePriceVGroove = consultationBaguettePrice(roundedWithMatVGroove, baguetteLengthM, 75.92);
  const customerWithMatVGroove = (baguetteLengthM * workbookBaguettePriceVGroove) + (areaM2 * workbookAreaChargeVGroove);

  const workbookAreaChargeBoite = workbookAreaChargeSimple * 3;
  const workbookBaguettePriceBoite = consultationBaguettePrice(roundedWithMatBoite, baguetteLengthM, 77.76);
  const customerWithMatBoite = (baguetteLengthM * workbookBaguettePriceBoite) + (areaM2 * workbookAreaChargeBoite);

  let baseSelectedTotal = customerNoMatPrice;
  let selectedLabel = 'NO_MAT';
  const selectedRounded = true;

  const pricingProfile = getMatPricingProfile(config);

  switch (pricingProfile.baseType) {
    case 'single':
      baseSelectedTotal = customerWithMatSimple;
      selectedLabel = pricingProfile.label;
      break;
    case 'double':
      baseSelectedTotal = customerWithMatDouble;
      selectedLabel = pricingProfile.label;
      break;
    case 'triple':
      baseSelectedTotal = customerWithMatTriple;
      selectedLabel = pricingProfile.label;
      break;
    case 'multiple':
      baseSelectedTotal = customerWithMatSimple;
      selectedLabel = pricingProfile.label;
      break;
    case 'v_groove':
      baseSelectedTotal = customerWithMatVGroove;
      selectedLabel = pricingProfile.label;
      break;
    case 'box':
      baseSelectedTotal = customerWithMatBoite;
      selectedLabel = pricingProfile.label;
      break;
    default:
      baseSelectedTotal = customerNoMatPrice;
      selectedLabel = 'NO_MAT';
      break;
  }

  const selectedTotal = baseSelectedTotal;

  return {
    selectedTotal,
    baseSelectedTotal,
    selectedLabel,
    selectedRounded,
    pricedWidthCm: widthCm,
    pricedHeightCm: heightCm,
    baguettePriceNoMatPerMl,
    workbookAreaChargeNoMat,
    workbookBaguettePriceSimple,
    workbookAreaChargeSimple,
    workbookBaguettePriceDouble,
    workbookAreaChargeDouble,
    workbookBaguettePriceTriple,
    workbookAreaChargeTriple,
    workbookBaguettePriceVGroove,
    workbookAreaChargeVGroove,
    workbookBaguettePriceBoite,
    workbookAreaChargeBoite,
    customerNoMatPrice,
    customerWithMatSimple,
    customerWithMatDouble,
    customerWithMatTriple,
    customerWithMatVGroove,
    customerWithMatBoite,
    framePricePerMl,
    cmAdd,
    baguetteLengthM,
    areaM2,
    frameBaseRaw,
    isorellePrice,
    glassPrice,
    noMatPrice,
    roundedNoMatPrice,
    matSimplePrice,
    withMatSimple,
    roundedWithMatSimple,
    withMatDouble,
    roundedWithMatDouble,
    withMatTriple,
    roundedWithMatTriple,
    withMatVGroove,
    roundedWithMatVGroove,
    withMatBoite,
    roundedWithMatBoite,
    glazingUsed: glazing,
    missingSource: null,
  };
}

function emptyPricing(source: 'Liste Baguette' | 'CM'): WorkbookPricingResult {
  return {
    selectedTotal: 0,
    baseSelectedTotal: 0,
    selectedLabel: 'MISSING',
    selectedRounded: true,
    pricedWidthCm: 0,
    pricedHeightCm: 0,
    baguettePriceNoMatPerMl: 0,
    workbookAreaChargeNoMat: 0,
    workbookBaguettePriceSimple: 0,
    workbookAreaChargeSimple: 0,
    workbookBaguettePriceDouble: 0,
    workbookAreaChargeDouble: 0,
    workbookBaguettePriceTriple: 0,
    workbookAreaChargeTriple: 0,
    workbookBaguettePriceVGroove: 0,
    workbookAreaChargeVGroove: 0,
    workbookBaguettePriceBoite: 0,
    workbookAreaChargeBoite: 0,
    customerNoMatPrice: 0,
    customerWithMatSimple: 0,
    customerWithMatDouble: 0,
    customerWithMatTriple: 0,
    customerWithMatVGroove: 0,
    customerWithMatBoite: 0,
    framePricePerMl: 0,
    cmAdd: 0,
    baguetteLengthM: 0,
    areaM2: 0,
    frameBaseRaw: 0,
    isorellePrice: 0,
    glassPrice: 0,
    noMatPrice: 0,
    roundedNoMatPrice: 0,
    matSimplePrice: 0,
    withMatSimple: 0,
    roundedWithMatSimple: 0,
    withMatDouble: 0,
    roundedWithMatDouble: 0,
    withMatTriple: 0,
    roundedWithMatTriple: 0,
    withMatVGroove: 0,
    roundedWithMatVGroove: 0,
    withMatBoite: 0,
    roundedWithMatBoite: 0,
    glazingUsed: 'none',
    missingSource: source,
  };
}
