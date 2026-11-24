import { PRODUCTS, type Product } from './data';

const stock = new Map<number, number>(PRODUCTS.map((p) => [p.id, p.stock]));

const withStock = (product: Product): Product => ({ ...product, stock: stock.get(product.id) ?? 0 });

export const listProducts = (): Product[] => PRODUCTS.map(withStock);

export function findProduct(id: number): Product | undefined {
  const product = PRODUCTS.find((p) => p.id === id);
  return product ? withStock(product) : undefined;
}

export function reserve(items: Array<{ productId: number; quantity: number }>) {
  for (const item of items) {
    stock.set(item.productId, (stock.get(item.productId) ?? 0) - item.quantity);
  }
}

export function resetInventory() {
  for (const product of PRODUCTS) stock.set(product.id, product.stock);
}
