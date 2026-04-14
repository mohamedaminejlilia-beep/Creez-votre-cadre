import { useEffect, useState } from 'react';
import { getConfiguratorAssetUrl } from './asset-paths';

export type FrameAssetName = 'front' | 'closeup' | 'profile' | 'diffuse';
export interface FrameSliceAssets {
  cornerTl: string;
  cornerTr: string;
  cornerBl: string;
  cornerBr: string;
  edgeTop: string;
  edgeBottom: string;
  edgeLeft: string;
  edgeRight: string;
}

export function getFrameAssetUrl(frameId: string, asset: FrameAssetName): string {
  const extension = asset === 'diffuse' ? 'jpg' : 'png';
  return getConfiguratorAssetUrl(`frames/${frameId}/${asset}.${extension}`);
}

export function useFrameAsset(frameId: string, asset: FrameAssetName) {
  const src = getFrameAssetUrl(frameId, asset);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const image = new Image();

    image.onload = () => {
      if (isMounted) {
        setIsAvailable(true);
      }
    };

    image.onerror = () => {
      if (isMounted) {
        setIsAvailable(false);
      }
    };

    image.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return { src, isAvailable };
}

export function getFrameSliceAssets(frameId: string): FrameSliceAssets {
  return {
    cornerTl: getConfiguratorAssetUrl(`frames/${frameId}/corner-tl.png`),
    cornerTr: getConfiguratorAssetUrl(`frames/${frameId}/corner-tr.png`),
    cornerBl: getConfiguratorAssetUrl(`frames/${frameId}/corner-bl.png`),
    cornerBr: getConfiguratorAssetUrl(`frames/${frameId}/corner-br.png`),
    edgeTop: getConfiguratorAssetUrl(`frames/${frameId}/edge-top.png`),
    edgeBottom: getConfiguratorAssetUrl(`frames/${frameId}/edge-bottom.png`),
    edgeLeft: getConfiguratorAssetUrl(`frames/${frameId}/edge-left.png`),
    edgeRight: getConfiguratorAssetUrl(`frames/${frameId}/edge-right.png`),
  };
}

export function useFrameSliceAssets(frameId: string) {
  const assets = getFrameSliceAssets(frameId);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;
    let failed = false;
    const sources = Object.values(assets);

    setIsAvailable(false);

    sources.forEach((src) => {
      const image = new Image();

      image.onload = () => {
        if (!isMounted || failed) {
          return;
        }

        loadedCount += 1;

        if (loadedCount === sources.length) {
          setIsAvailable(true);
        }
      };

      image.onerror = () => {
        if (!isMounted || failed) {
          return;
        }

        failed = true;
        setIsAvailable(false);
      };

      image.src = src;
    });

    return () => {
      isMounted = false;
    };
  }, [assets.cornerBl, assets.cornerBr, assets.cornerTl, assets.cornerTr, assets.edgeBottom, assets.edgeLeft, assets.edgeRight, assets.edgeTop]);

  return {
    assets,
    isAvailable,
  };
}
