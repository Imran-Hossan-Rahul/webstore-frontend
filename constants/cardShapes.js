export const CARD_SHAPES = [
  { 
    value: "square-small", 
    label: "Small Square", 
    colSpan: "col-span-1",
    imageRows: 3, 
    footerRows: 2,
    desc: "1x1 + Footer",
    previewClass: "w-16 h-16"
  },
  { 
    value: "square-medium", 
    label: "Medium Square", 
    colSpan: "col-span-2",
    imageRows: 6, 
    footerRows: 2,
    desc: "2x2 + Footer",
    previewClass: "w-24 h-24"
  },
  { 
    value: "rectangle-horizontal", 
    label: "Landscape", 
    colSpan: "col-span-2",
    imageRows: 3, 
    footerRows: 2,
    desc: "2x1 + Footer",
    previewClass: "w-24 h-12"
  },
  { 
    value: "rectangle-vertical", 
    label: "Portrait", 
    colSpan: "col-span-1",
    imageRows: 6, 
    footerRows: 2,
    desc: "1x2 + Footer",
    previewClass: "w-12 h-24"
  },
  { 
    value: "tower", 
    label: "Tower", 
    colSpan: "col-span-1",
    imageRows: 9, 
    footerRows: 2,
    desc: "1x3 + Footer",
    previewClass: "w-10 h-28"
  },
  { 
    value: "skyscraper", 
    label: "Skyscraper", 
    colSpan: "col-span-1",
    imageRows: 12, 
    footerRows: 2,
    desc: "1x4 + Footer",
    previewClass: "w-8 h-32"
  },
  { 
    value: "banner-wide", 
    label: "Banner Wide", 
    colSpan: "col-span-3",
    imageRows: 3, 
    footerRows: 2,
    desc: "3x1 + Footer",
    previewClass: "w-32 h-10"
  },
  { 
    value: "featured", 
    label: "Featured", 
    colSpan: "col-span-3",
    imageRows: 6, 
    footerRows: 2,
    desc: "3x2 + Footer",
    previewClass: "w-32 h-20"
  },
  { 
    value: "poster", 
    label: "Poster", 
    colSpan: "col-span-2",
    imageRows: 9, 
    footerRows: 2,
    desc: "2x3 + Footer",
    previewClass: "w-20 h-28"
  },
  { 
    value: "cinematic", 
    label: "Cinematic", 
    colSpan: "col-span-4",
    imageRows: 6, 
    footerRows: 2,
    desc: "4x2 + Footer",
    previewClass: "w-40 h-20"
  }
];

export const getShapeConfig = (shapeValue) => {
    return CARD_SHAPES.find(s => s.value === shapeValue) || CARD_SHAPES[0];
};

