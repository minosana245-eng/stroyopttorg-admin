import React, { useState } from 'react';
import { Percent, Plus, Sparkles, Tag, Trash2, Calculator } from 'lucide-react';
import { AdminState, CampaignBanner, PromoCode } from '../types/admin';
import { Badge, Card, CenterModal, PageHeader } from '../components/ui/Primitives';
import { formatDateRu, formatRub, uid } from '../utils/format';

interface PromosPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
}

export const PromosPage: React.FC<PromosPageProps> = ({ state, setState }) => {
  const [tab, setTab] = useState<'codes' | 'tiers' | 'campaigns'>('codes');

  // Cart discount simulator matching Figma "Корзина - скидки за промо и сумму"
  const [simCartSum, setSimCartSum] = useState(19829);
  const [simPromoInput, setSimPromoInput] = useState('DCSDGRGJ6734G');

  // New promo modal
  const [promoModal, setPromoModal] = useState<PromoCode | null>(null);
  const [campaignModal, setCampaignModal] = useState<CampaignBanner | null>(null);

  const sortedTiers = [...state.discountTiers].sort((a, b) => a.minAmount - b.minAmount);
  const activeTiers = sortedTiers.filter((t) => t.isActive);
  const currentTier = [...activeTiers].reverse().find((t) => simCartSum >= t.minAmount);
  const nextTier = activeTiers.find((t) => simCartSum < t.minAmount);

  const matchedPromo = state.promoCodes.find(
    (p) => p.isActive && p.code.toUpperCase() === simPromoInput.trim().toUpperCase()
  );
  const tierDiscountAmt = currentTier
    ? Math.round((simCartSum * currentTier.discountPercent) / 100)
    : 0;
  const promoDiscountAmt =
    matchedPromo && simCartSum >= matchedPromo.minOrderSum
      ? matchedPromo.discountType === 'fixed'
        ? matchedPromo.discountValue
        : Math.round((simCartSum * matchedPromo.discountValue) / 100)
      : 0;
  const finalSimTotal = Math.max(0, simCartSum - tierDiscountAmt - promoDiscountAmt);

  const savePromo = () => {
    if (!promoModal || !promoModal.code.trim()) return;
    setState((prev) => {
      const exists = prev.promoCodes.some((p) => p.id === promoModal.id);
      return {
        ...prev,
        promoCodes: exists
          ? prev.promoCodes.map((p) => (p.id === promoModal.id ? promoModal : p))
          : [promoModal, ...prev.promoCodes],
      };
    });
    setPromoModal(null);
  };

  const saveCampaign = () => {
    if (!campaignModal || !campaignModal.title.trim()) return;
    setState((prev) => {
      const exists = prev.campaigns.some((c) => c.id === campaignModal.id);
      return {
        ...prev,
        campaigns: exists
          ? prev.campaigns.map((c) => (c.id === campaignModal.id ? campaignModal : c))
          : [campaignModal, ...prev.campaigns],
      };
    });
    setCampaignModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Скидки, промокоды и акции"
        subtitle="Управление движком двойных скидок: промокоды + шкала скидок от суммы корзины"
        actions={
          tab === 'codes' ? (
            <button
              type="button"
              onClick={() =>
                setPromoModal({
                  id: uid('prm'),
                  code: '',
                  discountType: 'fixed',
                  discountValue: 500,
                  minOrderSum: 5000,
                  validUntil: '2026-12-31',
                  usageCount: 0,
                  usageLimit: 100,
                  isActive: true,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Plus className="h-4 w-4" />
              Новый промокод
            </button>
          ) : tab === 'campaigns' ? (
            <button
              type="button"
              onClick={() =>
                setCampaignModal({
                  id: uid('cmp'),
                  title: '',
                  type: 'АКЦИЯ',
                  subtitle: '',
                  validUntil: '2026-12-31',
                  ctaText: 'ПЕРЕЙТИ К ТОВАРАМ',
                  isActive: true,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Plus className="h-4 w-4" />
              Новая акция / слайд
            </button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab('codes')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'codes'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500'
          }`}
        >
          <Tag className="h-4 w-4" />
          Промокоды ({state.promoCodes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('tiers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'tiers'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500'
          }`}
        >
          <Percent className="h-4 w-4" />
          Скидки от суммы корзины ({state.discountTiers.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('campaigns')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'campaigns'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Акции и слайдер ({state.campaigns.length})
        </button>
      </div>

      {tab === 'codes' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Промокод</th>
                  <th className="px-4 py-3">Скидка</th>
                  <th className="px-4 py-3">Мин. сумма</th>
                  <th className="px-4 py-3">Действует до</th>
                  <th className="px-4 py-3">Использовано</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {state.promoCodes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-[#102035]">{p.code}</div>
                      {p.campaignTitle && (
                        <div className="text-xs text-slate-500">{p.campaignTitle}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1A9C56] tabular-nums">
                      {p.discountType === 'fixed'
                        ? formatRub(p.discountValue)
                        : `${p.discountValue}%`}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-xs">
                      от {formatRub(p.minOrderSum)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDateRu(p.validUntil)}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      {p.usageCount} / {p.usageLimit}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            promoCodes: prev.promoCodes.map((x) =>
                              x.id === p.id ? { ...x, isActive: !x.isActive } : x
                            ),
                          }))
                        }
                      >
                        <Badge variant={p.isActive ? 'green' : 'gray'}>
                          {p.isActive ? 'Активен' : 'Отключен'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            promoCodes: prev.promoCodes.filter((x) => x.id !== p.id),
                          }))
                        }
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-[#E11D48]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'tiers' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#102035]">
                  Пороги накопительной скидки
                </h2>
                <p className="text-xs text-slate-500">
                  Отображаются в прогресс-баре в корзине покупателя
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    discountTiers: [
                      ...prev.discountTiers,
                      {
                        id: uid('tier'),
                        minAmount: 75000,
                        discountPercent: 18,
                        label: 'Крупный опт от 75 000 ₽',
                        isActive: true,
                      },
                    ],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#186FD4] px-3 py-1.5 text-xs font-semibold text-[#186FD4]"
              >
                <Plus className="h-3.5 w-3.5" />
                Добавить порог
              </button>
            </div>

            <div className="space-y-3">
              {sortedTiers.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-3"
                >
                  <input
                    type="number"
                    value={t.minAmount}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        discountTiers: prev.discountTiers.map((x) =>
                          x.id === t.id ? { ...x, minAmount: Number(e.target.value) || 0 } : x
                        ),
                      }))
                    }
                    className="w-28 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-sm font-bold tabular-nums"
                  />
                  <span className="text-xs text-slate-500">₽ →</span>
                  <input
                    type="number"
                    value={t.discountPercent}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        discountTiers: prev.discountTiers.map((x) =>
                          x.id === t.id ? { ...x, discountPercent: Number(e.target.value) || 0 } : x
                        ),
                      }))
                    }
                    className="w-16 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-sm font-bold text-[#1A9C56] tabular-nums"
                  />
                  <span className="text-xs font-semibold text-[#1A9C56]">%</span>
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        discountTiers: prev.discountTiers.map((x) =>
                          x.id === t.id ? { ...x, label: e.target.value } : x
                        ),
                      }))
                    }
                    className="min-w-[140px] flex-1 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        discountTiers: prev.discountTiers.filter((x) => x.id !== t.id),
                      }))
                    }
                    className="rounded p-1.5 text-slate-400 hover:text-[#E11D48]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Live Cart Simulator */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#186FD4]" />
              <div>
                <h2 className="text-base font-bold text-[#102035]">
                  Симулятор расчёта корзины (как на сайте)
                </h2>
                <p className="text-xs text-slate-500">
                  Проверка совместного действия промокода и шкалы суммы
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold">Сумма товаров в корзине (₽)</label>
                <input
                  type="number"
                  value={simCartSum}
                  onChange={(e) => setSimCartSum(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Промокод</label>
                <input
                  type="text"
                  value={simPromoInput}
                  onChange={(e) => setSimPromoInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>

            {nextTier && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3.5 text-xs">
                <div className="flex justify-between font-semibold text-[#102035] mb-1.5">
                  <span>Прогресс до следующей скидки {nextTier.discountPercent}%</span>
                  <span className="tabular-nums">
                    {formatRub(simCartSum)} / {formatRub(nextTier.minAmount)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#186FD4]"
                    style={{
                      width: `${Math.min(100, Math.round((simCartSum / nextTier.minAmount) * 100))}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-slate-600">
                  Добавьте еще товаров на{' '}
                  <strong className="text-[#102035]">
                    {formatRub(nextTier.minAmount - simCartSum)}
                  </strong>{' '}
                  и получите скидку <strong>{nextTier.discountPercent}%</strong>
                </p>
              </div>
            )}

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F7FA] p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Скидка по промокоду</span>
                <span className="font-semibold text-[#1A9C56] tabular-nums">
                  {promoDiscountAmt > 0 ? `-${formatRub(promoDiscountAmt)}` : '0 ₽'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Скидка от суммы заказа ({currentTier ? `${currentTier.discountPercent}%` : '0%'})
                </span>
                <span className="font-semibold text-[#1A9C56] tabular-nums">
                  -{formatRub(tierDiscountAmt)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold text-[#102035]">
                <span>Итого</span>
                <span className="tabular-nums">{formatRub(finalSimTotal)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'campaigns' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.campaigns.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={c.type === 'АКЦИЯ' ? 'green' : 'blue'}>{c.type}</Badge>
                  <Badge variant={c.isActive ? 'navy' : 'gray'}>
                    {c.isActive ? 'На сайте' : 'Скрыта'}
                  </Badge>
                </div>
                <h3 className="mt-3 text-base font-bold text-[#102035]">{c.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600">{c.subtitle}</p>
                {c.promoCode && (
                  <div className="mt-3 inline-block rounded bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-[#1A9C56]">
                    Промокод: {c.promoCode}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs">
                <span className="text-slate-400">До {formatDateRu(c.validUntil)}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        campaigns: prev.campaigns.map((x) =>
                          x.id === c.id ? { ...x, isActive: !x.isActive } : x
                        ),
                      }))
                    }
                    className="font-semibold text-[#186FD4]"
                  >
                    {c.isActive ? 'Скрыть' : 'Включить'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        campaigns: prev.campaigns.filter((x) => x.id !== c.id),
                      }))
                    }
                    className="text-slate-400 hover:text-[#E11D48]"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Promo Modal */}
      <CenterModal
        open={!!promoModal}
        onClose={() => setPromoModal(null)}
        title="Создать промокод"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPromoModal(null)}
              className="rounded-lg border border-[#E5E7EB] px-3.5 py-1.5 text-sm"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={savePromo}
              className="rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white"
            >
              Сохранить
            </button>
          </>
        }
      >
        {promoModal && (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold">Код промокода *</label>
              <input
                type="text"
                value={promoModal.code}
                onChange={(e) =>
                  setPromoModal({ ...promoModal, code: e.target.value.toUpperCase() })
                }
                placeholder="STROY2026"
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold">Тип скидки</label>
                <select
                  value={promoModal.discountType}
                  onChange={(e) =>
                    setPromoModal({
                      ...promoModal,
                      discountType: e.target.value as 'fixed' | 'percent',
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2"
                >
                  <option value="fixed">Фиксированная (₽)</option>
                  <option value="percent">Процент (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold">Размер скидки</label>
                <input
                  type="number"
                  value={promoModal.discountValue}
                  onChange={(e) =>
                    setPromoModal({ ...promoModal, discountValue: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold">Мин. сумма (₽)</label>
                <input
                  type="number"
                  value={promoModal.minOrderSum}
                  onChange={(e) =>
                    setPromoModal({ ...promoModal, minOrderSum: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold">Действует до</label>
                <input
                  type="date"
                  value={promoModal.validUntil}
                  onChange={(e) => setPromoModal({ ...promoModal, validUntil: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}
      </CenterModal>

      {/* New Campaign Modal */}
      <CenterModal
        open={!!campaignModal}
        onClose={() => setCampaignModal(null)}
        title="Добавить акцию или баннер"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCampaignModal(null)}
              className="rounded-lg border border-[#E5E7EB] px-3.5 py-1.5 text-sm"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveCampaign}
              className="rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white"
            >
              Сохранить
            </button>
          </>
        }
      >
        {campaignModal && (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold">Заголовок *</label>
              <input
                type="text"
                value={campaignModal.title}
                onChange={(e) => setCampaignModal({ ...campaignModal, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold">Описание</label>
              <textarea
                rows={3}
                value={campaignModal.subtitle}
                onChange={(e) => setCampaignModal({ ...campaignModal, subtitle: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold">Тип</label>
                <select
                  value={campaignModal.type}
                  onChange={(e) =>
                    setCampaignModal({
                      ...campaignModal,
                      type: e.target.value as 'АКЦИЯ' | 'СЛАЙДЕР',
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2"
                >
                  <option value="АКЦИЯ">АКЦИЯ</option>
                  <option value="СЛАЙДЕР">СЛАЙДЕР (Главная)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold">Промокод (необязательно)</label>
                <input
                  type="text"
                  value={campaignModal.promoCode ?? ''}
                  onChange={(e) =>
                    setCampaignModal({ ...campaignModal, promoCode: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
};
