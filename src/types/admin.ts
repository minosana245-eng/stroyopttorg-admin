export type AdminSection =
  | 'dashboard'
  | 'catalog'
  | 'products'
  | 'orders'
  | 'customers'
  | 'promos'
  | 'content'
  | 'requests'
  | 'settings';

export type ProductBadge = 'хит' | 'новинка' | 'распродажа';
export type StockStatus = 'В наличии' | 'Под заказ' | 'Нет в наличии';

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug?: string;
  sku: string;
  name: string;
  categoryId?: string;
  categoryL1Id: string;
  categoryL2Id?: string;
  categoryL3Id?: string;
  brandId: string;
  price: number;
  oldPrice?: number;
  stockQty: number;
  stockStatus: StockStatus;
  unit: string;
  badges: ProductBadge[];
  productType: string;
  description: string;
  attributes: ProductAttribute[];
  relatedIds: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  level: 1 | 2 | 3;
  parentId: string | null;
  skuCount: number;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  filterAttributes: string[];
}

export interface Brand {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
  country: string;
  productCount: number;
  isPopular: boolean;
  isActive: boolean;
}

export type OrderStatus = 'ОБРАБОТКА' | 'ВЫПОЛНЕН' | 'ОТМЕНЕН';
export type DeliveryMethod =
  | 'Самовывоз'
  | 'Доставка магазина'
  | 'СДЭК (ПВЗ)'
  | 'СДЭК (курьером)';
export type PaymentMethod =
  | 'Картой на сайте'
  | 'Кредит от ОТП банка'
  | 'Покупай со Сбером';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  oldPrice?: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  rawNumber?: string;
  backendStatus?: string;
  userId?: number | null;
  createdAt: string;
  status: OrderStatus;
  isOneClick: boolean;
  customerId?: string;
  customerFirstName: string;
  customerLastName: string;
  companyName?: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  cdekPvzCode?: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  promoDiscount: number;
  tierDiscount: number;
  deliveryCost: number;
  items: OrderItem[];
  totalAmount: number;
  comment?: string;
}

export interface CustomerAddress {
  id: string;
  region: string;
  city: string;
  street: string;
  apartment?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  isB2B: boolean;
  email: string;
  phone: string;
  city: string;
  region: string;
  registeredAt: string;
  ordersCount: number;
  totalSpent: number;
  favoritesCount: number;
  addresses: CustomerAddress[];
  note?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderSum: number;
  validUntil: string;
  usageCount: number;
  usageLimit: number;
  isActive: boolean;
  campaignTitle?: string;
}

export interface DiscountTier {
  id: string;
  minAmount: number;
  discountPercent: number;
  label: string;
  isActive: boolean;
}

export interface CampaignBanner {
  id: string;
  title: string;
  type: 'АКЦИЯ' | 'СЛАЙДЕР';
  subtitle: string;
  promoCode?: string;
  validUntil: string;
  ctaText: string;
  isActive: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  rubric: string;
  publishedAt: string;
  views: number;
  excerpt: string;
  content: string;
  isPublished: boolean;
}

export interface CustomerReview {
  id: string;
  authorName: string;
  city: string;
  productName?: string;
  rating: number;
  text: string;
  createdAt: string;
  status: 'Опубликован' | 'На модерации' | 'Отклонен';
  adminReply?: string;
}

export interface FaqItem {
  id: string;
  category: 'Доставка' | 'Оплата' | 'Возврат' | 'Самовывоз' | 'Гарантия';
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  topic: string;
  createdAt: string;
  status: 'Новый' | 'В работе' | 'Обработан';
  managerNote?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: 'Подвал сайта' | 'Акции' | 'Оформление заказа';
  status: 'Активен' | 'Отписался';
}

export interface StoreSettings {
  companyName: string;
  inn: string;
  kpp: string;
  bankAccount: string;
  bankName: string;
  bik: string;
  phone: string;
  email: string;
  workHours: string;
  pickupAddress: string;
  warehouseArea: string;
  totalCatalogScale: number;
  pickupAvailable: boolean;
  cdekEnabled: boolean;
  storeDeliveryEnabled: boolean;
  paymentMethodsEnabled: Record<PaymentMethod, boolean>;
  activeCities: string[];
}

export interface AdminState {
  categories: CategoryNode[];
  brands: Brand[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  promoCodes: PromoCode[];
  discountTiers: DiscountTier[];
  campaigns: CampaignBanner[];
  articles: BlogArticle[];
  reviews: CustomerReview[];
  faqs: FaqItem[];
  callbacks: CallbackRequest[];
  subscribers: NewsletterSubscriber[];
  settings: StoreSettings;
}
