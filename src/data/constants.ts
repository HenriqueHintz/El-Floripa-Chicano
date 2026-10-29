import { UnitInfo } from '../types';

export const SITE_INFO = {
  name: 'El Chicano',
  tagline: 'El Chicano | Mexican Food with Soul',
  manifesto: 'Feito com fé, fogo e coração.',
  subtitle: 'Comida mexicana com alma brasileira.',
  quote: 'Para nós, cozinhar é um ato sagrado de afeto.',
  hashtag: '#rangodeverdade',
  origin: 'Origem litorânea, alma mexicana.',
  faith: 'Good food, good faith',
  stampText: '• ORIGEM LITORÂNEA • ALMA MEXICANA • RANGO DE VERDADE',
  cardapioWebUrl: 'https://app.cardapioweb.com/elchicano_pocketfloripa',
  whatsappFloripaUrl: 'https://api.whatsapp.com/send/?phone=5548996520836&text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20no%20El%20Chicano%20Floripa',
  whatsappLagunaUrl: 'https://api.whatsapp.com/send/?phone=5548996640777&text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20El%20Chicano%20Laguna',
  instagramUrl: 'https://www.instagram.com/elchicanofloripa',
  instagramPostUrl: 'https://www.instagram.com/p/DXFmGSDljmv/?img_index=1'
};

export const UNITS: UnitInfo[] = [
  {
    id: 'unit-floripa-centro',
    city: 'Florianópolis',
    neighborhood: 'Centro',
    address: 'Rua Vítor Konder, 390 - Centro, Florianópolis - SC',
    phone: '(48) 99652-0836',
    hours: 'Segunda a Sexta: 11h30 às 23h30 | Sábado: 17h00 às 23h30 | Domingo: Fechado',
    mapsUrl: 'https://maps.google.com/?q=El+Chicano+Florianopolis+Rua+Vitor+Konder+390',
    whatsappUrl: 'https://api.whatsapp.com/send/?phone=5548996520836',
    instagramUrl: 'https://www.instagram.com/elchicanofloripa'
  },
  {
    id: 'unit-laguna',
    city: 'Laguna',
    neighborhood: 'Praia do Mar Grosso',
    address: 'Rua Giocondo Tasso, 2245 - Laguna - SC',
    phone: '(48) 99664-0777',
    hours: 'Pausado Temporariamente',
    mapsUrl: 'https://maps.google.com/?q=El+Chicano+Laguna+Rua+Giocondo+Tasso+2245',
    whatsappUrl: 'https://api.whatsapp.com/send/?phone=5548996640777'
  }
];

export const NAV_LINKS = [
  { label: 'Início', href: '#hero-section' },
  { label: 'História', href: '#about-section' },
  { label: 'Cardápio', href: '#products-section' },
  { label: 'Galeria', href: '#gallery-section' },
  { label: 'Casas', href: '#units-section' },
  { label: 'Franquia', href: '#franchise-section' }
];

export const HIGHLIGHT_PRODUCTS = [
  {
    id: 'prod-burrito-gringo',
    name: 'Burrito El Gringo',
    category: 'Burritos',
    description: 'Tortilha de trigo gigante recheada com suculenta carne grelhada na brasa, feijão preto temperado, arroz mexicano, blend de queijos derretidos, pico de gallo fresco e o autêntico guacamole chicano.',
    price: 'R$ 38,90',
    image: '/images/products/el-chicano-246.webp',
    spiciness: 1,
    popular: true,
    tags: ['Clássico Gringo', 'Carro-Chefe', 'Recheio Generoso']
  },
  {
    id: 'prod-fish-burrito',
    name: 'FISH BURRITO',
    category: 'Burritos do Mar',
    description: 'Tortilha de trigo recheada com filé de peixe fresco empanado bem crocante, repolho roxo temperado com limão, pico de gallo fresco e nosso creme leve de coentro litorâneo.',
    price: 'R$ 42,90',
    image: '/images/products/el-chicano-21.webp',
    spiciness: 1,
    popular: true,
    tags: ['Especialidade do Mar', 'Leve & Fresco', 'Crocância Perfeita']
  },
  {
    id: 'prod-combo-familia',
    name: 'COMBO FAMÍLIA',
    category: 'Combos',
    description: 'O banquete completo para dividir. Combo especial com burritos, tacos artesanais, quesadillas recheadas, acompanhado de uma porção gigante de nachos crocantes e nossos molhos artesanais.',
    price: 'R$ 119,90',
    image: '/images/products/el-chicano-45.webp',
    spiciness: 1,
    popular: false,
    tags: ['Para Compartilhar', 'Festa Mexicana', 'Custo-Benefício']
  }
];

export const CATEGORY_COLORS: Record<string, string> = {
  burrito: '#CA6702',
  combo: '#BB3E03',
  quesadilla: '#005F73',
  taco: '#0A9396',
  bebida: '#001219',
  suco: '#005F73',
  sobremesa: '#9B2226',
  veggie: '#2A9D8F',
  antojitos: '#E76F51',
  default: '#001219'
};

export function getCategoryColor(catName: string): string {
  const lower = catName.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return CATEGORY_COLORS.default;
}
