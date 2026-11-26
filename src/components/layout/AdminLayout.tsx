import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  ShoppingCart,
  Users,
  Percent,
  FileText,
  PhoneCall,
  Settings,
  Search,
  Menu,
  X,
  RotateCcw,
  LogOut,
  LogIn,
  RefreshCw,
  ExternalLink,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { AdminSection, AdminState } from '../../types/admin';
import { AuthSession } from '../../api/client';
import { BrandLogo } from '../ui/BrandLogo';

interface AdminLayoutProps {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  globalQuery: string;
  onGlobalQueryChange: (q: string) => void;
  state: AdminState;
  authSession: AuthSession | null;
  apiConnected: boolean | null;
  isSyncing: boolean;
  syncError: string | null;
  onSyncApi: () => void;
  onResetSeed: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
  badgeCount?: number;
  badgeColor?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeSection,
  onNavigate,
  globalQuery,
  onGlobalQueryChange,
  state,
  authSession,
  apiConnected,
  isSyncing,
  syncError,
  onSyncApi,
  onResetSeed,
  onOpenLogin,
  onLogout,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingOrders = state.orders.filter((o) => o.status === 'ОБРАБОТКА').length;
  const newCallbacks = state.callbacks.filter((c) => c.status === 'Новый').length;
  const pendingReviews = state.reviews.filter((r) => r.status === 'На модерации').length;

  const navGroups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Аналитика',
      items: [
        {
          id: 'dashboard',
          label: 'Дашборд',
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Ассортимент',
      items: [
        {
          id: 'catalog',
          label: 'Каталог и бренды',
          icon: <FolderTree className="h-4 w-4" />,
        },
        {
          id: 'products',
          label: 'Товары (SKU)',
          icon: <Package className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Продажи и клиенты',
      items: [
        {
          id: 'orders',
          label: 'Заказы',
          icon: <ShoppingCart className="h-4 w-4" />,
          badgeCount: pendingOrders,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'customers',
          label: 'Клиенты (B2C/B2B)',
          icon: <Users className="h-4 w-4" />,
        },
        {
          id: 'promos',
          label: 'Скидки и промо',
          icon: <Percent className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Контент и сервис',
      items: [
        {
          id: 'content',
          label: 'Блог, отзывы, FAQ',
          icon: <FileText className="h-4 w-4" />,
          badgeCount: pendingReviews,
          badgeColor: 'bg-[#186FD4] text-white',
        },
        {
          id: 'requests',
          label: 'Звонки и рассылка',
          icon: <PhoneCall className="h-4 w-4" />,
          badgeCount: newCallbacks,
          badgeColor: 'bg-[#EE3F22] text-white',
        },
        {
          id: 'settings',
          label: 'Настройки магазина',
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ];

  const handleSelect = (id: AdminSection) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#102035] text-slate-200">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <BrandLogo dark />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-[#186FD4] text-white shadow-xs'
                        : 'text-slate-300 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span
                        className={`ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                          item.badgeColor ?? 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="rounded-lg bg-white/5 px-3 py-2.5 text-xs">
          <div className="font-semibold text-white truncate">{state.settings.companyName}</div>
          <div className="mt-0.5 text-slate-400">
            ИНН {state.settings.inn} · КПП {state.settings.kpp}
          </div>
          <div
            className={`mt-1 text-[11px] ${
              apiConnected === false ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            ●{' '}
            {apiConnected === true
              ? `API подключен (${state.settings.totalCatalogScale.toLocaleString('ru-RU')} SKU)`
              : apiConnected === false
              ? 'API недоступен (офлайн-кэш)'
              : 'Подключение к API...'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSyncApi}
            disabled={isSyncing}
            title="Обновить данные с сервера"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Синхронизация
          </button>
          <button
            type="button"
            onClick={onResetSeed}
            title="Сбросить локальный кэш"
            className="flex items-center justify-center rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          {authSession ? (
            <button
              type="button"
              onClick={onLogout}
              title="Выйти из аккаунта API"
              className="flex items-center justify-center rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-[#EE3F22]/20 hover:border-[#EE3F22]/40 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              title="Войти в аккаунт API"
              className="flex items-center justify-center rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-[#186FD4]/30 hover:text-white"
            >
              <LogIn className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-68 max-w-[85vw]">{sidebarContent}</div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[#E5E7EB] p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => onGlobalQueryChange(e.target.value)}
                placeholder="Поиск по артикулу, товару, заказу..."
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] py-2 pl-9 pr-3 text-sm text-[#111827] placeholder:text-slate-400 focus:border-[#186FD4] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSelect('requests')}
              className="relative rounded-lg border border-[#E5E7EB] p-2 text-slate-600 transition hover:bg-slate-50"
              title="Новые заявки на звонок"
            >
              <Bell className="h-4 w-4" />
              {newCallbacks > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EE3F22] text-[10px] font-bold text-white">
                  {newCallbacks}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelect('settings')}
              className="hidden items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#102035] transition hover:border-[#186FD4] hover:text-[#186FD4] sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {state.settings.phone}
            </button>

            {authSession ? (
              <div className="flex items-center gap-2.5 border-l border-[#E5E7EB] pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#186FD4] text-xs font-bold text-white">
                  {authSession.email.slice(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="hidden text-left leading-tight md:block">
                  <div className="text-xs font-semibold text-[#102035] max-w-[140px] truncate">
                    {authSession.email}
                  </div>
                  <div className="text-[11px] text-emerald-600">Авторизован</div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#186FD4] bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#186FD4] transition hover:bg-[#186FD4] hover:text-white"
              >
                <LogIn className="h-3.5 w-3.5" />
                Войти в API
              </button>
            )}
          </div>
        </header>

        {syncError && (
          <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 sm:mx-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Не удалось синхронизироваться с сервером: {syncError}</span>
            </div>
            <button
              type="button"
              onClick={onSyncApi}
              className="rounded-md bg-white px-2.5 py-1 font-semibold text-amber-900 border border-amber-300 hover:bg-amber-100"
            >
              Повторить
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};
