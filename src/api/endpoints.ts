import { apiRequest, fetchAllPages } from './client';

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  sort: number;
  is_active: boolean;
  parent: number | null;
}

export interface ApiBrand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface ApiProduct {
  id: number;
  category: ApiCategory;
  brand: ApiBrand | null;
  name: string;
  slug: string;
  article: string;
  price: string;
  old_price: string | null;
  attrs_json: Record<string, string> | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ApiProductWritePayload {
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  article: string;
  price: string | number;
  old_price: string | number | null;
  attrs_json: Record<string, string>;
  description: string | null;
  is_active: boolean;
}

export interface ApiOrder {
  id: number;
  number: string;
  status: string;
  subtotal: string;
  total: string;
  created_at: string;
  user: number | null;
}

export interface ApiNews {
  id: number;
  created_at: string;
  product: number;
}

export interface LoginResponse {
  access?: string;
  refresh?: string;
  token?: string;
  [key: string]: unknown;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/user/auth/login/', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password2: string;
  }) =>
    apiRequest<Record<string, unknown>>('/user/auth/register/', {
      method: 'POST',
      body: payload,
      auth: false,
    }),
};

export const categoriesApi = {
  listAll: () => fetchAllPages<ApiCategory>('/categories/'),
  create: (payload: Omit<ApiCategory, 'id'>) =>
    apiRequest<ApiCategory>('/categories/', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<Omit<ApiCategory, 'id'>>) =>
    apiRequest<ApiCategory>(`/categories/${id}/`, { method: 'PATCH', body: payload }),
  remove: (id: number) => apiRequest<void>(`/categories/${id}/`, { method: 'DELETE' }),
};

export const brandsApi = {
  listAll: () => fetchAllPages<ApiBrand>('/brands/'),
  create: (payload: Omit<ApiBrand, 'id'>) =>
    apiRequest<ApiBrand>('/brands/', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<Omit<ApiBrand, 'id'>>) =>
    apiRequest<ApiBrand>(`/brands/${id}/`, { method: 'PATCH', body: payload }),
  remove: (id: number) => apiRequest<void>(`/brands/${id}/`, { method: 'DELETE' }),
};

export const productsApi = {
  listAll: () => fetchAllPages<ApiProduct>('/products/'),
  search: (q: string) =>
    apiRequest<ApiProduct[]>(`/products/search/?q=${encodeURIComponent(q)}`),
  create: (payload: ApiProductWritePayload) =>
    apiRequest<ApiProduct>('/products/', { method: 'POST', body: payload }),
  updateBySlug: (slug: string, payload: Partial<ApiProductWritePayload>) =>
    apiRequest<ApiProduct>(`/products/${encodeURIComponent(slug)}/`, {
      method: 'PATCH',
      body: payload,
    }),
  removeBySlug: (slug: string) =>
    apiRequest<void>(`/products/${encodeURIComponent(slug)}/`, { method: 'DELETE' }),
};

export const ordersApi = {
  listAll: () => fetchAllPages<ApiOrder>('/orders/'),
  create: (payload: { number: string; status?: string; subtotal: string; total: string }) =>
    apiRequest<ApiOrder>('/orders/', { method: 'POST', body: payload }),
  update: (id: number, payload: Partial<{ number: string; status: string; subtotal: string; total: string }>) =>
    apiRequest<ApiOrder>(`/orders/${id}/`, { method: 'PATCH', body: payload }),
  remove: (id: number) => apiRequest<void>(`/orders/${id}/`, { method: 'DELETE' }),
};

export const newsApi = {
  listAll: () => fetchAllPages<ApiNews>('/news/'),
  create: (productId: number) =>
    apiRequest<ApiNews>('/news/', { method: 'POST', body: { product: productId } }),
  remove: (id: number) => apiRequest<void>(`/news/${id}/`, { method: 'DELETE' }),
};
