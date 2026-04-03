import { FrameConfig } from '../../App';
import { calculateWorkbookPricing } from './workbook-pricing';

interface PricingDebugPanelProps {
  config: FrameConfig;
}

function formatMad(value: number) {
  return value.toFixed(2);
}

export function PricingDebugPanel({ config }: PricingDebugPanelProps) {
  if (!import.meta.env.DEV) {
    return null;
  }

  const pricing = calculateWorkbookPricing(config);
  const rows = [
    {
      id: 'NO_MAT',
      label: 'Sans PP',
      c: pricing.baguettePriceNoMatPerMl,
      d: pricing.workbookAreaChargeNoMat,
      control: pricing.roundedNoMatPrice,
      jb: pricing.customerNoMatPrice,
    },
    {
      id: 'WITH_MAT_SINGLE',
      label: 'PP Simple',
      c: pricing.workbookBaguettePriceSimple,
      d: pricing.workbookAreaChargeSimple,
      control: pricing.roundedWithMatSimple,
      jb: pricing.customerWithMatSimple,
    },
    {
      id: 'WITH_MAT_DOUBLE',
      label: 'PP Double',
      c: pricing.workbookBaguettePriceDouble,
      d: pricing.workbookAreaChargeDouble,
      control: pricing.roundedWithMatDouble,
      jb: pricing.customerWithMatDouble,
    },
    {
      id: 'WITH_MAT_TRIPLE',
      label: 'PP Triple',
      c: pricing.workbookBaguettePriceTriple,
      d: pricing.workbookAreaChargeTriple,
      control: pricing.roundedWithMatTriple,
      jb: pricing.customerWithMatTriple,
    },
    {
      id: 'WITH_MAT_V_GROOVE',
      label: 'PP V-Groove',
      c: pricing.workbookBaguettePriceVGroove,
      d: pricing.workbookAreaChargeVGroove,
      control: pricing.roundedWithMatVGroove,
      jb: pricing.customerWithMatVGroove,
    },
    {
      id: 'WITH_MAT_MULTIPLE',
      label: 'PP Multiple',
      c: pricing.workbookBaguettePriceMultiple,
      d: pricing.workbookAreaChargeMultiple,
      control: pricing.roundedWithMatMultiple,
      jb: pricing.customerWithMatMultiple,
    },
    {
      id: 'WITH_MAT_BOX',
      label: 'PP Boite',
      c: pricing.workbookBaguettePriceBoite,
      d: pricing.workbookAreaChargeBoite,
      control: pricing.roundedWithMatBoite,
      jb: pricing.customerWithMatBoite,
    },
  ];

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">Dev Pricing Debug</h4>
        <span className="rounded bg-slate-200 px-2 py-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-700">
          Hidden in production
        </span>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <div>Artwork size: {config.artworkWidthCm} x {config.artworkHeightCm} cm</div>
        <div>Pricing size: {pricing.pricedWidthCm} x {pricing.pricedHeightCm} cm</div>
        <div>D4 ml Baguette: {pricing.baguetteLengthM.toFixed(2)}</div>
        <div>E4 m2 PP: {pricing.areaM2.toFixed(4)}</div>
      </div>

      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-300 text-xs uppercase tracking-[0.12em] text-slate-500">
              <th className="px-2 py-2">Workbook Cell</th>
              <th className="px-2 py-2">Meaning</th>
              <th className="px-2 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200">
              <td className="px-2 py-2 font-mono">D4</td>
              <td className="px-2 py-2">ml Baguette</td>
              <td className="px-2 py-2">{pricing.baguetteLengthM.toFixed(2)}</td>
            </tr>
            <tr className="border-b border-slate-200">
              <td className="px-2 py-2 font-mono">E4</td>
              <td className="px-2 py-2">m2 PP</td>
              <td className="px-2 py-2">{pricing.areaM2.toFixed(4)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-300 text-xs uppercase tracking-[0.12em] text-slate-500">
              <th className="px-2 py-2">Choice</th>
              <th className="px-2 py-2">C</th>
              <th className="px-2 py-2">D</th>
              <th className="px-2 py-2">E Controle</th>
              <th className="px-2 py-2">F JB</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = pricing.selectedLabel === row.id;

              return (
                <tr
                  key={row.id}
                  className={isSelected ? 'bg-emerald-50 text-emerald-900' : 'border-b border-slate-200'}
                >
                  <td className="px-2 py-2 font-medium">{row.label}</td>
                  <td className="px-2 py-2">{formatMad(row.c)}</td>
                  <td className="px-2 py-2">{formatMad(row.d)}</td>
                  <td className="px-2 py-2">MAD {formatMad(row.control)}</td>
                  <td className="px-2 py-2">MAD {formatMad(row.jb)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
        Selected price path: <span className="font-semibold text-slate-900">{pricing.selectedLabel}</span>
        {' '}to MAD <span className="font-semibold text-slate-900">{formatMad(pricing.selectedTotal)}</span>
      </div>
    </div>
  );
}
