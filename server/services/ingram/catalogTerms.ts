export type CatalogTerms = {
  label: string
  value: string
  keywords: string[]
  requiredTerms: string[]
  blockedTerms: string[]
}

export const catalogTerms: CatalogTerms[] = [
  {
    label: 'Laptops',
    value: 'laptops',
    keywords: [
      'laptop',
    ],
    requiredTerms: [
      'laptop',
      'notebook',
      'thinkpad',
      'probook',
      'expertbook',
      'thinkbook',
      'elitebook'
    ],
    blockedTerms: [],
  },
  {
    label: 'Desktop PCs',
    value: 'desktops',
    keywords: [
      'desktop',
    ],
    requiredTerms: [
      'desktop',
      'desktop computer'
    ],
    blockedTerms: [],
  },
  {
    label: 'Printers',
    value: 'printers',
    keywords: [
      'printer',
    ],
    requiredTerms: [
      'printer',
    ],
    blockedTerms: [],
  },
  {
    label: 'Monitors',
    value: 'monitors',
    keywords: [
      'monitor',
    ],
    requiredTerms: [
      'monitor',
      'display'
    ],
    blockedTerms: [],
  },  
  {
    label: 'Business Workstations',
    value: 'workstations',
    keywords: [
      'workstation',
    ],
    requiredTerms: [
      'workstation',
    ],
    blockedTerms: [],
  },
  {
    label: 'All-in-One PCs',
    value: 'all-in-one',
    keywords: [
      'all in one',
    ],
    requiredTerms: [
      'all-in-one',
      'optiplex',
      'thinkcentre',
      'ideacentre'
    ],
    blockedTerms: [],
  },
]

// Compatibility export.
// This lets ingramCatalogCache.ts import either catalogTerms or catalogCategories.
export const catalogCategories = catalogTerms
export type CatalogCategory = CatalogTerms