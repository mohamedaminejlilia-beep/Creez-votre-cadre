export const PHOTO_MULTIPLIERS = [1, 1.1, 1.2, 1.3, 1.4, 1.5] as const;

export type PhotoMultiplier = (typeof PHOTO_MULTIPLIERS)[number];

export interface InternalPricingOptions {
  papierPlumeEnabled?: boolean;
  photoMultiplier?: PhotoMultiplier;
}

export interface InternalPricingAdjustmentResult {
  finalPrice: number;
  papierPlumeEnabled: boolean;
  photoMultiplier: PhotoMultiplier;
  adjusted: boolean;
  rounded: boolean;
}

export function applyInternalPricingAdjustments(
  basePrice: number,
  internalOptions: InternalPricingOptions = {},
): InternalPricingAdjustmentResult {
  let finalPrice = basePrice;

  const {
    papierPlumeEnabled = false,
    photoMultiplier = 1,
  } = internalOptions;

  if (papierPlumeEnabled) {
    finalPrice *= 1.2;
  }

  finalPrice *= photoMultiplier;

  return {
    finalPrice,
    papierPlumeEnabled,
    photoMultiplier,
    adjusted: papierPlumeEnabled || photoMultiplier !== 1,
    rounded: photoMultiplier === 1,
  };
}
