import React, { useState } from 'react';
import { Lock, AlertCircle, Eye } from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onContinueReadOnly?: () => void;
  notice?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onContinueReadOnly,
  notice,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>

        <h1 className="text-center text-xl font-bold text-[#102035]">Вход в панель управления</h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          ООО «Стройоптторг» · Авторизация через Backend API
        </p>

        {notice && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-[#E11D48]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#102035]">Email сотрудника</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#186FD4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102035]">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#186FD4] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#186FD4] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#145BB0] disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {loading ? 'Вход...' : 'Войти в админ-панель'}
          </button>

          {onContinueReadOnly && (
            <button
              type="button"
              onClick={onContinueReadOnly}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Продолжить в режиме просмотра (без токена)
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
