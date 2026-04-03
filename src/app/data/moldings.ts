export type MoldingReferenceSource = 'LionPic' | 'User-confirmed' | 'Unconfirmed';

export type PreviewStyleKey =
  | 'smooth-black-trafila'
  | 'smooth-white-trafila'
  | 'open-grain-black'
  | 'open-grain-grey'
  | 'distressed-gold'
  | 'antique-gold-leaf'
  | 'antique-silver-leaf'
  | 'oak-veneer'
  | 'walnut'
  | 'walnut-gold-sight-edge'
  | 'raw-wood'
  | 'textured-black'
  | 'deep-l-style-black'
  | 'deep-l-style-white'
  | 'modern-white'
  | 'bright-color-blue'
  | 'bright-color-yellow'
  | 'black-gold-sight-edge';

export interface Molding {
  id: string;
  name: string;
  range?: string;
  finish: string;
  referenceSource: MoldingReferenceSource;
  needsReview: boolean;
  previewStyleKey: PreviewStyleKey;
}

export const MOLDINGS: Molding[] = [
  {
    id: 'L087',
    name: 'Mono Matt Black',
    finish: 'Matt Black',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2225',
    name: 'Domino Black Open Grain',
    finish: 'Black Open Grain',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'open-grain-black',
  },
  {
    id: 'L2497',
    name: 'Domino Grey Open Grain',
    finish: 'Grey Open Grain',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'open-grain-grey',
  },
  {
    id: 'L1744',
    name: 'Leonardo Craqueleur Gold',
    finish: 'Craqueleur Gold',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'distressed-gold',
  },
  {
    id: 'L1798',
    name: 'Simple Black',
    finish: 'Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L284',
    name: 'Auric Antique Gold Leaf',
    finish: 'Antique Gold Leaf',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'antique-gold-leaf',
  },
  {
    id: 'L1926',
    name: 'Arken White',
    finish: 'White',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'modern-white',
  },
  {
    id: 'L2533',
    name: 'Marbre',
    finish: 'Marbled',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'oak-veneer',
  },
  {
    id: 'L2531',
    name: 'Unconfirmed',
    finish: 'Unconfirmed',
    referenceSource: 'Unconfirmed',
    needsReview: true,
    previewStyleKey: 'walnut',
  },
  {
    id: 'L1545',
    name: 'Vermont Oak Veneer',
    finish: 'Oak Veneer',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'oak-veneer',
  },
  {
    id: 'L1701',
    name: 'Skane Beech',
    finish: 'Beech',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'oak-veneer',
  },
  {
    id: 'L1849',
    name: 'Bare Wood Ayous',
    finish: 'Bare Wood',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'raw-wood',
  },
  {
    id: 'L1840',
    name: 'Garrison Antique Silver Leaf',
    finish: 'Antique Silver Leaf',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'antique-silver-leaf',
  },
  {
    id: 'L1841',
    name: 'Classic Gold',
    finish: 'Gold',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'antique-gold-leaf',
  },
  {
    id: 'L2479',
    name: 'Regency Gold Leaf',
    finish: 'Gold Leaf',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'antique-gold-leaf',
  },
  {
    id: 'L1743',
    name: 'Coniston Walnut Gold Sight Edge',
    finish: 'Walnut Gold Sight Edge',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'walnut-gold-sight-edge',
  },
  {
    id: 'L1709',
    name: 'Ystad Walnut',
    finish: 'Walnut',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'walnut',
  },
  {
    id: 'L1978',
    name: 'Sundae Royal Blue',
    finish: 'Royal Blue',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'bright-color-blue',
  },
  {
    id: 'L1971',
    name: 'Sundae Yellow',
    finish: 'Yellow',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'bright-color-yellow',
  },
  {
    id: 'L1923',
    name: 'Mono Matt White',
    finish: 'Matt White',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'smooth-white-trafila',
  },
  {
    id: '617301',
    name: 'Unconfirmed',
    finish: 'Unconfirmed',
    referenceSource: 'Unconfirmed',
    needsReview: true,
    previewStyleKey: 'modern-white',
  },
  {
    id: 'L1716',
    name: 'Mono Matt White',
    finish: 'Matt White',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'smooth-white-trafila',
  },
  {
    id: 'L2367',
    name: 'Unconfirmed',
    finish: 'Unconfirmed',
    referenceSource: 'Unconfirmed',
    needsReview: true,
    previewStyleKey: 'oak-veneer',
  },
  {
    id: 'L2000',
    name: 'Revival L Style White',
    finish: 'L Style White',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'deep-l-style-white',
  },
  {
    id: 'L2590',
    name: 'Derby Walnut Gold Sight Edge',
    finish: 'Walnut Gold Sight Edge',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'walnut-gold-sight-edge',
  },
  {
    id: 'L1408',
    name: 'Exhibit Matt Black',
    finish: 'Matt Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2948',
    name: 'Vermeer Matt Black Gold Sight Edge',
    finish: 'Matt Black Gold Sight Edge',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'black-gold-sight-edge',
  },
  {
    id: 'L2470',
    name: 'Black Brushed',
    finish: 'Brushed Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2472',
    name: 'Pewter Silver',
    finish: 'Antique Pewter',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'antique-silver-leaf',
  },
  {
    id: 'L2555',
    name: 'Arden Black Gold',
    finish: 'Black Gold',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'distressed-gold',
  },
  {
    id: 'L2737',
    name: 'Black Sorrento',
    finish: 'Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2044',
    name: 'Mono Matt Black',
    finish: 'Matt Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L1318',
    name: 'Mono Matt Black',
    finish: 'Matt Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L1532',
    name: 'Mono Matt Black',
    finish: 'Matt Black',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L1922',
    name: 'Mono Matt Black',
    finish: 'Matt Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L1952',
    name: 'Mono Matt Black Slim',
    finish: 'Matt Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L1951',
    name: 'Black Palladian',
    finish: 'Black',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2356',
    name: 'Kyoto Charcoal',
    finish: 'Charcoal',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'deep-l-style-black',
  },
  {
    id: 'L963',
    name: 'Mono Matt Black',
    finish: 'Matt Black',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2383',
    name: 'Graffiti Black',
    finish: 'Textured Black',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'textured-black',
  },
  {
    id: 'L1968',
    name: 'Sundae Black',
    finish: 'Black',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'smooth-black-trafila',
  },
  {
    id: 'L2993',
    name: 'Noir Dore',
    finish: 'Black Gold',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'deep-l-style-black',
  },
  {
    id: 'L998',
    name: 'Noir Dore Large',
    finish: 'Black Gold',
    referenceSource: 'User-confirmed',
    needsReview: false,
    previewStyleKey: 'antique-gold-leaf',
  },
  {
    id: 'L1991',
    name: 'Revival L Style Black',
    finish: 'L Style Black',
    referenceSource: 'LionPic',
    needsReview: false,
    previewStyleKey: 'deep-l-style-black',
  },
];

export const MOLDINGS_BY_ID = Object.fromEntries(
  MOLDINGS.map((molding) => [molding.id, molding]),
) as Record<string, Molding>;
