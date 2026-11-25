import React, { useMemo, useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  Check,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  AdminState,
  Product,
  ProductBadge,
  StockStatus,
} from '../types/admin';
import {
  Badge,
  Card,
  CenterModal,
  DrawerModal,
  PageHeader,
} from '../components/ui/Primitives';
import { calcDiscountPercent, formatNumber, formatRub, uid } from '../utils/format';

interface ProductsPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
  globalQuery: string;
}

const ALL_BADGES: ProductBadge[] = ['хит', 'новинка', 'распродажа'];
const STOCK_OPTIONS: StockStatus[] = ['В наличии', 'Под заказ', 'Нет в наличии'];

export const ProductsPage: React.FC<ProductsPageProps> = ({ state, setState, globalQuery }) => {
  const [catFilter, setCatFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | StockStatus>('all');
  const [badgeFilter, setBadgeFilter] = useState<'all' | ProductBadge>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_desc' | 'price_asc' | 'stock_desc'>('default');
  const [pageSize, setPageSize] = useState<9 | 12 | 18 | 24>(12);
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editorTab, setEditorTab] = useState<'main' | 'pricing' | 'attrs' | 'desc'>('main');
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState(
    'MK-9921;Болгарка Makita GA5030 720W;cat-4;br-makita;6490;7300;40\nCR-CT16;Грунтовка Ceresit CT 16 10л;cat-2;br-ceresit;1890;2100;120'
  );

  const q = globalQuery.trim().toLowerCase();

  const categoryMap = useMemo(
    () => new Map(state.categories.map((c) => [c.id, c.name])),
    [state.categories]
  );
  const brandMap = useMemo(
    () => new Map(state.brands.map((b) => [b.id, b.name])),
    [state.brands]
  );

  const filtered = useMemo(() => {
    const list = state.products.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (brandMap.get(p.brandId) ?? '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (catFilter !== 'all' && p.categoryL1Id !== catFilter && p.categoryL2Id !== catFilter) {
        return false;
      }
      if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;
      if (stockFilter !== 'all' && p.stockStatus !== stockFilter) return false;
      if (badgeFilter !== 'all' && !p.badges.includes(badgeFilter)) return false;
      return true;
    });

    if (sortBy === 'price_desc') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'price_asc') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'stock_desc') return [...list].sort((a, b) => b.stockQty - a.stockQty);
    return list;
  }, [state.products, q, catFilter, brandFilter, stockFilter, badgeFilter, sortBy, brandMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const visibleIds = paginated.map((p) => p.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const bulkSetStock = (status: StockStatus) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, stockStatus: status, stockQty: status === 'Нет в наличии' ? 0 : Math.max(p.stockQty, 10) }
          : p
      ),
    }));
    setSelectedIds([]);
  };

  const bulkAdjustPrice = (percentDelta: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, price: Math.max(1, Math.round(p.price * (1 + percentDelta / 100))) }
          : p
      ),
    }));
    setSelectedIds([]);
  };

  const openNewProduct = () => {
    setIsNew(true);
    setEditorTab('main');
    setEditing({
      id: uid('prd'),
      sku: `ST-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '',
      categoryL1Id: 'cat-4',
      categoryL2Id: 'cat-4-1',
      brandId: state.brands[0]?.id ?? 'br-bosch',
      price: 1990,
      oldPrice: 2490,
      stockQty: 25,
      stockStatus: 'В наличии',
      unit: 'шт.',
      badges: ['новинка'],
      productType: 'Инструмент',
      description: '',
      attributes: [
        { name: 'Тип товара', value: '' },
        { name: 'Материал', value: '' },
      ],
      relatedIds: [],
      isActive: true,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const saveProduct = () => {
    if (!editing || !editing.name.trim() || !editing.sku.trim()) return;
    const saved: Product = {
      ...editing,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setState((prev) => ({
      ...prev,
      products: isNew
        ? [saved, ...prev.products]
        : prev.products.map((p) => (p.id === saved.id ? saved : p)),
      settings: {
        ...prev.settings,
        totalCatalogScale: isNew
          ? prev.settings.totalCatalogScale + 1
          : prev.settings.totalCatalogScale,
      },
    }));
    setEditing(null);
  };

  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const handleCsvExport = () => {
    const header = 'Артикул;Название;Категория;Бренд;Цена;Старая цена;Остаток;Статус\n';
    const rows = filtered
      .map((p) =>
        [
          p.sku,
          `"${p.name.replace(/"/g, '""')}"`,
          categoryMap.get(p.categoryL1Id) ?? '',
          brandMap.get(p.brandId) ?? '',
          p.price,
          p.oldPrice ?? '',
          p.stockQty,
          p.stockStatus,
        ].join(';')
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stroyopttorg_products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const runCsvImport = () => {
    const lines = importText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const newItems: Product[] = lines.map((line) => {
      const [sku, name, catL1, brandId, priceStr, oldPriceStr, qtyStr] = line.split(';');
      const qty = Number(qtyStr) || 10;
      return {
        id: uid('prd'),
        sku: sku?.trim() || `IMP-${Math.floor(Math.random() * 9999)}`,
        name: name?.trim() || 'Новый импортированный товар',
        categoryL1Id: categoryMap.has(catL1?.trim()) ? catL1.trim() : 'cat-4',
        brandId: brandMap.has(brandId?.trim()) ? brandId.trim() : 'br-bosch',
        price: Number(priceStr) || 1000,
        oldPrice: Number(oldPriceStr) || undefined,
        stockQty: qty,
        stockStatus: qty > 0 ? 'В наличии' : 'Нет в наличии',
        unit: 'шт.',
        badges: ['новинка'],
        productType: 'Товар',
        description: 'Позиция добавлена через массовый импорт CSV/YML.',
        attributes: [],
        relatedIds: [],
        isActive: true,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
    });

    if (newItems.length > 0) {
      setState((prev) => ({
        ...prev,
        products: [...newItems, ...prev.products],
        settings: {
          ...prev.settings,
          totalCatalogScale: prev.settings.totalCatalogScale + newItems.length,
        },
      }));
    }
    setImportOpen(false);
  };

  const l1Cats = state.categories.filter((c) => c.level === 1);

  return (
    <div>
      <PageHeader
        title="Управление товарами (SKU)"
        subtitle={`В базе магазина: ${formatNumber(state.settings.totalCatalogScale)} позиций · В витрине: ${state.products.length}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-semibold text-[#102035] hover:bg-slate-50"
            >
              <Upload className="h-4 w-4 text-[#186FD4]" />
              Импорт CSV/YML
            </button>
            <button
              type="button"
              onClick={handleCsvExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-semibold text-[#102035] hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-500" />
              Экспорт
            </button>
            <button
              type="button"
              onClick={openNewProduct}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Plus className="h-4 w-4" />
              Добавить товар
            </button>
          </>
        }
      />

      {/* Filter Bar matching Figma Каталог товаров controls */}
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={catFilter}
            onChange={(e) => {
              setCatFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
          >
            <option value="all">Все категории (Ур. 1)</option>
            {l1Cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
          >
            <option value="all">Все бренды</option>
            {state.brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as 'all' | StockStatus);
              setPage(1);
            }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
          >
            <option value="all">Любое наличие</option>
            {STOCK_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={badgeFilter}
            onChange={(e) => {
              setBadgeFilter(e.target.value as 'all' | ProductBadge);
              setPage(1);
            }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
          >
            <option value="all">Все метки (хит/новинка)</option>
            {ALL_BADGES.map((b) => (
              <option key={b} value={b}>
                Метка: {b}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
          >
            <option value="default">Сортировка: по умолчанию</option>
            <option value="price_desc">Цена по убыванию</option>
            <option value="price_asc">Цена по возрастанию</option>
            <option value="stock_desc">Остаток по убыванию</option>
          </select>
        </div>

        {/* Page size & active filter summary */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>
              Найдено позиций: <strong className="text-[#102035]">{filtered.length}</strong>
            </span>
            {(catFilter !== 'all' ||
              brandFilter !== 'all' ||
              stockFilter !== 'all' ||
              badgeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setCatFilter('all');
                  setBrandFilter('all');
                  setStockFilter('all');
                  setBadgeFilter('all');
                }}
                className="ml-2 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 font-semibold text-[#186FD4]"
              >
                Очистить все <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Показывать по:</span>
            {([9, 12, 18, 24] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => {
                  setPageSize(sz);
                  setPage(1);
                }}
                className={`rounded-md border px-2 py-1 font-semibold transition ${
                  pageSize === sz
                    ? 'border-[#186FD4] bg-blue-50 text-[#186FD4]'
                    : 'border-[#E5E7EB] text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#186FD4]/30 bg-blue-50 px-4 py-2.5 text-sm">
          <span className="font-semibold text-[#102035]">
            Выбрано товаров: {selectedIds.length}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => bulkSetStock('В наличии')}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#1A9C56] border border-emerald-200 hover:bg-emerald-50"
            >
              В наличии
            </button>
            <button
              type="button"
              onClick={() => bulkSetStock('Нет в наличии')}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#E11D48] border border-rose-200 hover:bg-rose-50"
            >
              Нет в наличии
            </button>
            <button
              type="button"
              onClick={() => bulkAdjustPrice(5)}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#102035] border border-[#E5E7EB] hover:bg-slate-50"
            >
              Цена +5%
            </button>
            <button
              type="button"
              onClick={() => bulkAdjustPrice(-10)}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#102035] border border-[#E5E7EB] hover:bg-slate-50"
            >
              Скидка -10%
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Снять выбор
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      paginated.length > 0 && paginated.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-[#186FD4]"
                  />
                </th>
                <th className="px-4 py-3">Артикул / Товар</th>
                <th className="px-4 py-3">Категория / Бренд</th>
                <th className="px-4 py-3">Метки</th>
                <th className="px-4 py-3">Наличие</th>
                <th className="px-4 py-3 text-right">Цена</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginated.map((p) => {
                const disc = calcDiscountPercent(p.price, p.oldPrice);
                return (
                  <tr key={p.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="h-4 w-4 accent-[#186FD4]"
                      />
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="text-[11px] font-mono text-slate-400">
                        Артикул: {p.sku}
                      </div>
                      <div className="font-semibold text-[#102035]">{p.name}</div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        Характеристик: {p.attributes.length}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium text-[#111827]">
                        {categoryMap.get(p.categoryL1Id) ?? '—'}
                      </div>
                      <div className="mt-0.5 text-slate-500">
                        Бренд: <strong>{brandMap.get(p.brandId) ?? '—'}</strong>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.badges.map((b) => (
                          <Badge
                            key={b}
                            variant={b === 'хит' ? 'amber' : b === 'новинка' ? 'green' : 'red'}
                          >
                            {b}
                          </Badge>
                        ))}
                        {disc && <Badge variant="green">-{disc}%</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          p.stockStatus === 'В наличии'
                            ? 'green'
                            : p.stockStatus === 'Под заказ'
                            ? 'amber'
                            : 'red'
                        }
                      >
                        {p.stockStatus}
                      </Badge>
                      <div className="mt-1 text-xs text-slate-500 tabular-nums">
                        {p.stockQty} {p.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                      <div className="font-bold text-[#102035]">{formatRub(p.price)}</div>
                      {p.oldPrice && (
                        <div className="text-xs text-slate-400 line-through">
                          {formatRub(p.oldPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNew(false);
                            setEditorTab('main');
                            setEditing({ ...p, attributes: p.attributes.map((a) => ({ ...a })) });
                          }}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-blue-50 hover:text-[#186FD4]"
                          title="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-[#E11D48]"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-xs">
            <span className="text-slate-500">
              Страница {currentPage} из {totalPages}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-md font-semibold ${
                    n === currentPage
                      ? 'bg-[#102035] text-white'
                      : 'border border-[#E5E7EB] bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Product Editor Drawer */}
      <DrawerModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? 'Новый товар' : `Товар ${editing?.sku ?? ''}`}
        subtitle={editing?.name || 'Карточка товара — СтройОптТорг'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveProduct}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Check className="h-4 w-4" />
              Сохранить товар
            </button>
          </>
        }
      >
        {editing && (
          <div>
            <div className="mb-4 flex flex-wrap gap-1.5 border-b border-[#E5E7EB] pb-3">
              {(
                [
                  ['main', 'Основное'],
                  ['pricing', 'Цены и склад'],
                  ['attrs', `Характеристики (${editing.attributes.length})`],
                  ['desc', 'Описание'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEditorTab(id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    editorTab === id
                      ? 'bg-[#186FD4] text-white'
                      : 'bg-[#F5F7FA] text-slate-600 hover:text-[#102035]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {editorTab === 'main' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102035]">
                    Наименование товара *
                  </label>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                    placeholder="Перфоратор универсальный Wander X645-46 GF 1450W"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Артикул *</label>
                    <input
                      type="text"
                      value={editing.sku}
                      onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono text-sm focus:border-[#186FD4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Тип товара</label>
                    <input
                      type="text"
                      value={editing.productType}
                      onChange={(e) => setEditing({ ...editing, productType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                      placeholder="Набор / Инструмент"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">
                      Категория (Ур. 1)
                    </label>
                    <select
                      value={editing.categoryL1Id}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          categoryL1Id: e.target.value,
                          categoryL2Id: undefined,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                    >
                      {l1Cats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Бренд</label>
                    <select
                      value={editing.brandId}
                      onChange={(e) => setEditing({ ...editing, brandId: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                    >
                      {state.brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#102035] mb-1.5">
                    Маркетинговые метки (бейджи)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BADGES.map((b) => {
                      const active = editing.badges.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              badges: active
                                ? editing.badges.filter((x) => x !== b)
                                : [...editing.badges, b],
                            })
                          }
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? 'border-[#186FD4] bg-blue-50 text-[#186FD4]'
                              : 'border-[#E5E7EB] text-slate-600'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {editorTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Цена (₽) *</label>
                    <input
                      type="number"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({ ...editing, price: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-bold focus:border-[#186FD4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">
                      Старая цена (₽)
                    </label>
                    <input
                      type="number"
                      value={editing.oldPrice ?? ''}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          oldPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                      placeholder="Не указана"
                    />
                  </div>
                </div>

                {calcDiscountPercent(editing.price, editing.oldPrice) && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#1A9C56]">
                    На витрине будет показан бейдж скидки: -{calcDiscountPercent(editing.price, editing.oldPrice)}%
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Статус наличия</label>
                    <select
                      value={editing.stockStatus}
                      onChange={(e) =>
                        setEditing({ ...editing, stockStatus: e.target.value as StockStatus })
                      }
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                    >
                      {STOCK_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Остаток</label>
                    <input
                      type="number"
                      value={editing.stockQty}
                      onChange={(e) =>
                        setEditing({ ...editing, stockQty: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102035]">Ед. изм.</label>
                    <input
                      type="text"
                      value={editing.unit}
                      onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {editorTab === 'attrs' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Технические характеристики отображаются на вкладке «О товаре» и участвуют в фильтрации каталога.
                </p>
                {editing.attributes.map((attr, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => {
                        const next = [...editing.attributes];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setEditing({ ...editing, attributes: next });
                      }}
                      placeholder="Параметр (Мощность, Вт)"
                      className="w-1/2 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm focus:border-[#186FD4] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => {
                        const next = [...editing.attributes];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setEditing({ ...editing, attributes: next });
                      }}
                      placeholder="Значение (1450 Вт)"
                      className="w-1/2 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm focus:border-[#186FD4] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          attributes: editing.attributes.filter((_, i) => i !== idx),
                        })
                      }
                      className="rounded p-1.5 text-slate-400 hover:text-[#E11D48]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      attributes: [...editing.attributes, { name: '', value: '' }],
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#186FD4] px-3 py-1.5 text-xs font-semibold text-[#186FD4]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Добавить характеристику
                </button>
              </div>
            )}

            {editorTab === 'desc' && (
              <div>
                <label className="block text-xs font-semibold text-[#102035]">
                  Полное описание товара (вкладка «О товаре»)
                </label>
                <textarea
                  rows={7}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                />
              </div>
            )}
          </div>
        )}
      </DrawerModal>

      {/* Bulk CSV/YML Import Modal */}
      <CenterModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Массовый импорт позиций (CSV / прайс-лист 1С)"
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={runCsvImport}
              className="rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              Загрузить в каталог
            </button>
          </>
        }
      >
        <p className="mb-2 text-xs text-slate-500">
          Формат строки: <code>Артикул;Название;ID_категории;ID_бренда;Цена;СтараяЦена;Остаток</code>
        </p>
        <textarea
          rows={6}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          className="w-full rounded-lg border border-[#E5E7EB] p-3 font-mono text-xs focus:border-[#186FD4] focus:outline-none"
        />
      </CenterModal>
    </div>
  );
};
