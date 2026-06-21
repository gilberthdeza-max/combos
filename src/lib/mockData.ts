export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  quantity?: number; // Optional quantity when product is inside a combo
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  products?: Product[];
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Aceite de Girasol 1L',
    description: 'Aceite refinado de girasol, ideal para cocinar.',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'p2',
    name: 'Arroz Extra 1kg',
    description: 'Arroz grano largo de alta calidad.',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'p3',
    name: 'Café Molido 250g',
    description: 'Café tueste oscuro con aroma intenso.',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'p4',
    name: 'Pasta Espagueti 500g',
    description: 'Pasta de sémola de trigo duro.',
    image_url: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'p5',
    name: 'Jabón de Tocador',
    description: 'Jabón con extracto de aloe vera para suavidad de la piel.',
    image_url: 'https://images.unsplash.com/photo-1607006342411-92fc2a41b7fc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'p6',
    name: 'Detergente Multiusos 1kg',
    description: 'Detergente en polvo para ropa y superficies.',
    image_url: 'https://images.unsplash.com/photo-1610557892470-76d74ae62217?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'p7',
    name: 'Crema Dental 100ml',
    description: 'Protección anticaries y frescura duradera.',
    image_url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

export const MOCK_COMBOS: Combo[] = [
  {
    id: 'c1',
    name: 'Combo Familiar Alimentación',
    description: 'El combo perfecto para abastecer tu cocina con los alimentos esenciales de la semana.',
    price: 25.00,
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    products: [
      { ...MOCK_PRODUCTS[0], quantity: 1 }, // Aceite x1
      { ...MOCK_PRODUCTS[1], quantity: 3 }, // Arroz x3
      { ...MOCK_PRODUCTS[2], quantity: 1 }, // Café x1
      { ...MOCK_PRODUCTS[3], quantity: 2 }  // Pasta x2
    ]
  },
  {
    id: 'c2',
    name: 'Combo Higiene Total',
    description: 'Mantén tu hogar y cuerpo limpios con este set de aseo personal y limpieza del hogar.',
    price: 15.50,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    products: [
      { ...MOCK_PRODUCTS[4], quantity: 4 }, // Jabón x4
      { ...MOCK_PRODUCTS[5], quantity: 1 }, // Detergente x1
      { ...MOCK_PRODUCTS[6], quantity: 2 }  // Crema dental x2
    ]
  },
  {
    id: 'c3',
    name: 'Combo Premium Mixto',
    description: 'Una selección premium que combina los mejores artículos de alimentación y aseo personal.',
    price: 38.00,
    image_url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    products: [
      { ...MOCK_PRODUCTS[0], quantity: 2 }, // Aceite x2
      { ...MOCK_PRODUCTS[1], quantity: 4 }, // Arroz x4
      { ...MOCK_PRODUCTS[2], quantity: 2 }, // Café x2
      { ...MOCK_PRODUCTS[3], quantity: 3 }, // Pasta x3
      { ...MOCK_PRODUCTS[4], quantity: 3 }, // Jabón x3
      { ...MOCK_PRODUCTS[6], quantity: 2 }  // Crema dental x2
    ]
  }
];
