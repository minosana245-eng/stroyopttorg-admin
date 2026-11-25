import React, { useState } from 'react';
import { Building, Check, CreditCard, MapPin, Plus, Truck, X } from 'lucide-react';
import { AdminState, PaymentMethod } from '../types/admin';
import { Card, PageHeader } from '../components/ui/Primitives';

interface SettingsPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ state, setState }) => {
  const [form, setForm] = useState(state.settings);
  const [cityInput, setCityInput] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setState((prev) => ({ ...prev, settings: form }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const addCity = () => {
    const c = cityInput.trim();
    if (!c || form.activeCities.includes(c)) return;
    setForm({ ...form, activeCities: [...form.activeCities, c] });
    setCityInput('');
  };

  const togglePayment = (method: PaymentMethod) => {
    setForm({
      ...form,
      paymentMethodsEnabled: {
        ...form.paymentMethodsEnabled,
        [method]: !form.paymentMethodsEnabled[method],
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Настройки магазина и реквизиты"
        subtitle="Юридические реквизиты ООО «Стройоптторг», логистика СДЭК, самовывоз и способы оплаты"
        actions={
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
          >
            <Check className="h-4 w-4" />
            Сохранить настройки
          </button>
        }
      />

      {savedNotice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#1A9C56]">
          Настройки магазина успешно сохранены!
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Legal & Bank Requisites */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Building className="h-5 w-5 text-[#186FD4]" />
            <h2 className="text-base font-bold text-[#102035]">
              Юридические и банковские реквизиты
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Наименование организации
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">ИНН</label>
                <input
                  type="text"
                  value={form.inn}
                  onChange={(e) => setForm({ ...form, inn: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">КПП</label>
                <input
                  type="text"
                  value={form.kpp}
                  onChange={(e) => setForm({ ...form, kpp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Расчетный счет (р/с)</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Банк</label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">БИК</label>
                <input
                  type="text"
                  value={form.bik}
                  onChange={(e) => setForm({ ...form, bik: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Contacts & Warehouse */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <MapPin className="h-5 w-5 text-[#EE3F22]" />
            <h2 className="text-base font-bold text-[#102035]">Контакты, склад и масштаб</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Телефон</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">График работы</label>
              <input
                type="text"
                value={form.workHours}
                onChange={(e) => setForm({ ...form, workHours: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Адрес магазина и пункта самовывоза
              </label>
              <input
                type="text"
                value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Площадь склада</label>
                <input
                  type="text"
                  value={form.warehouseArea}
                  onChange={(e) => setForm({ ...form, warehouseArea: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Позиций в базе (SKU)
                </label>
                <input
                  type="number"
                  value={form.totalCatalogScale}
                  onChange={(e) =>
                    setForm({ ...form, totalCatalogScale: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-bold"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Delivery & Cities */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Truck className="h-5 w-5 text-[#1A9C56]" />
            <h2 className="text-base font-bold text-[#102035]">Способы доставки и города</h2>
          </div>

          <div className="space-y-2.5 text-sm">
            <label className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-3">
              <span className="font-medium">Самовывоз со склада ({form.pickupAddress})</span>
              <input
                type="checkbox"
                checked={form.pickupAvailable}
                onChange={(e) => setForm({ ...form, pickupAvailable: e.target.checked })}
                className="h-4 w-4 accent-[#186FD4]"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-3">
              <span className="font-medium">Интеграция СДЭК (Курьер и ПВЗ)</span>
              <input
                type="checkbox"
                checked={form.cdekEnabled}
                onChange={(e) => setForm({ ...form, cdekEnabled: e.target.checked })}
                className="h-4 w-4 accent-[#186FD4]"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-3">
              <span className="font-medium">Доставка транспортом магазина</span>
              <input
                type="checkbox"
                checked={form.storeDeliveryEnabled}
                onChange={(e) => setForm({ ...form, storeDeliveryEnabled: e.target.checked })}
                className="h-4 w-4 accent-[#186FD4]"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Активные города доставки
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {form.activeCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F5F7FA] border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#102035]"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        activeCities: form.activeCities.filter((c) => c !== city),
                      })
                    }
                    className="text-slate-400 hover:text-[#E11D48]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Добавить город..."
                className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={addCity}
                className="inline-flex items-center gap-1 rounded-lg border border-[#186FD4] px-3 py-1.5 text-xs font-semibold text-[#186FD4]"
              >
                <Plus className="h-3.5 w-3.5" /> Добавить
              </button>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <CreditCard className="h-5 w-5 text-[#186FD4]" />
            <h2 className="text-base font-bold text-[#102035]">Способы оплаты при оформлении</h2>
          </div>

          <div className="space-y-2.5 text-sm">
            {(Object.keys(form.paymentMethodsEnabled) as PaymentMethod[]).map((method) => (
              <label
                key={method}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] p-3"
              >
                <div>
                  <div className="font-semibold text-[#102035]">{method}</div>
                  <div className="text-xs text-slate-400">
                    {method === 'Картой на сайте'
                      ? 'VISA, Mastercard, МИР, Сбер, Халва, Tinkoff'
                      : method === 'Кредит от ОТП банка'
                      ? 'Онлайн-заявка при оформлении заказа'
                      : 'Рассрочка / кредит от Сбера'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.paymentMethodsEnabled[method]}
                  onChange={() => togglePayment(method)}
                  className="h-4 w-4 accent-[#186FD4]"
                />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
