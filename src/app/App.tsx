import { useEffect, useState } from 'react';
import { ConfigurationPanel } from './components/configurator/ConfigurationPanel';
import { PriceBar } from './components/configurator/PriceBar';
import { PreviewPanel } from './components/configurator/PreviewPanel';
import type { Glazing, Unit } from './components/configurator/configurator-data';
import {
  configuratorTranslations,
  type ConfiguratorLanguage,
} from './components/configurator/configurator-translations';
import type { InternalPricingOptions } from './components/configurator/internal-pricing';
import { normalizeFrameConfig } from './components/configurator/configurator-utils';

export interface FrameConfig {
  artworkWidthCm: number;
  artworkHeightCm: number;
  unit: Unit;
  frameStyle: string;
  matEnabled: boolean;
  matType: 'single' | 'double' | 'triple' | 'v_groove' | 'multiple' | 'box';
  matColor: string;
  matBottomColor: string;
  matMiddleColor: string;
  matThicknessCm: number;
  matRevealCm: number;
  matRevealSecondCm: number;
  grooveEnabled: boolean;
  grooveOffsetCm: number;
  boxDepthCm: number;
  glazing: Glazing;
  internalPricing: InternalPricingOptions;
  accessories: string[];
  uploadedArtworkUrl: string | null;
  uploadedArtworkName: string | null;
}

export default function App() {
  const [language, setLanguage] = useState<ConfiguratorLanguage>('fr');
  const [config, setConfig] = useState<FrameConfig>({
    artworkWidthCm: 40,
    artworkHeightCm: 50,
    unit: 'cm',
    frameStyle: 'L1532',
    matEnabled: true,
    matType: 'single',
    matColor: 'white',
    matBottomColor: 'black',
    matMiddleColor: 'gray',
    matThicknessCm: 6,
    matRevealCm: 0.4,
    matRevealSecondCm: 0.3,
    grooveEnabled: true,
    grooveOffsetCm: 0.6,
    boxDepthCm: 1.2,
    glazing: 'glass',
    internalPricing: {
      papierPlumeEnabled: false,
      photoMultiplier: 1,
    },
    accessories: [],
    uploadedArtworkUrl: null,
    uploadedArtworkName: null,
  });

  useEffect(() => {
    return () => {
      if (config.uploadedArtworkUrl) {
        URL.revokeObjectURL(config.uploadedArtworkUrl);
      }
    };
  }, [config.uploadedArtworkUrl]);

  const updateConfig = (updates: Partial<FrameConfig>) => {
    setConfig((prev) => normalizeFrameConfig({ ...prev, ...updates }));
  };
  const t = configuratorTranslations[language];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">{t.app.title}</h1>
              <p className="mt-2 text-muted-foreground">
                {t.app.subtitle}
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-border bg-muted p-1">
              {(['fr', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    language === lang
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.language[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(420px,1.15fr)_minmax(340px,0.85fr)]">
          <PreviewPanel config={config} t={t} />
          <ConfigurationPanel config={config} updateConfig={updateConfig} t={t} />
        </div>
      </main>

      <PriceBar config={config} t={t} />
    </div>
  );
}
