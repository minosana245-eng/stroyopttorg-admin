import React, { useState } from 'react';
import { Download, Mail, PhoneCall, Plus, Trash2 } from 'lucide-react';
import { AdminState, CallbackRequest } from '../types/admin';
import { Badge, Card, PageHeader } from '../components/ui/Primitives';
import { formatDateRu, uid } from '../utils/format';

interface RequestsPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({ state, setState }) => {
  const [tab, setTab] = useState<'callbacks' | 'subscribers'>('callbacks');
  const [newEmail, setNewEmail] = useState('');

  const updateCallbackStatus = (id: string, status: CallbackRequest['status']) => {
    setState((prev) => ({
      ...prev,
      callbacks: prev.callbacks.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  };

  const updateCallbackNote = (id: string, managerNote: string) => {
    setState((prev) => ({
      ...prev,
      callbacks: prev.callbacks.map((c) => (c.id === id ? { ...c, managerNote } : c)),
    }));
  };

  const addSubscriber = () => {
    const email = newEmail.trim();
    if (!email || !email.includes('@')) return;
    setState((prev) => ({
      ...prev,
      subscribers: [
        {
          id: uid('sub'),
          email,
          subscribedAt: new Date().toISOString().slice(0, 10),
          source: 'Подвал сайта',
          status: 'Активен',
        },
        ...prev.subscribers,
      ],
    }));
    setNewEmail('');
  };

  const exportSubscribers = () => {
    const csv =
      '\uFEFFEmail;Дата;Источник;Статус\n' +
      state.subscribers
        .map((s) => `${s.email};${s.subscribedAt};${s.source};${s.status}`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stroyopttorg_subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Обращения и рассылка"
        subtitle="Заявки из формы «Заказать звонок» и база подписчиков на акции из подвала сайта"
        actions={
          tab === 'subscribers' ? (
            <button
              type="button"
              onClick={exportSubscribers}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#102035] hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-[#186FD4]" />
              Экспорт CSV
            </button>
          ) : null
        }
      />

      <div className="mb-5 flex gap-2 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab('callbacks')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'callbacks'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500'
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          Заказать звонок ({state.callbacks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('subscribers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'subscribers'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500'
          }`}
        >
          <Mail className="h-4 w-4" />
          Подписчики на рассылку ({state.subscribers.length})
        </button>
      </div>

      {tab === 'callbacks' && (
        <div className="space-y-3">
          {state.callbacks.map((cb) => (
            <Card key={cb.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#102035]">{cb.name}</span>
                    <span className="font-mono text-sm font-semibold text-[#186FD4]">
                      {cb.phone}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{cb.topic}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Создана: {formatDateRu(cb.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={cb.status}
                    onChange={(e) =>
                      updateCallbackStatus(cb.id, e.target.value as CallbackRequest['status'])
                    }
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold focus:outline-none ${
                      cb.status === 'Новый'
                        ? 'border-rose-200 bg-rose-50 text-[#E11D48]'
                        : cb.status === 'В работе'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-[#1A9C56]'
                    }`}
                  >
                    <option value="Новый">Новый</option>
                    <option value="В работе">В работе</option>
                    <option value="Обработан">Обработан</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  value={cb.managerNote ?? ''}
                  onChange={(e) => updateCallbackNote(cb.id, e.target.value)}
                  placeholder="Комментарий менеджера по звонку..."
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#F5F7FA] px-3 py-1.5 text-xs focus:border-[#186FD4] focus:bg-white focus:outline-none"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'subscribers' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Добавить email подписчика вручную..."
                className="min-w-[240px] flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#186FD4] focus:outline-none"
              />
              <button
                type="button"
                onClick={addSubscriber}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Добавить
              </button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5E7EB] bg-[#F5F7FA] text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Источник</th>
                  <th className="px-4 py-3">Дата подписки</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Удалить</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {state.subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-[#102035]">{sub.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{sub.source}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDateRu(sub.subscribedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sub.status === 'Активен' ? 'green' : 'gray'}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            subscribers: prev.subscribers.filter((s) => s.id !== sub.id),
                          }))
                        }
                        className="rounded p-1.5 text-slate-400 hover:text-[#E11D48]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};
