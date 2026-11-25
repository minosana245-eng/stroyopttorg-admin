import React, { useMemo, useState } from 'react';
import {
  Eye,
  Plus,
  Printer,
  Truck,
  CreditCard,
  MapPin,
  Building2,
  Check,
} from 'lucide-react';
import {
  AdminState,
  DeliveryMethod,
  Order,
  OrderStatus,
  PaymentMethod,
} from '../types/admin';
import { Badge, Card, CenterModal, DrawerModal, PageHeader } from '../components/ui/Primitives';
import { formatDateRu, formatRub, uid } from '../utils/format';

interface OrdersPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
  globalQuery: string;
}

const ORDER_STATUSES: OrderStatus[] = ['ОБРАБОТКА', 'ВЫПОЛНЕН', 'ОТМЕНЕН'];
const DELIVERY_METHODS: DeliveryMethod[] = [
  'Самовывоз',
  'Доставка магазина',
  'СДЭК (ПВЗ)',
  'СДЭК (курьером)',
];
const PAYMENT_METHODS: PaymentMethod[] = [
  'Картой на сайте',
  'Кредит от ОТП банка',
  'Покупай со Сбером',
];

export const OrdersPage: React.FC<OrdersPageProps> = ({ state, setState, globalQuery }) => {
  const [statusTab, setStatusTab] = useState<'all' | OrderStatus | 'oneclick'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | DeliveryMethod>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [newOrderForm, setNewOrderForm] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '+7 ',
    email: '',
    city: 'Черкесск',
    region: 'Карачаево-Черкесская Республика',
    deliveryMethod: 'Самовывоз' as DeliveryMethod,
    deliveryAddress: state.settings.pickupAddress,
    paymentMethod: 'Картой на сайте' as PaymentMethod,
    productId: state.products[0]?.id ?? '',
    quantity: 1,
    comment: '',
  });

  const q = globalQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    return state.orders.filter((o) => {
      if (statusTab === 'oneclick' && !o.isOneClick) return false;
      if (statusTab !== 'all' && statusTab !== 'oneclick' && o.status !== statusTab) return false;
      if (deliveryFilter !== 'all' && o.deliveryMethod !== deliveryFilter) return false;
      if (q) {
        const hay = `${o.orderNumber} ${o.customerFirstName} ${o.customerLastName} ${o.companyName ?? ''} ${o.phone} ${o.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [state.orders, statusTab, deliveryFilter, q]);

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
  };

  const handleCreateOrder = () => {
    const product = state.products.find((p) => p.id === newOrderForm.productId);
    if (!newOrderForm.firstName.trim() || !newOrderForm.phone.trim() || !product) return;

    const subtotal = product.price * newOrderForm.quantity;
    const deliveryCost = newOrderForm.deliveryMethod === 'Самовывоз' ? 0 : 550;
    const created: Order = {
      id: uid('ord'),
      orderNumber: `#${Math.floor(56440 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: 'ОБРАБОТКА',
      isOneClick: false,
      customerFirstName: newOrderForm.firstName.trim(),
      customerLastName: newOrderForm.lastName.trim() || 'Покупатель',
      companyName: newOrderForm.companyName.trim() || undefined,
      email: newOrderForm.email.trim() || 'client@stroiopttorg.ru',
      phone: newOrderForm.phone.trim(),
      region: newOrderForm.region,
      city: newOrderForm.city,
      deliveryMethod: newOrderForm.deliveryMethod,
      deliveryAddress: newOrderForm.deliveryAddress,
      paymentMethod: newOrderForm.paymentMethod,
      promoDiscount: 0,
      tierDiscount: 0,
      deliveryCost,
      items: [
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          quantity: newOrderForm.quantity,
        },
      ],
      totalAmount: subtotal + deliveryCost,
      comment: newOrderForm.comment.trim() || undefined,
    };

    setState((prev) => ({ ...prev, orders: [created, ...prev.orders] }));
    setCreateOpen(false);
  };

  const counts = {
    all: state.orders.length,
    ОБРАБОТКА: state.orders.filter((o) => o.status === 'ОБРАБОТКА').length,
    ВЫПОЛНЕН: state.orders.filter((o) => o.status === 'ВЫПОЛНЕН').length,
    ОТМЕНЕН: state.orders.filter((o) => o.status === 'ОТМЕНЕН').length,
    oneclick: state.orders.filter((o) => o.isOneClick).length,
  };

  return (
    <div>
      <PageHeader
        title="Заказы и оформление (СДЭК / Самовывоз)"
        subtitle="Обработка заказов с сайта, покупок в 1 клик и B2B-заявок"
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
          >
            <Plus className="h-4 w-4" />
            Создать заказ вручную
          </button>
        }
      />

      {/* Tabs + Delivery filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', `Все (${counts.all})`],
              ['ОБРАБОТКА', `Обработка (${counts.ОБРАБОТКА})`],
              ['ВЫПОЛНЕН', `Выполнен (${counts.ВЫПОЛНЕН})`],
              ['ОТМЕНЕН', `Отменен (${counts.ОТМЕНЕН})`],
              ['oneclick', `В 1 клик (${counts.oneclick})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusTab(key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                statusTab === key
                  ? 'border-[#186FD4] bg-[#186FD4] text-white'
                  : 'border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={deliveryFilter}
          onChange={(e) => setDeliveryFilter(e.target.value as 'all' | DeliveryMethod)}
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#102035] focus:border-[#186FD4] focus:outline-none"
        >
          <option value="all">Все способы доставки</option>
          {DELIVERY_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Номер / Дата</th>
                <th className="px-4 py-3">Покупатель / Компания</th>
                <th className="px-4 py-3">Доставка и город</th>
                <th className="px-4 py-3">Оплата и промо</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3 text-right">Итого</th>
                <th className="px-4 py-3 text-right">Просмотр</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((ord) => (
                <tr key={ord.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-bold text-[#102035] tabular-nums">
                      {ord.orderNumber}
                      {ord.isOneClick && <Badge variant="blue">1 клик</Badge>}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{formatDateRu(ord.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#111827]">
                      {ord.customerFirstName} {ord.customerLastName}
                    </div>
                    {ord.companyName && (
                      <div className="flex items-center gap-1 text-xs font-medium text-[#186FD4]">
                        <Building2 className="h-3 w-3" />
                        {ord.companyName}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">{ord.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-semibold text-[#102035]">{ord.deliveryMethod}</div>
                    <div className="text-slate-500">
                      {ord.city}
                      {ord.cdekPvzCode ? ` · ПВЗ ${ord.cdekPvzCode}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-[#111827]">{ord.paymentMethod}</div>
                    {ord.promoCode && (
                      <div className="mt-0.5 font-mono text-[11px] font-semibold text-[#1A9C56]">
                        Промо: {ord.promoCode}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className={`rounded-md border px-2 py-1 text-xs font-bold focus:outline-none ${
                        ord.status === 'ВЫПОЛНЕН'
                          ? 'border-emerald-200 bg-emerald-50 text-[#1A9C56]'
                          : ord.status === 'ОБРАБОТКА'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-rose-200 bg-rose-50 text-[#E11D48]'
                      }`}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <div className="font-bold text-[#102035]">{formatRub(ord.totalAmount)}</div>
                    <div className="text-xs text-slate-400">{ord.items.length} поз.</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-blue-50 hover:text-[#186FD4]"
                        title="Детали заказа"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceOrder(ord)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#102035]"
                        title="Счет / Накладная"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Detail Drawer matching Figma Страница заказа */}
      <DrawerModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Заказ ${selectedOrder?.orderNumber ?? ''}`}
        subtitle={selectedOrder ? `Оформлен ${formatDateRu(selectedOrder.createdAt)}` : undefined}
        footer={
          selectedOrder && (
            <>
              <button
                type="button"
                onClick={() => setInvoiceOrder(selectedOrder)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#102035]"
              >
                <Printer className="h-4 w-4" />
                Печать счёта
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white"
              >
                Готово
              </button>
            </>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-4">
              <div>
                <div className="text-xs text-slate-500">Текущий статус заказа</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={
                      selectedOrder.status === 'ВЫПОЛНЕН'
                        ? 'green'
                        : selectedOrder.status === 'ОБРАБОТКА'
                        ? 'amber'
                        : 'red'
                    }
                  >
                    {selectedOrder.status}
                  </Badge>
                  {selectedOrder.isOneClick && <Badge variant="blue">Быстрый заказ (1 клик)</Badge>}
                </div>
              </div>
              <div className="flex gap-1.5">
                {ORDER_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrder.id, st)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                      selectedOrder.status === st
                        ? 'border-[#102035] bg-[#102035] text-white'
                        : 'border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] p-4 text-xs space-y-1.5">
                <div className="font-bold uppercase tracking-wide text-slate-400">Покупатель</div>
                <div className="text-sm font-bold text-[#102035]">
                  {selectedOrder.customerFirstName} {selectedOrder.customerLastName}
                </div>
                {selectedOrder.companyName && (
                  <div className="font-semibold text-[#186FD4]">{selectedOrder.companyName}</div>
                )}
                <div className="text-slate-600">{selectedOrder.phone}</div>
                <div className="text-slate-600">{selectedOrder.email}</div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-slate-400">
                  <Truck className="h-3.5 w-3.5" /> Доставка и оплата
                </div>
                <div className="text-sm font-bold text-[#102035]">
                  {selectedOrder.deliveryMethod}
                </div>
                <div className="flex items-start gap-1 text-slate-600">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>
                    {selectedOrder.region}, {selectedOrder.deliveryAddress}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            {selectedOrder.comment && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
                <strong>Комментарий клиента:</strong> {selectedOrder.comment}
              </div>
            )}

            {/* Order Items */}
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="border-b border-[#E5E7EB] bg-[#F5F7FA] px-4 py-2.5 text-xs font-bold uppercase text-slate-500">
                Состав заказа
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                      <div className="font-semibold text-[#102035]">{item.name}</div>
                    </div>
                    <div className="text-right tabular-nums shrink-0">
                      <div className="font-bold text-[#102035]">
                        {formatRub(item.price * item.quantity)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.quantity} × {formatRub(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown matching Корзина */}
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-4 space-y-2 text-sm">
              {selectedOrder.promoDiscount > 0 && (
                <div className="flex justify-between text-[#1A9C56]">
                  <span>Скидка по промокоду ({selectedOrder.promoCode})</span>
                  <span className="font-semibold tabular-nums">
                    -{formatRub(selectedOrder.promoDiscount)}
                  </span>
                </div>
              )}
              {selectedOrder.tierDiscount > 0 && (
                <div className="flex justify-between text-[#1A9C56]">
                  <span>Скидка от суммы заказа</span>
                  <span className="font-semibold tabular-nums">
                    -{formatRub(selectedOrder.tierDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Доставка ({selectedOrder.deliveryMethod})</span>
                <span className="font-semibold tabular-nums">
                  {selectedOrder.deliveryCost === 0 ? 'Бесплатно' : formatRub(selectedOrder.deliveryCost)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold text-[#102035]">
                <span>Итого к оплате</span>
                <span className="tabular-nums">{formatRub(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </DrawerModal>

      {/* Printable Invoice Preview Modal */}
      <CenterModal
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        title={`Счет на оплату по заказу ${invoiceOrder?.orderNumber ?? ''}`}
        maxWidthClass="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setInvoiceOrder(null)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
            >
              Закрыть
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white"
            >
              <Printer className="h-4 w-4" />
              Распечатать
            </button>
          </>
        }
      >
        {invoiceOrder && (
          <div className="space-y-4 text-xs text-[#111827]">
            <div className="rounded-lg border border-[#E5E7EB] p-3 bg-slate-50">
              <div className="font-bold text-sm text-[#102035]">{state.settings.companyName}</div>
              <div>
                ИНН {state.settings.inn} · КПП {state.settings.kpp} · БИК {state.settings.bik}
              </div>
              <div>
                р/с {state.settings.bankAccount} в {state.settings.bankName}
              </div>
              <div>Адрес склада: {state.settings.pickupAddress}</div>
            </div>
            <div>
              <strong>Покупатель:</strong> {invoiceOrder.customerFirstName}{' '}
              {invoiceOrder.customerLastName}
              {invoiceOrder.companyName ? ` (${invoiceOrder.companyName})` : ''}, тел.{' '}
              {invoiceOrder.phone}
            </div>
            <table className="w-full border-collapse border border-[#E5E7EB]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-[#E5E7EB] p-2 text-left">Артикул</th>
                  <th className="border border-[#E5E7EB] p-2 text-left">Товар</th>
                  <th className="border border-[#E5E7EB] p-2 text-right">Кол-во</th>
                  <th className="border border-[#E5E7EB] p-2 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {invoiceOrder.items.map((it) => (
                  <tr key={it.productId}>
                    <td className="border border-[#E5E7EB] p-2 font-mono">{it.sku}</td>
                    <td className="border border-[#E5E7EB] p-2">{it.name}</td>
                    <td className="border border-[#E5E7EB] p-2 text-right">{it.quantity}</td>
                    <td className="border border-[#E5E7EB] p-2 text-right tabular-nums">
                      {formatRub(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-sm font-bold text-[#102035]">
              Всего к оплате: {formatRub(invoiceOrder.totalAmount)}
            </div>
          </div>
        )}
      </CenterModal>

      {/* Create Manual Order Modal */}
      <CenterModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Оформление нового заказа (менеджер)"
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleCreateOrder}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Check className="h-4 w-4" />
              Создать заказ
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold">Имя *</label>
              <input
                type="text"
                value={newOrderForm.firstName}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, firstName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold">Фамилия</label>
              <input
                type="text"
                value={newOrderForm.lastName}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, lastName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold">Телефон *</label>
              <input
                type="text"
                value={newOrderForm.phone}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold">Компания (если B2B)</label>
              <input
                type="text"
                value={newOrderForm.companyName}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, companyName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold">Товар</label>
              <select
                value={newOrderForm.productId}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, productId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5"
              >
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} ({formatRub(p.price)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold">Количество</label>
              <input
                type="number"
                min={1}
                value={newOrderForm.quantity}
                onChange={(e) =>
                  setNewOrderForm({ ...newOrderForm, quantity: Math.max(1, Number(e.target.value) || 1) })
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold">Доставка</label>
              <select
                value={newOrderForm.deliveryMethod}
                onChange={(e) =>
                  setNewOrderForm({
                    ...newOrderForm,
                    deliveryMethod: e.target.value as DeliveryMethod,
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5"
              >
                {DELIVERY_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold">Оплата</label>
              <select
                value={newOrderForm.paymentMethod}
                onChange={(e) =>
                  setNewOrderForm({
                    ...newOrderForm,
                    paymentMethod: e.target.value as PaymentMethod,
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold">Адрес доставки / ПВЗ</label>
            <input
              type="text"
              value={newOrderForm.deliveryAddress}
              onChange={(e) => setNewOrderForm({ ...newOrderForm, deliveryAddress: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5"
            />
          </div>
        </div>
      </CenterModal>
    </div>
  );
};
