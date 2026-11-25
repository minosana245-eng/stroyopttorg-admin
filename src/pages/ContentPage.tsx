import React, { useState } from 'react';
import {
  BookOpen,
  MessageSquareQuote,
  HelpCircle,
  Plus,
  Star,
  Trash2,
  Pencil,
  Check,
} from 'lucide-react';
import { AdminState, BlogArticle, CustomerReview, FaqItem } from '../types/admin';
import { Badge, Card, CenterModal, PageHeader } from '../components/ui/Primitives';
import { formatDateRu, uid } from '../utils/format';

interface ContentPageProps {
  state: AdminState;
  setState: React.Dispatch<React.SetStateAction<AdminState>>;
}

export const ContentPage: React.FC<ContentPageProps> = ({ state, setState }) => {
  const [tab, setTab] = useState<'blog' | 'reviews' | 'faq'>('blog');
  const [articleModal, setArticleModal] = useState<BlogArticle | null>(null);
  const [faqModal, setFaqModal] = useState<FaqItem | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const saveArticle = () => {
    if (!articleModal || !articleModal.title.trim()) return;
    setState((prev) => {
      const exists = prev.articles.some((a) => a.id === articleModal.id);
      return {
        ...prev,
        articles: exists
          ? prev.articles.map((a) => (a.id === articleModal.id ? articleModal : a))
          : [articleModal, ...prev.articles],
      };
    });
    setArticleModal(null);
  };

  const saveFaq = () => {
    if (!faqModal || !faqModal.question.trim()) return;
    setState((prev) => {
      const exists = prev.faqs.some((f) => f.id === faqModal.id);
      return {
        ...prev,
        faqs: exists
          ? prev.faqs.map((f) => (f.id === faqModal.id ? faqModal : f))
          : [...prev.faqs, faqModal],
      };
    });
    setFaqModal(null);
  };

  const setReviewStatus = (id: string, status: CustomerReview['status']) => {
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  };

  const saveReply = (id: string) => {
    const reply = (replyDrafts[id] ?? '').trim();
    if (!reply) return;
    setState((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === id ? { ...r, adminReply: reply, status: 'Опубликован' } : r
      ),
    }));
  };

  return (
    <div>
      <PageHeader
        title="Контент, отзывы и FAQ"
        subtitle="Статьи блога, модерация отзывов покупателей и база вопросов-ответов"
        actions={
          tab === 'blog' ? (
            <button
              type="button"
              onClick={() =>
                setArticleModal({
                  id: uid('art'),
                  title: '',
                  rubric: 'Инструмент',
                  publishedAt: new Date().toISOString().slice(0, 10),
                  views: 0,
                  excerpt: '',
                  content: '',
                  isPublished: true,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Plus className="h-4 w-4" />
              Новая статья
            </button>
          ) : tab === 'faq' ? (
            <button
              type="button"
              onClick={() =>
                setFaqModal({
                  id: uid('faq'),
                  category: 'Доставка',
                  question: '',
                  answer: '',
                  sortOrder: state.faqs.length + 1,
                  isActive: true,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#145BB0]"
            >
              <Plus className="h-4 w-4" />
              Добавить вопрос
            </button>
          ) : null
        }
      />

      <div className="mb-5 flex flex-wrap gap-2 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setTab('blog')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'blog' ? 'border-[#186FD4] text-[#186FD4]' : 'border-transparent text-slate-500'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Блог и новости ({state.articles.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'reviews'
              ? 'border-[#186FD4] text-[#186FD4]'
              : 'border-transparent text-slate-500'
          }`}
        >
          <MessageSquareQuote className="h-4 w-4" />
          Отзывы ({state.reviews.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('faq')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold ${
            tab === 'faq' ? 'border-[#186FD4] text-[#186FD4]' : 'border-transparent text-slate-500'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Вопрос-ответ ({state.faqs.length})
        </button>
      </div>

      {tab === 'blog' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.articles.map((art) => (
            <Card key={art.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="blue">{art.rubric}</Badge>
                  <Badge variant={art.isPublished ? 'green' : 'gray'}>
                    {art.isPublished ? 'Опубликовано' : 'Черновик'}
                  </Badge>
                </div>
                <h3 className="mt-3 text-base font-bold text-[#102035]">{art.title}</h3>
                <p className="mt-2 text-xs text-slate-600 line-clamp-3">{art.excerpt}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs text-slate-400">
                <span>
                  {formatDateRu(art.publishedAt)} · {art.views} просм.
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setArticleModal({ ...art })}
                    className="rounded p-1.5 text-slate-500 hover:text-[#186FD4]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        articles: prev.articles.filter((x) => x.id !== art.id),
                      }))
                    }
                    className="rounded p-1.5 text-slate-400 hover:text-[#E11D48]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {state.reviews.map((rev) => (
            <Card key={rev.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#102035]">{rev.authorName}</span>
                    <span className="text-xs text-slate-400">г. {rev.city}</span>
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating }, (_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </span>
                  </div>
                  {rev.productName && (
                    <div className="mt-0.5 text-xs font-medium text-[#186FD4]">
                      Товар: {rev.productName}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      rev.status === 'Опубликован'
                        ? 'green'
                        : rev.status === 'На модерации'
                        ? 'amber'
                        : 'red'
                    }
                  >
                    {rev.status}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setReviewStatus(rev.id, 'Опубликован')}
                    className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#1A9C56]"
                  >
                    Одобрить
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus(rev.id, 'Отклонен')}
                    className="rounded border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-[#E11D48]"
                  >
                    Отклонить
                  </button>
                </div>
              </div>

              <p className="mt-3 text-sm text-[#111827]">{rev.text}</p>

              {rev.adminReply ? (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2.5 text-xs text-[#102035]">
                  <strong>Ответ СтройОптТорг:</strong> {rev.adminReply}
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={replyDrafts[rev.id] ?? ''}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))
                    }
                    placeholder="Написать официальный ответ магазина..."
                    className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs focus:border-[#186FD4] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => saveReply(rev.id)}
                    className="rounded-lg bg-[#186FD4] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Ответить
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'faq' && (
        <div className="space-y-3">
          {state.faqs.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="navy">{item.category}</Badge>
                  <h3 className="mt-2 text-sm font-bold text-[#102035]">{item.question}</h3>
                  <p className="mt-1 text-xs text-slate-600">{item.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFaqModal({ ...item })}
                    className="rounded p-1.5 text-slate-500 hover:text-[#186FD4]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        faqs: prev.faqs.filter((f) => f.id !== item.id),
                      }))
                    }
                    className="rounded p-1.5 text-slate-400 hover:text-[#E11D48]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Article Modal */}
      <CenterModal
        open={!!articleModal}
        onClose={() => setArticleModal(null)}
        title="Редактор статьи блога"
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setArticleModal(null)}
              className="rounded-lg border border-[#E5E7EB] px-3.5 py-1.5 text-sm"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveArticle}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white"
            >
              <Check className="h-4 w-4" /> Сохранить
            </button>
          </>
        }
      >
        {articleModal && (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold">Заголовок статьи *</label>
              <input
                type="text"
                value={articleModal.title}
                onChange={(e) => setArticleModal({ ...articleModal, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold">Рубрика</label>
                <input
                  type="text"
                  value={articleModal.rubric}
                  onChange={(e) => setArticleModal({ ...articleModal, rubric: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={articleModal.isPublished}
                    onChange={(e) =>
                      setArticleModal({ ...articleModal, isPublished: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#186FD4]"
                  />
                  Опубликована на сайте
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold">Краткий анонс</label>
              <textarea
                rows={2}
                value={articleModal.excerpt}
                onChange={(e) => setArticleModal({ ...articleModal, excerpt: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold">Полный текст статьи</label>
              <textarea
                rows={4}
                value={articleModal.content}
                onChange={(e) => setArticleModal({ ...articleModal, content: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
          </div>
        )}
      </CenterModal>

      {/* FAQ Modal */}
      <CenterModal
        open={!!faqModal}
        onClose={() => setFaqModal(null)}
        title="Вопрос-ответ (FAQ)"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFaqModal(null)}
              className="rounded-lg border border-[#E5E7EB] px-3.5 py-1.5 text-sm"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveFaq}
              className="rounded-lg bg-[#186FD4] px-4 py-1.5 text-sm font-semibold text-white"
            >
              Сохранить
            </button>
          </>
        }
      >
        {faqModal && (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-semibold">Раздел</label>
              <select
                value={faqModal.category}
                onChange={(e) =>
                  setFaqModal({ ...faqModal, category: e.target.value as FaqItem['category'] })
                }
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2"
              >
                {(['Доставка', 'Оплата', 'Возврат', 'Самовывоз', 'Гарантия'] as const).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold">Вопрос *</label>
              <input
                type="text"
                value={faqModal.question}
                onChange={(e) => setFaqModal({ ...faqModal, question: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold">Ответ</label>
              <textarea
                rows={4}
                value={faqModal.answer}
                onChange={(e) => setFaqModal({ ...faqModal, answer: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2"
              />
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
};
