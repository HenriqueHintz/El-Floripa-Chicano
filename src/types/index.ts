export interface Product {
  id: string | number;
  name: string;
  category?: string;
  categoryId?: number | string;
  categoryName?: string;
  description: string;
  price: string | number;
  promotionalPrice?: string | number | null;
  image?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  spiciness?: number;
  popular?: boolean;
  tags?: string[];
  status?: string;
  availableFor?: string[];
  addOns?: any[];
  [key: string]: any;
}

export interface MenuCategory {
  id: number | string;
  name: string;
  description: string | null;
  position?: number;
  imageUrl?: string | null;
  items: Product[];
  [key: string]: any;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  src: string;
  thumbnail?: string;
  caption: string;
  category: string;
  likes: number;
}

export interface UnitInfo {
  id: string;
  city: string;
  neighborhood: string;
  address: string;
  phone: string;
  hours: string;
  mapsUrl: string;
  whatsappUrl: string;
  instagramUrl?: string;
}
