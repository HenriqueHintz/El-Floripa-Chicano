export interface AddOnOption {
  id: number | string;
  name: string;
  price?: number;
  [key: string]: unknown;
}

export interface ProductAddOn {
  id: number | string;
  name: string;
  min?: number;
  max?: number;
  items?: AddOnOption[];
  [key: string]: unknown;
}

export interface D1ProductPayloadItem {
  id: number | string;
  name: string;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  category?: string;
  tag?: string;
  is_featured?: boolean | number;
  is_active?: boolean | number;
}

export interface CardapioWebItem {
  id: number | string;
  name: string;
  status: string;
  description?: string | null;
  price: number | string;
  promotional_price?: number | string | null;
  image_url?: string | null;
  add_ons?: ProductAddOn[];
}

export interface CardapioWebCategory {
  id: number | string;
  name: string;
  status: string;
  description?: string | null;
  position?: number | null;
  image_url?: string | null;
  items?: CardapioWebItem[];
}

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
  addOns?: ProductAddOn[];
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
