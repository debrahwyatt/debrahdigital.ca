export type CatalogCategory = {
  label: string
  value: string
}

export const catalogCategories: CatalogCategory[] = [
  {
    label: 'All Categories',
    value: 'all',
  },

  // Customer-friendly computer categories created during catalog build.
  {
    label: 'Laptops',
    value: 'laptops',
  },
  {
    label: 'Tablets',
    value: 'tablets',
  },
  {
    label: 'Computers',
    value: 'computers',
  },

  // Main Ingram-backed categories.
  {
    label: 'Monitors & Displays',
    value: 'displays',
  },
  {
    label: 'Printers',
    value: 'printers-and-office-equipment',
  },
  {
    label: 'Projectors',
    value: 'presentation-devices',
  },
  {
    label: 'Scanners & Imaging',
    value: 'imaging-devices',
  },
  {
    label: 'Networking',
    value: 'network-devices',
  },
  {
    label: 'Power Protection / UPS',
    value: 'power-protection-ups',
  },
  {
    label: 'Keyboards, Mice & Input Devices',
    value: 'input-output-devices',
  },
  {
    label: 'Computer Components',
    value: 'system-components',
  },
  {
    label: 'Data Capture / POS',
    value: 'data-capture-pos',
  },
  {
    label: 'Phones & Communications',
    value: 'communications',
  },
  {
    label: 'Accessories',
    value: 'accessories',
  },
]