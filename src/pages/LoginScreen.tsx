import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@stroiopttorg.ru');
  const [password, setPassword] = useState('••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>

        <h1 className="text-center text-xl font-bold text-[#102035]">Вход в панель управления</h1>
        <p className="mt-1 text-center text-xs text-slate-500">
          ООО «Стройоптторг» · Демо-авторизация администратора
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#102035]">Email сотрудника</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-[#186FD4] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#186FD4] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#145BB0]"
          >
            <Lock className="h-4 w-4" />
            Войти в админ-панель
          </button>
        </form>
      </div>
    </div>
  );
};
