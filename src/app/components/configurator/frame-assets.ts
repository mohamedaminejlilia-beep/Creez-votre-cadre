import { useEffect, useState } from 'react';

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
  return `/frames/${frameId}/${asset}.${extension}`;
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
    cornerTl: `/frames/${frameId}/corner-tl.png`,
    cornerTr: `/frames/${frameId}/corner-tr.png`,
    cornerBl: `/frames/${frameId}/corner-bl.png`,
    cornerBr: `/frames/${frameId}/corner-br.png`,
    edgeTop: `/frames/${frameId}/edge-top.png`,
    edgeBottom: `/frames/${frameId}/edge-bottom.png`,
    edgeLeft: `/frames/${frameId}/edge-left.png`,
    edgeRight: `/frames/${frameId}/edge-right.png`,
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
