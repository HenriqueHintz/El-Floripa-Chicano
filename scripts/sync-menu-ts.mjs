import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/live-cardapioweb-menu.json', 'utf8'));

// Filter out categories with 0 items
const categories = rawData
  .filter(cat => cat.items && cat.items.length > 0)
  .map(cat => ({
    id: cat.id,
    name: cat.name.trim(),
    description: cat.description || null,
    position: cat.position,
    imageUrl: cat.image_url || null,
    items: cat.items.map(item => ({
      id: item.id,
      name: item.name.trim(),
      description: (item.description || '').trim(),
      price: item.price,
      promotionalPrice: item.price_before_discount || null,
      imageUrl: item.image_url || null,
      thumbnailUrl: item.thumbnail_url || item.image_url || null,
      status: item.status,
      categoryId: item.category_id || cat.id,
      categoryName: cat.name.trim(),
      addOns: (item.add_ons || []).map(addon => ({
        id: addon.id,
        name: addon.name,
        min: addon.minimum_quantity,
        max: addon.maximum_quantity,
        items: (addon.subitems || []).map(sub => ({
          id: sub.id,
          name: sub.name,
          price: sub.price
        }))
      }))
    }))
  }));

const fileContent = `import { MenuCategory, Product } from '../types';

export const FULL_MENU_CATEGORIES: MenuCategory[] = ${JSON.stringify(categories, null, 2)};

export const ALL_MENU_PRODUCTS: Product[] = FULL_MENU_CATEGORIES.flatMap(cat => 
  cat.items.map(item => ({
    ...item,
    category: cat.name
  }))
);
`;

fs.writeFileSync('src/data/menu.ts', fileContent, 'utf8');
console.log('Successfully updated src/data/menu.ts with live CardápioWeb data!');
console.log(`Categories: ${categories.length}, Total Products: ${categories.reduce((acc, c) => acc + c.items.length, 0)}`);
