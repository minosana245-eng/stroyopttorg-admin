import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  PhoneCall,
  Tag,
  ArrowUpRight,
  Truck,
  Store,
} from 'lucide-react';
import { AdminSection, AdminState } from '../types/admin';
import { Badge, Card, PageHeader, StatCard } from '../components/ui/Primitives';
import { formatNumber, formatRub } from '../utils/format';

interface DashboardPageProps {
  state: AdminState;
  onNavigate: (section: AdminSection) => void;
}

const CHART_DATA = {
  week: [
    { label: 'Пн', revenue: 184000, orders: 14 },
    { label: 'Вт', revenue: 246000, orders: 19 },
    { label: 'Ср', revenue: 215000, orders: 16 },
    { label: 'Чт', revenue: 312000, orders: 24 },
    { label: 'Пт', revenue: 398000, orders: 31 },
    { label: 'Сб', revenue: 289000, orders: 22 },
    { label: 'Вс', revenue: 175000, orders: 13 },
  ],
  month: [
    { label: 'Нед 1', revenue: 1120000, orders: 84 },
    { label: 'Нед 2', revenue: 1380000, orders: 102 },
    { label: 'Нед 3', revenue: 1295000, orders: 96 },
    { label: 'Нед 4', revenue: 1640000, orders: 121 },
  ],
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ state, onNavigate }) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const activeOrders = state.orders.filter((o) => o.status !== 'ОТМЕНЕН');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrder = activeOrders.length ? Math.round(totalRevenue / activeOrders.length) : 0;
  const inStockCount = state.products.filter((p) => p.stockStatus === 'В наличии').length;
  const activePromos = state.promoCodes.filter((p) => p.isActive).length;
  const newCallbacks = state.callbacks.filter((c) => c.status === 'Новый').length;
  const callbackWord =
    newCallbacks % 10 === 1 && newCallbacks % 100 !== 11
      ? 'новый звонок'
      : newCallbacks % 10 >= 2 && newCallbacks % 10 <= 4 && (newCallbacks % 100 < 10 || newCallbacks % 100 >= 20)
      ? 'новых звонка'
      : 'новых звонков';

  const series = CHART_DATA[period];
  const maxRev = Math.max(...series.map((d) => d.revenue), 1);

  const deliveryStats = [
    {
      label: 'СДЭК (ПВЗ)',
      count: state.orders.filter((o) => o.deliveryMethod === 'СДЭК (ПВЗ)').length,
      color: 'bg-[#186FD4]',
    },
    {
      label: 'СДЭК (курьером)',
      count: state.orders.filter((o) => o.deliveryMethod === 'СДЭК (курьером)').length,
      color: 'bg-sky-500',
    },
    {
      label: 'Самовывоз (Черкесск)',
      count: state.orders.filter((o) => o.deliveryMethod === 'Самовывоз').length,
      color: 'bg-[#1A9C56]',
    },
    {
      label: 'Доставка магазина',
      count: state.orders.filter((o) => o.deliveryMethod === 'Доставка магазина').length,
      color: 'bg-amber-500',
    },
  ];

  const totalOrdersCount = Math.max(state.orders.length, 1);

  return (
    <div>
      <PageHeader
        title="Сводка магазина СтройОптТорг"
        subtitle={`Склад: ${state.settings.warehouseArea} · ${state.settings.pickupAddress}`}
        actions={
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#145BB0]"
          >
            Перейти к товарам
            <ArrowUpRight className="h-4 w-4" />
          </button>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ассортимент в базе"
          value={`${formatNumber(state.settings.totalCatalogScale)} SKU`}
          trend={`${inStockCount} из ${state.products.length} в витрине`}
          hint="3 уровня каталога"
          icon={<Package className="h-5 w-5" />}
          accent="blue"
          onClick={() => onNavigate('products')}
        />
        <StatCard
          label="Выручка по активным заказам"
          value={formatRub(totalRevenue)}
          trend="+18.4% к прошлому периоду"
          hint={`${activeOrders.length} активных заказов`}
          icon={<Wallet className="h-5 w-5" />}
          accent="green"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          label="Средний чек"
          value={formatRub(avgOrder)}
          trend="Учет скидок от суммы корзины"
          hint={`${state.customers.filter((c) => c.isB2B).length} B2B-клиента`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="amber"
          onClick={() => onNavigate('customers')}
        />
        <StatCard
          label="Заявки и промо"
          value={`${newCallbacks} ${callbackWord}`}
          trend={`${activePromos} активных промокода`}
          trendPositive={newCallbacks === 0}
          hint="Ответ до 15 мин"
          icon={<PhoneCall className="h-5 w-5" />}
          accent="red"
          onClick={() => onNavigate('requests')}
        />
      </div>

      {/* Charts + Delivery Channels */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#102035]">Динамика продаж и заказов</h2>
              <p className="text-xs text-slate-500">Выручка (₽) и количество оформленных заказов</p>
            </div>
            <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPeriod('week')}
                className={`rounded-md px-3 py-1 transition ${
                  period === 'week' ? 'bg-white text-[#186FD4] shadow-xs' : 'text-slate-600'
                }`}
              >
                7 дней
              </button>
              <button
                type="button"
                onClick={() => setPeriod('month')}
                className={`rounded-md px-3 py-1 transition ${
                  period === 'month' ? 'bg-white text-[#186FD4] shadow-xs' : 'text-slate-600'
                }`}
              >
                Месяц
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-3 items-end h-52">
            {series.map((item) => {
              const heightPct = Math.max(12, Math.round((item.revenue / maxRev) * 100));
              return (
                <div
                  key={item.label}
                  className={`flex flex-col items-center gap-2 h-full justify-end ${
                    period === 'month' ? 'col-span-1 sm:col-span-1' : ''
                  }`}
                >
                  <div className="group relative flex w-full flex-1 items-end justify-center">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[44px] rounded-t-lg bg-[#186FD4] transition-all group-hover:bg-[#EE3F22]"
                    />
                    <div className="pointer-events-none absolute -top-9 hidden whitespace-nowrap rounded-md bg-[#102035] px-2 py-1 text-[11px] font-semibold text-white shadow-md group-hover:block">
                      {formatRub(item.revenue)} · {item.orders} зак.
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-[#102035]">{item.label}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums">{item.orders} шт.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#102035]">Способы доставки</h2>
              <Truck className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Распределение текущих заказов</p>

            <div className="mt-5 space-y-4">
              {deliveryStats.map((d) => {
                const pct = Math.round((d.count / totalOrdersCount) * 100);
                return (
                  <div key={d.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#102035]">{d.label}</span>
                      <span className="font-semibold text-slate-600 tabular-nums">
                        {d.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${d.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/70 p-3.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#102035]">
              <Store className="h-4 w-4 text-[#186FD4]" />
              Статус самовывоза: {state.settings.pickupAvailable ? 'Доступен' : 'Отключен'}
            </div>
            <p className="mt-1 text-slate-600">{state.settings.pickupAddress}</p>
          </div>
        </Card>
      </div>

      {/* Bottom tables: Recent Orders & Active Promos/Callbacks */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#186FD4]" />
              <h2 className="text-base font-bold text-[#102035]">Последние заказы</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-[#186FD4] hover:underline"
            >
              Все заказы →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7FA] text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Номер</th>
                  <th className="px-4 py-3">Клиент</th>
                  <th className="px-4 py-3">Доставка</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-5 py-3 text-right">Итого</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {state.orders.slice(0, 5).map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => onNavigate('orders')}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-bold text-[#102035] tabular-nums">
                      {ord.orderNumber}
                      {ord.isOneClick && (
                        <Badge variant="blue" className="ml-2">
                          1 клик
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#111827]">
                        {ord.customerFirstName} {ord.customerLastName}
                      </div>
                      {ord.companyName && (
                        <div className="text-xs text-slate-500">{ord.companyName}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{ord.deliveryMethod}</div>
                      <div className="text-slate-400">{ord.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          ord.status === 'ВЫПОЛНЕН'
                            ? 'green'
                            : ord.status === 'ОБРАБОТКА'
                            ? 'amber'
                            : 'red'
                        }
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#102035] tabular-nums whitespace-nowrap">
                      {formatRub(ord.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#EE3F22]" />
              <h2 className="text-base font-bold text-[#102035]">Активные промокоды</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('promos')}
              className="text-xs font-semibold text-[#186FD4] hover:underline"
            >
              Настроить →
            </button>
          </div>

          <div className="space-y-2.5">
            {state.promoCodes
              .filter((p) => p.isActive)
              .map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] px-3 py-2.5"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-[#102035]">{promo.code}</div>
                    <div className="text-[11px] text-slate-500">
                      Использований: {promo.usageCount} / {promo.usageLimit}
                    </div>
                  </div>
                  <Badge variant="green">
                    {promo.discountType === 'fixed'
                      ? `-${formatRub(promo.discountValue)}`
                      : `-${promo.discountValue}%`}
                  </Badge>
                </div>
              ))}
          </div>

          <div className="border-t border-[#E5E7EB] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Срочные звонки
              </span>
              <button
                type="button"
                onClick={() => onNavigate('requests')}
                className="text-xs font-semibold text-[#186FD4] hover:underline"
              >
                Все ({state.callbacks.length})
              </button>
            </div>
            {state.callbacks.slice(0, 2).map((cb) => (
              <div
                key={cb.id}
                className="mt-2 rounded-lg border border-[#E5E7EB] p-2.5 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-[#102035]">
                  <span>{cb.name}</span>
                  <Badge variant={cb.status === 'Новый' ? 'red' : 'amber'}>{cb.status}</Badge>
                </div>
                <div className="mt-0.5 text-slate-600">{cb.phone}</div>
                <div className="mt-0.5 truncate text-slate-400">{cb.topic}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
