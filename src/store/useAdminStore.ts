import { useCallback, useEffect, useState } from 'react';
import { SEED_ADMIN_STATE } from '../data/seedData';
import { AdminState, Brand, CategoryNode, Order, OrderStatus, Product } from '../types/admin';
import {
  ApiError,
  AuthSession,
  loadAuthSession,
  saveAuthSession,
} from '../api/client';
import {
  ApiProductWritePayload,
  authApi,
  brandsApi,
  categoriesApi,
  newsApi,
  ordersApi,
  productsApi,
} from '../api/endpoints';
import {
  mapBrandsFromApi,
  mapCategoriesFromApi,
  mapOrdersFromApi,
  mapProductsFromApi,
  mapUiStatusToBackend,
} from '../api/mappers';
import { slugifyLatin } from '../utils/format';

const STORAGE_KEY = 'stroyopttorg_admin_v1';

function loadInitialState(): AdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ADMIN_STATE;
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    return {
      ...SEED_ADMIN_STATE,
      ...parsed,
      settings: {
        ...SEED_ADMIN_STATE.settings,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return SEED_ADMIN_STATE;
  }
}

export function useAdminStore() {
  const [state, setState] = useState<AdminState>(loadInitialState);
  const [authSession, setAuthSession] = useState<AuthSession | null>(loadAuthSession);
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const syncFromApi = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const [catsRes, brandsRes, prodsRes, ordersRes, newsRes] = await Promise.all([
        categoriesApi.listAll(),
        brandsApi.listAll(),
        productsApi.listAll(),
        ordersApi.listAll(),
        newsApi.listAll(),
      ]);

      setState((prev) => {
        const categories = mapCategoriesFromApi(catsRes.results, prodsRes.results, prev.categories);
        const brands = mapBrandsFromApi(brandsRes.results, prodsRes.results, prev.brands);
        const products = mapProductsFromApi(prodsRes.results, catsRes.results, newsRes.results);
        const orders = mapOrdersFromApi(ordersRes.results, prev.orders);

        return {
          ...prev,
          categories,
          brands,
          products,
          orders,
          settings: {
            ...prev.settings,
            totalCatalogScale: prodsRes.count,
          },
        };
      });

      setApiConnected(true);
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка подключения к API';
      setApiConnected(false);
      setSyncError(msg);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    void syncFromApi();
  }, [syncFromApi]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const accessToken = res.access ?? res.token ?? '';
    if (!accessToken) {
      throw new Error('Сервер не вернул access-токен');
    }
    const session: AuthSession = {
      accessToken,
      refreshToken: res.refresh,
      email,
    };
    saveAuthSession(session);
    setAuthSession(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    saveAuthSession(null);
    setAuthSession(null);
  }, []);

  const resetToSeed = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(SEED_ADMIN_STATE);
    void syncFromApi();
  };

  // --- API-backed CRUD helpers ---

  const saveCategoryApi = async (cat: CategoryNode, isNew: boolean) => {
    const slug = slugifyLatin(cat.slug.trim() || cat.name);
    const payload = {
      name: cat.name.trim(),
      slug,
      sort: cat.sortOrder,
      is_active: cat.isActive,
      parent: cat.parentId ? Number(cat.parentId) : null,
    };

    if (isNew) {
      await categoriesApi.create(payload);
    } else {
      await categoriesApi.update(Number(cat.id), payload);
    }
    await syncFromApi();
  };

  const deleteCategoryApi = async (id: string) => {
    await categoriesApi.remove(Number(id));
    await syncFromApi();
  };

  const saveBrandApi = async (brand: Brand, isNew: boolean) => {
    const slug = slugifyLatin(brand.slug?.trim() || brand.name);
    const payload = {
      name: brand.name.trim(),
      slug,
      logo: brand.logo ?? null,
    };

    let savedId: string;
    if (isNew) {
      const created = await brandsApi.create(payload);
      savedId = String(created.id);
    } else {
      const updated = await brandsApi.update(Number(brand.id), payload);
      savedId = String(updated.id);
    }

    // Preserve local-only metadata (country, isPopular, isActive)
    setState((prev) => {
      const exists = prev.brands.some((b) => b.id === savedId);
      const merged: Brand = { ...brand, id: savedId, slug };
      return {
        ...prev,
        brands: exists
          ? prev.brands.map((b) => (b.id === savedId ? merged : b))
          : [...prev.brands, merged],
      };
    });

    await syncFromApi();
  };

  const deleteBrandApi = async (id: string) => {
    await brandsApi.remove(Number(id));
    await syncFromApi();
  };

  const buildProductPayload = (product: Product): ApiProductWritePayload => {
    const targetCategoryId =
      product.categoryId ||
      product.categoryL3Id ||
      product.categoryL2Id ||
      product.categoryL1Id;

    const attrsJson: Record<string, string> = {};
    for (const a of product.attributes) {
      if (a.name.trim()) {
        attrsJson[a.name.trim()] = a.value.trim();
      }
    }

    return {
      category_id: Number(targetCategoryId),
      brand_id: product.brandId ? Number(product.brandId) : null,
      name: product.name.trim(),
      slug: slugifyLatin(product.slug?.trim() || product.name || product.sku),
      article: product.sku.trim(),
      price: product.price.toFixed(2),
      old_price: product.oldPrice !== undefined ? product.oldPrice.toFixed(2) : null,
      attrs_json: attrsJson,
      description: product.description.trim() || null,
      is_active: product.isActive && product.stockStatus !== 'Нет в наличии',
    };
  };

  const saveProductApi = async (
    product: Product,
    isNew: boolean,
    originalSlug?: string
  ) => {
    const payload = buildProductPayload(product);
    if (isNew) {
      await productsApi.create(payload);
    } else {
      const lookupSlug = originalSlug || product.slug || payload.slug;
      await productsApi.updateBySlug(lookupSlug, payload);
    }
    await syncFromApi();
  };

  const deleteProductApi = async (product: Product) => {
    const lookupSlug = product.slug || slugifyLatin(product.name);
    await productsApi.removeBySlug(lookupSlug);
    await syncFromApi();
  };

  const bulkUpdateProductsApi = async (
    targets: Product[],
    updater: (p: Product) => Product
  ) => {
    for (const p of targets) {
      const updated = updater(p);
      const payload = buildProductPayload(updated);
      const lookupSlug = p.slug || payload.slug;
      await productsApi.updateBySlug(lookupSlug, payload);
    }
    await syncFromApi();
  };

  const updateOrderStatusApi = async (orderId: string, status: OrderStatus) => {
    const backendStatus = mapUiStatusToBackend(status);
    await ordersApi.update(Number(orderId), { status: backendStatus });
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status, backendStatus } : o
      ),
    }));
  };

  const createOrderApi = async (order: Order) => {
    const cleanNumber = order.rawNumber || order.orderNumber.replace(/^#/, '');
    const created = await ordersApi.create({
      number: cleanNumber,
      status: mapUiStatusToBackend(order.status),
      subtotal: order.totalAmount.toFixed(2),
      total: order.totalAmount.toFixed(2),
    });

    const createdId = String(created.id);
    setState((prev) => ({
      ...prev,
      orders: [{ ...order, id: createdId, rawNumber: created.number }, ...prev.orders],
    }));
    await syncFromApi();
  };

  return {
    state,
    setState,
    resetToSeed,
    authSession,
    login,
    logout,
    isSyncing,
    apiConnected,
    syncError,
    lastSyncedAt,
    syncFromApi,
    saveCategoryApi,
    deleteCategoryApi,
    saveBrandApi,
    deleteBrandApi,
    saveProductApi,
    deleteProductApi,
    bulkUpdateProductsApi,
    updateOrderStatusApi,
    createOrderApi,
    isAuthError: (err: unknown) => err instanceof ApiError && (err.status === 401 || err.status === 403),
  };
}
