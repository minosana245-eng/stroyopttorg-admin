import React, { useMemo, useState } from 'react';
import { Building2, Eye, Heart, MapPin, Plus, UserCheck } from 'lucide-react';
import { AdminState, Customer } from '../types/admin';
import { Badge, Card, CenterModal, DrawerModal, PageHeader } from '../components/ui/Primitives';
import { formatDateRu, formatRub, uid } from '../utils/format';

interface CustomersPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
  globalQuery: string;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ state, setState, globalQuery }) => {
  const [segment, setSegment] = useState<'all' | 'b2b' | 'b2c'>('all');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    isB2B: false,
    email: '',
    phone: '+7 ',
    city: 'Черкесск',
    region: 'Карачаево-Черкесская Республика',
    street: '',
  });

  const q = globalQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    return state.customers.filter((c) => {
      if (segment === 'b2b' && !c.isB2B) return false;
      if (segment === 'b2c' && c.isB2B) return false;
      if (q) {
        const hay = `${c.firstName} ${c.lastName} ${c.companyName ?? ''} ${c.email} ${c.phone} ${c.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [state.customers, segment, q]);

  const addCustomer = () => {
    if (!newCustomer.firstName.trim() || !newCustomer.phone.trim()) return;
    const created: Customer = {
      id: uid('cus'),
      firstName: newCustomer.firstName.trim(),
      lastName: newCustomer.lastName.trim(),
      companyName: newCustomer.companyName.trim() || undefined,
      isB2B: newCustomer.isB2B || !!newCustomer.companyName.trim(),
      email: newCustomer.email.trim() || 'buyer@mail.ru',
      phone: newCustomer.phone.trim(),
      city: newCustomer.city.trim(),
      region: newCustomer.region.trim(),
      registeredAt: new Date().toISOString().slice(0, 10),
      ordersCount: 0,
      totalSpent: 0,
      favoritesCount: 0,
      addresses: newCustomer.street.trim()
        ? [
            {
              id: uid('addr'),
              region: newCustomer.region,
              city: newCustomer.city,
              street: newCustomer.street.trim(),
              isDefault: true,
            },
          ]
        : [],
    };
    setState((prev) => ({ ...prev, customers: [created, ...prev.customers] }));
    setAddOpen(false);
  };

  const updateCustomerNote = (id: string, note: string) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, note } : c)),
    }));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, note } : prev));
  };

  return (
    <div>
      <PageHeader
        title="Клиенты и организации (B2C / B2B)"
        subtitle="Личные кабинеты покупателей, сохраненные адреса доставки и история выкупа"
        actions={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
          >
            <Plus className="h-4 w-4" />
            Добавить клиента
          </button>
        }
      />

      <div className="mb-4 flex gap-2">
        {(
          [
            ['all', `Все (${state.customers.length})`],
            ['b2b', `Юрлица / B2B (${state.customers.filter((c) => c.isB2B).length})`],
            ['b2c', `Физлица / B2C (${state.customers.filter((c) => !c.isB2B).length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSegment(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              segment === key
                ? 'border-[#186FD4] bg-[#186FD4] text-white'
                : 'border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Клиент / Организация</th>
                <th className="px-4 py-3">Контакты</th>
                <th className="px-4 py-3">Город</th>
                <th className="px-4 py-3 text-right">Заказы</th>
                <th className="px-4 py-3 text-right">Сумма выкупа</th>
                <th className="px-4 py-3 text-right">Профиль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((cus) => (
                <tr key={cus.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-[#102035]">
                      <span>
                        {cus.firstName} {cus.lastName}
                      </span>
                      {cus.isB2B ? (
                        <Badge variant="blue">
                          <Building2 className="h-3 w-3" /> B2B
                        </Badge>
                      ) : (
                        <Badge variant="gray">B2C</Badge>
                      )}
                    </div>
                    {cus.companyName && (
                      <div className="mt-0.5 text-xs font-medium text-[#186FD4]">{cus.companyName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-[#111827]">{cus.phone}</div>
                    <div className="text-slate-400">{cus.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div>{cus.city}</div>
                    <div className="text-slate-400">{cus.region}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <div className="font-semibold text-[#102035]">{cus.ordersCount}</div>
                    <div className="inline-flex items-center gap-1 text-[11px] text-rose-500">
                      <Heart className="h-3 w-3" /> {cus.favoritesCount}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#102035] tabular-nums">
                    {formatRub(cus.totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(cus)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold text-[#186FD4] hover:border-[#186FD4]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Карточка
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Drawer */}
      <DrawerModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.firstName} ${selected.lastName}` : ''}
        subtitle={
          selected
            ? `${selected.companyName ?? 'Частный покупатель'} · Регистрация ${formatDateRu(
                selected.registeredAt
              )}`
            : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-3">
                <div className="text-xs text-slate-500">Заказов</div>
                <div className="mt-1 text-lg font-bold text-[#102035] tabular-nums">
                  {selected.ordersCount}
                </div>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-3">
                <div className="text-xs text-slate-500">Сумма выкупа</div>
                <div className="mt-1 text-lg font-bold text-[#1A9C56] tabular-nums">
                  {formatRub(selected.totalSpent)}
                </div>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-3">
                <div className="text-xs text-slate-500">В избранном</div>
                <div className="mt-1 text-lg font-bold text-[#102035] tabular-nums">
                  {selected.favoritesCount} тов.
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold uppercase text-slate-400">
                <UserCheck className="h-3.5 w-3.5" /> Контактные данные
              </div>
              <div>
                <strong>Телефон:</strong> {selected.phone}
              </div>
              <div>
                <strong>Email:</strong> {selected.email}
              </div>
              <div>
                <strong>Регион / Город:</strong> {selected.region}, {selected.city}
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> Адреса доставки (Личный кабинет)
              </div>
              {selected.addresses.length === 0 ? (
                <p className="text-xs text-slate-400">Адреса еще не сохранены</p>
              ) : (
                selected.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between rounded-lg bg-[#F5F7FA] px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#102035]">
                        {addr.city}, {addr.street}
                      </div>
                      <div className="text-slate-500">
                        {addr.region} {addr.postalCode ? `· ${addr.postalCode}` : ''}
                      </div>
                    </div>
                    {addr.isDefault && <Badge variant="green">Основной</Badge>}
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102035]">
                Заметка менеджера
              </label>
              <textarea
                rows={3}
                value={selected.note ?? ''}
                onChange={(e) => updateCustomerNote(selected.id, e.target.value)}
                placeholder="Условия отгрузки, персональная скидка, предпочтения по доставке..."
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] p-3 text-sm focus:border-[#186FD4] focus:outline-none"
              />
            </div>
          </div>
        )}
      </DrawerModal>

      {/* Add Customer Modal */}
      <CenterModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Новый клиент"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={addCustomer}
              className="rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white"
            >
              Сохранить
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Имя *"
              value={newCustomer.firstName}
              onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2"
            />
            <input
              type="text"
              placeholder="Фамилия"
              value={newCustomer.lastName}
              onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2"
            />
          </div>
          <input
            type="text"
            placeholder="Название компании (для B2B)"
            value={newCustomer.companyName}
            onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Телефон *"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Город"
              value={newCustomer.city}
              onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2"
            />
            <input
              type="text"
              placeholder="Улица, дом"
              value={newCustomer.street}
              onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2"
            />
          </div>
        </div>
      </CenterModal>
    </div>
  );
};
