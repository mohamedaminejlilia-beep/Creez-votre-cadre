declare global {
  interface Window {
    FRAME_CONFIGURATOR_CONFIG?: {
      assetBaseUrl?: string;
    };
  }
}

function normalizeBaseUrl(rawBaseUrl?: string): string {
  if (!rawBaseUrl || rawBaseUrl === '/') {
    return '';
  }

  return rawBaseUrl.replace(/\/+$/, '');
}

export function getConfiguratorAssetBaseUrl(): string {
  if (typeof window !== 'undefined' && window.FRAME_CONFIGURATOR_CONFIG?.assetBaseUrl) {
    return normalizeBaseUrl(window.FRAME_CONFIGURATOR_CONFIG.assetBaseUrl);
  }

  return normalizeBaseUrl(import.meta.env.BASE_URL);
}

export function getConfiguratorAssetUrl(relativePath: string): string {
  const normalizedPath = relativePath.replace(/^\/+/, '');
  const baseUrl = getConfiguratorAssetBaseUrl();

  if (!baseUrl) {
    return `/${normalizedPath}`;
  }

  return `${baseUrl}/${normalizedPath}`;
}
