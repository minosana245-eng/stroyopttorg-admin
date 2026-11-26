import { Brand, CategoryNode, Order, OrderStatus, Product, ProductBadge } from '../types/admin';
import { ApiBrand, ApiCategory, ApiNews, ApiOrder, ApiProduct } from './endpoints';

export function mapCategoriesFromApi(
  apiCategories: ApiCategory[],
  products: ApiProduct[],
  prevCategories: CategoryNode[] = []
): CategoryNode[] {
  const byId = new Map(apiCategories.map((c) => [c.id, c]));
  const prevMap = new Map(prevCategories.map((c) => [c.id, c]));

  const resolveLevel = (cat: ApiCategory, visited = new Set<number>()): 1 | 2 | 3 => {
    if (cat.parent === null || !byId.has(cat.parent) || visited.has(cat.id)) return 1;
    visited.add(cat.id);
    const parent = byId.get(cat.parent)!;
    if (parent.parent === null || !byId.has(parent.parent)) return 2;
    return 3;
  };

  // Count direct products per category + bubble up to parents
  const directCounts = new Map<number, number>();
  for (const p of products) {
    if (p.category?.id) {
      directCounts.set(p.category.id, (directCounts.get(p.category.id) ?? 0) + 1);
    }
  }

  const totalCounts = new Map<number, number>();
  for (const cat of apiCategories) {
    let cur: ApiCategory | undefined = cat;
    const count = directCounts.get(cat.id) ?? 0;
    const seen = new Set<number>();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      totalCounts.set(cur.id, (totalCounts.get(cur.id) ?? 0) + count);
      cur = cur.parent !== null ? byId.get(cur.parent) : undefined;
    }
  }

  return apiCategories.map((c) => {
    const idStr = String(c.id);
    const prev = prevMap.get(idStr);
    return {
      id: idStr,
      name: c.name,
      slug: c.slug,
      level: resolveLevel(c),
      parentId: c.parent !== null ? String(c.parent) : null,
      skuCount: totalCounts.get(c.id) ?? 0,
      sortOrder: c.sort ?? 0,
      isActive: c.is_active,
      seoTitle: prev?.seoTitle,
      seoDescription: prev?.seoDescription,
      filterAttributes: prev?.filterAttributes ?? ['Цена', 'Бренд', 'Наличие'],
    };
  });
}

export function mapBrandsFromApi(
  apiBrands: ApiBrand[],
  products: ApiProduct[],
  prevBrands: Brand[] = []
): Brand[] {
  const prevMap = new Map(prevBrands.map((b) => [b.id, b]));
  const counts = new Map<number, number>();
  for (const p of products) {
    if (p.brand?.id) {
      counts.set(p.brand.id, (counts.get(p.brand.id) ?? 0) + 1);
    }
  }

  return apiBrands.map((b) => {
    const idStr = String(b.id);
    const prev = prevMap.get(idStr);
    return {
      id: idStr,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      country: prev?.country ?? 'Международный',
      productCount: counts.get(b.id) ?? 0,
      isPopular: prev?.isPopular ?? true,
      isActive: prev?.isActive ?? true,
    };
  });
}

export function mapProductsFromApi(
  apiProducts: ApiProduct[],
  apiCategories: ApiCategory[],
  newsItems: ApiNews[]
): Product[] {
  const catById = new Map(apiCategories.map((c) => [c.id, c]));
  const newsProductIds = new Set(newsItems.map((n) => n.product));

  return apiProducts.map((p) => {
    // Resolve L1 / L2 / L3 chain from p.category
    const chain: number[] = [];
    let cur: ApiCategory | undefined = p.category ? catById.get(p.category.id) ?? p.category : undefined;
    const seen = new Set<number>();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      chain.unshift(cur.id);
      cur = cur.parent !== null ? catById.get(cur.parent) : undefined;
    }

    const price = Number(p.price) || 0;
    const oldPrice = p.old_price !== null && p.old_price !== '' ? Number(p.old_price) : undefined;

    const badges: ProductBadge[] = [];
    if (newsProductIds.has(p.id)) badges.push('новинка');
    if (oldPrice && oldPrice > price) badges.push('распродажа');

    const attrsObj = p.attrs_json && typeof p.attrs_json === 'object' ? p.attrs_json : {};
    const attributes = Object.entries(attrsObj).map(([name, value]) => ({
      name,
      value: String(value ?? ''),
    }));

    return {
      id: String(p.id),
      slug: p.slug,
      sku: p.article,
      name: p.name,
      categoryId: p.category ? String(p.category.id) : '',
      categoryL1Id: chain[0] !== undefined ? String(chain[0]) : '',
      categoryL2Id: chain[1] !== undefined ? String(chain[1]) : undefined,
      categoryL3Id: chain[2] !== undefined ? String(chain[2]) : undefined,
      brandId: p.brand ? String(p.brand.id) : '',
      price,
      oldPrice,
      stockQty: p.is_active ? 25 : 0,
      stockStatus: p.is_active ? 'В наличии' : 'Нет в наличии',
      unit: 'шт.',
      badges,
      productType: p.category?.name ?? 'Товар',
      description: p.description ?? '',
      attributes,
      relatedIds: [],
      isActive: p.is_active,
      updatedAt: p.created_at ? p.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
  });
}

export function mapBackendOrderStatus(raw: string): OrderStatus {
  const s = (raw || '').toLowerCase();
  if (s === 'delivered' || s === 'paid' || s === 'completed') return 'ВЫПОЛНЕН';
  if (s === 'cancelled' || s === 'canceled') return 'ОТМЕНЕН';
  return 'ОБРАБОТКА';
}

export function mapUiStatusToBackend(status: OrderStatus): string {
  if (status === 'ВЫПОЛНЕН') return 'delivered';
  if (status === 'ОТМЕНЕН') return 'cancelled';
  return 'pending';
}

export function mapOrdersFromApi(apiOrders: ApiOrder[], prevOrders: Order[] = []): Order[] {
  const prevMap = new Map(prevOrders.map((o) => [o.id, o]));

  return apiOrders.map((o) => {
    const idStr = String(o.id);
    const prev = prevMap.get(idStr);
    const totalAmount = Number(o.total) || 0;
    const subtotalAmount = Number(o.subtotal) || totalAmount;

    return {
      id: idStr,
      orderNumber: o.number.startsWith('#') ? o.number : `#${o.number}`,
      rawNumber: o.number,
      backendStatus: o.status,
      userId: o.user,
      createdAt: o.created_at,
      status: mapBackendOrderStatus(o.status),
      isOneClick: prev?.isOneClick ?? false,
      customerId: o.user !== null ? String(o.user) : prev?.customerId,
      customerFirstName: prev?.customerFirstName ?? (o.user ? `Пользователь #${o.user}` : 'Клиент'),
      customerLastName: prev?.customerLastName ?? 'сайта',
      companyName: prev?.companyName,
      email: prev?.email ?? '—',
      phone: prev?.phone ?? '—',
      region: prev?.region ?? '—',
      city: prev?.city ?? '—',
      deliveryMethod: prev?.deliveryMethod ?? 'Доставка магазина',
      deliveryAddress: prev?.deliveryAddress ?? 'Уточняется менеджером',
      paymentMethod: prev?.paymentMethod ?? 'Картой на сайте',
      promoCode: prev?.promoCode,
      promoDiscount: Math.max(0, subtotalAmount - totalAmount),
      tierDiscount: prev?.tierDiscount ?? 0,
      deliveryCost: prev?.deliveryCost ?? 0,
      items: prev?.items ?? [],
      totalAmount,
      comment: prev?.comment,
    };
  });
}
