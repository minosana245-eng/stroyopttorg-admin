import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Pencil,
  Trash2,
  Award,
  Plus,
  Layers,
  Check,
} from 'lucide-react';
import { AdminState, Brand, CategoryNode } from '../types/admin';
import { Badge, Card, CenterModal, DrawerModal, PageHeader } from '../components/ui/Primitives';
import { formatNumber, uid } from '../utils/format';

interface CatalogPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
  globalQuery: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ state, setState, globalQuery }) => {
  const [tab, setTab] = useState<'categories' | 'brands'>('categories');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'cat-4': true,
    'cat-4-1': true,
  });

  // Category editor drawer state
  const [editingCat, setEditingCat] = useState<CategoryNode | null>(null);
  const [isNewCat, setIsNewCat] = useState(false);

  // Brand modal state
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isNewBrand, setIsNewBrand] = useState(false);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const q = globalQuery.trim().toLowerCase();

  const l1Categories = useMemo(() => {
    return state.categories
      .filter((c) => c.level === 1)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((c) => {
        if (!q) return true;
        if (c.name.toLowerCase().includes(q)) return true;
        const children = state.categories.filter(
          (ch) => ch.parentId === c.id || state.categories.some((l2) => l2.parentId === c.id && ch.parentId === l2.id)
        );
        return children.some((ch) => ch.name.toLowerCase().includes(q));
      });
  }, [state.categories, q]);

  const getChildren = (parentId: string) =>
    state.categories
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  const openNewCategory = (level: 1 | 2 | 3, parentId: string | null) => {
    setIsNewCat(true);
    setEditingCat({
      id: uid('cat'),
      name: '',
      slug: '',
      level,
      parentId,
      skuCount: 0,
      sortOrder: state.categories.filter((c) => c.parentId === parentId).length + 1,
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      filterAttributes: ['Цена', 'Бренд', 'Тип товара'],
    });
  };

  const saveCategory = () => {
    if (!editingCat || !editingCat.name.trim()) return;
    const normalized: CategoryNode = {
      ...editingCat,
      slug:
        editingCat.slug.trim() ||
        editingCat.name
          .toLowerCase()
          .replace(/[^a-zа-яё0-9]+/gi, '-')
          .replace(/^-|-$/g, ''),
    };

    setState((prev) => ({
      ...prev,
      categories: isNewCat
        ? [...prev.categories, normalized]
        : prev.categories.map((c) => (c.id === normalized.id ? normalized : c)),
    }));
    if (normalized.parentId) {
      setExpanded((prev) => ({ ...prev, [normalized.parentId!]: true }));
    }
    setEditingCat(null);
  };

  const deleteCategory = (id: string) => {
    const collectIds = (rootId: string): string[] => {
      const direct = state.categories.filter((c) => c.parentId === rootId).map((c) => c.id);
      return [rootId, ...direct.flatMap(collectIds)];
    };
    const toRemove = new Set(collectIds(id));
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => !toRemove.has(c.id)),
    }));
  };

  const openNewBrand = () => {
    setIsNewBrand(true);
    setEditingBrand({
      id: uid('br'),
      name: '',
      country: 'Россия',
      productCount: 0,
      isPopular: false,
      isActive: true,
    });
  };

  const saveBrand = () => {
    if (!editingBrand || !editingBrand.name.trim()) return;
    setState((prev) => ({
      ...prev,
      brands: isNewBrand
        ? [...prev.brands, editingBrand]
        : prev.brands.map((b) => (b.id === editingBrand.id ? editingBrand : b)),
    }));
    setEditingBrand(null);
  };

  const deleteBrand = (id: string) => {
    setState((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b.id !== id),
    }));
  };

  const filteredBrands = state.brands.filter(
    (b) => !q || b.name.toLowerCase().includes(q) || b.country.toLowerCase().includes(q)
  );

  const renderCategoryRow = (cat: CategoryNode, depth: number) => {
    const children = getChildren(cat.id);
    const isExp = !!expanded[cat.id];

    return (
      <React.Fragment key={cat.id}>
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3 transition hover:bg-slate-50 ${
            depth === 0 ? 'bg-white' : depth === 1 ? 'bg-slate-50/60' : 'bg-slate-50/30'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
            {children.length > 0 ? (
              <button
                type="button"
                onClick={() => toggleExpand(cat.id)}
                className="rounded p-1 text-slate-500 hover:bg-slate-200/70"
              >
                {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="inline-block w-6 text-center text-slate-300">•</span>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm ${depth === 0 ? 'font-bold text-[#102035]' : 'font-medium text-[#111827]'}`}>
                  {cat.name}
                </span>
                <Badge variant={cat.level === 1 ? 'navy' : cat.level === 2 ? 'blue' : 'gray'}>
                  Ур. {cat.level}
                </Badge>
                {!cat.isActive && <Badge variant="red">Скрыта</Badge>}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>/{cat.slug}</span>
                <span>Фильтры: {cat.filterAttributes.join(', ') || '—'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-md bg-[#F5F7FA] px-2.5 py-1 text-xs font-semibold text-[#102035] tabular-nums">
              {formatNumber(cat.skuCount)} SKU
            </span>

            {cat.level < 3 && (
              <button
                type="button"
                onClick={() => openNewCategory((cat.level + 1) as 2 | 3, cat.id)}
                className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#186FD4] hover:border-[#186FD4]"
                title="Добавить подкатегорию"
              >
                <Plus className="h-3.5 w-3.5" />
                Подкатегория
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsNewCat(false);
                setEditingCat({ ...cat });
              }}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-[#186FD4]"
              title="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => deleteCategory(cat.id)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-[#E11D48]"
              title="Удалить категорию"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExp && children.map((child) => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div>
      <PageHeader
        title="Каталог и бренды (Мегаменю)"
        subtitle="3-уровневая структура категорий и фильтров каталога СтройОптТорг"
        actions={
          tab === 'categories' ? (
            <button
              type="button"
              onClick={() => openNewCategory(1, null)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#145BB0]"
            >
              <FolderPlus className="h-4 w-4" />
              Новая категория (Ур. 1)
            </button>
          ) : (
            <button
              type="button"
              onClick={openNewBrand}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#145BB0]"
            >
              <Plus className="h-4 w-4" />
              Добавить бренд
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-2 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab('categories')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'categories'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500 hover:text-[#102035]'
          }`}
        >
          <Layers className="h-4 w-4" />
          Дерево категорий ({state.categories.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('brands')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            tab === 'brands'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500 hover:text-[#102035]'
          }`}
        >
          <Award className="h-4 w-4" />
          Бренды ({state.brands.length})
        </button>
      </div>

      {tab === 'categories' ? (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F5F7FA] px-4 py-2.5 text-xs font-semibold uppercase text-slate-500">
            <span>Раздел мегаменю / Slug / Активные фильтры</span>
            <span>Товары и действия</span>
          </div>
          <div>{l1Categories.map((cat) => renderCategoryRow(cat, 0))}</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#102035]">{brand.name}</h3>
                    {brand.isPopular && <Badge variant="amber">Популярный</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Страна: {brand.country}</p>
                </div>
                <Badge variant={brand.isActive ? 'green' : 'gray'}>
                  {brand.isActive ? 'Активен' : 'Скрыт'}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs">
                <span className="font-semibold text-slate-600 tabular-nums">
                  {formatNumber(brand.productCount)} товаров
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewBrand(false);
                      setEditingBrand({ ...brand });
                    }}
                    className="rounded-md px-2.5 py-1 font-medium text-[#186FD4] hover:bg-blue-50"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBrand(brand.id)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-[#E11D48]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Category Drawer */}
      <DrawerModal
        open={!!editingCat}
        onClose={() => setEditingCat(null)}
        title={isNewCat ? 'Новая категория каталога' : 'Редактирование категории'}
        subtitle={editingCat ? `Уровень ${editingCat.level} · Мегаменю` : undefined}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingCat(null)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveCategory}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Check className="h-4 w-4" />
              Сохранить
            </button>
          </>
        }
      >
        {editingCat && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#102035]">Название категории *</label>
              <input
                type="text"
                value={editingCat.name}
                onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                placeholder="Например: Перфораторы"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#102035]">URL-код (slug)</label>
                <input
                  type="text"
                  value={editingCat.slug}
                  onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                  placeholder="perforatory"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#102035]">Кол-во SKU</label>
                <input
                  type="number"
                  value={editingCat.skuCount}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, skuCount: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102035]">
                Атрибуты боковых фильтров (через запятую)
              </label>
              <input
                type="text"
                value={editingCat.filterAttributes.join(', ')}
                onChange={(e) =>
                  setEditingCat({
                    ...editingCat,
                    filterAttributes: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                placeholder="Цена, Тип товара, Бренд, Мощность (Вт)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102035]">SEO-заголовок страницы</label>
              <input
                type="text"
                value={editingCat.seoTitle ?? ''}
                onChange={(e) => setEditingCat({ ...editingCat, seoTitle: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102035]">SEO-описание под каталогом</label>
              <textarea
                rows={3}
                value={editingCat.seoDescription ?? ''}
                onChange={(e) => setEditingCat({ ...editingCat, seoDescription: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-[#102035]">
              <input
                type="checkbox"
                checked={editingCat.isActive}
                onChange={(e) => setEditingCat({ ...editingCat, isActive: e.target.checked })}
                className="h-4 w-4 accent-[#186FD4]"
              />
              Отображать категорию в мегаменю и на сайте
            </label>
          </div>
        )}
      </DrawerModal>

      {/* Brand Modal */}
      <CenterModal
        open={!!editingBrand}
        onClose={() => setEditingBrand(null)}
        title={isNewBrand ? 'Добавить бренд' : 'Редактировать бренд'}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingBrand(null)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveBrand}
              className="rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              Сохранить
            </button>
          </>
        }
      >
        {editingBrand && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#102035]">Название бренда *</label>
              <input
                type="text"
                value={editingBrand.name}
                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                placeholder="BOSCH"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#102035]">Страна</label>
                <input
                  type="text"
                  value={editingBrand.country}
                  onChange={(e) => setEditingBrand({ ...editingBrand, country: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#102035]">Товаров</label>
                <input
                  type="number"
                  value={editingBrand.productCount}
                  onChange={(e) =>
                    setEditingBrand({ ...editingBrand, productCount: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-5 pt-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingBrand.isPopular}
                  onChange={(e) => setEditingBrand({ ...editingBrand, isPopular: e.target.checked })}
                  className="h-4 w-4 accent-[#186FD4]"
                />
                Популярный на главной
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingBrand.isActive}
                  onChange={(e) => setEditingBrand({ ...editingBrand, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[#186FD4]"
                />
                Активен
              </label>
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
};
