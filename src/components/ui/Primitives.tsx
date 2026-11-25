import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type BadgeVariant = 'blue' | 'red' | 'green' | 'amber' | 'navy' | 'gray';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  blue: 'bg-blue-50 text-[#186FD4] border-blue-200',
  red: 'bg-rose-50 text-[#E11D48] border-rose-200',
  green: 'bg-emerald-50 text-[#1A9C56] border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  navy: 'bg-slate-100 text-[#102035] border-slate-300',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}> = ({ children, variant = 'gray', className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold leading-tight ${BADGE_STYLES[variant]} ${className}`}
  >
    {children}
  </span>
);

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-[#E5E7EB] bg-white shadow-xs ${className}`}>
    {children}
  </div>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-[#102035] sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: React.ReactNode;
  accent?: 'blue' | 'green' | 'amber' | 'red';
  onClick?: () => void;
}> = ({ label, value, hint, trend, trendPositive = true, icon, accent = 'blue', onClick }) => {
  const iconBg = {
    blue: 'bg-blue-50 text-[#186FD4]',
    green: 'bg-emerald-50 text-[#1A9C56]',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-[#EE3F22]',
  }[accent];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs transition ${
        onClick ? 'cursor-pointer hover:border-[#186FD4]/50 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#102035] tabular-nums">
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
      </div>
      {(hint || trend) && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-[#1A9C56]' : 'text-[#E11D48]'}`}>
              {trend}
            </span>
          )}
          {hint && <span className="text-slate-400">{hint}</span>}
        </div>
      )}
    </div>
  );
};

export const DrawerModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  widthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, subtitle, widthClass = 'max-w-2xl', children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#102035]/45 backdrop-blur-[1px]">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={`relative z-10 flex h-full w-full ${widthClass} flex-col bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#102035]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-[#E5E7EB] bg-slate-50 px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const CenterModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ open, onClose, title, maxWidthClass = 'max-w-lg', children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102035]/45 p-4 backdrop-blur-[1px]">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxWidthClass} rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
          <h3 className="text-base font-bold text-[#102035]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] bg-slate-50 px-5 py-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
