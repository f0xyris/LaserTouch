import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const Reviews = () => {
  const { t } = useLanguage();
  const { user, isLoading } = useAuth(); // 1. Получаем user
  type ReviewForm = { name: string; comment: string; rating: number };
  const [form, setForm] = useState<ReviewForm>({ name: "", comment: "", rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<ReviewForm[]>([]);

  // Получаем отзывы с сервера используя React Query для лучшей производительности
  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ["/api/reviews/all"],
    queryFn: async () => {
      const response = await fetch("/api/reviews/all");
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30 * 1000, // 30 секунд - данные считаются свежими
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Добавляем новые отзывы, которые "на модерации"
  type ReviewCard = ReviewForm & { id: string | number; pending?: boolean };
  const allReviews: ReviewCard[] = [
    ...pendingReviews.map((r, idx) => ({
      ...r,
      id: `pending-${idx}`,
      name: r.name || t.reviewFormAnonymous,
      comment: r.comment,
      rating: r.rating,
      pending: true,
    })),
    ...(Array.isArray(reviews) ? reviews : []),
  ];

  // 2. Если user есть, подставляем имя и фамилию при первом рендере или изменении user
  React.useEffect(() => {
    if (user && (user.firstName || user.lastName)) {
      setForm(f => ({ ...f, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() }));
    }
  }, [user]);

  // Для hover-эффекта звёзд
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const renderStars = (rating: number, onSelect?: (n: number) => void) => {
    // Если onSelect не передан — это карточка отзыва, всегда 5 золотых звёзд
    if (!onSelect) {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "h-5 w-5 sm:h-6 sm:w-6 fill-yellow-500 text-yellow-500 transition-colors"
              : "h-5 w-5 sm:h-6 sm:w-6 text-gray-300 dark:text-gray-500 transition-colors"
          }
        />
      ));
    }
    // Для формы — интерактивные звёзды
    return Array.from({ length: 5 }, (_, i) => {
      // Если звезда уже выбрана — всегда золотая
      let isFilled = i < rating;
      // Если наводим на звезду с большим индексом, подсвечиваем только те, что ещё не выбраны
      if (hoveredStar !== null) {
        if (hoveredStar > rating) {
          isFilled = i < hoveredStar && i >= rating ? true : i < rating;
        } else {
          isFilled = i < hoveredStar;
        }
      }
      return (
        <button
          type="button"
          key={i}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 m-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-mystical-400 cursor-pointer transition-colors"
          onClick={() => onSelect(i + 1)}
          onMouseEnter={() => {
            if (hoveredStar !== i + 1) setHoveredStar(i + 1);
          }}
          onMouseLeave={() => setHoveredStar(null)}
          tabIndex={0}
          aria-label={`${i + 1}`}
          style={{ background: 'none', border: 'none' }}
        >
          <Star className={isFilled ? 'fill-yellow-500 text-yellow-500 transition-colors' : 'text-gray-400 dark:text-gray-500 transition-colors'} style={{ border: 'none', margin: 0, padding: 0 }} />
        </button>
      );
    });
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name || "",
        comment: form.comment,
        rating: Number(form.rating),
        serviceId: null,
        status: 'pending'
      };
      if (user && user.id) payload.userId = user.id;
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPendingReviews([{ ...form }, ...pendingReviews]);
        setForm({ name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "", comment: "", rating: 5 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-mystical-500 dark:text-mystical-400 mb-2 sm:mb-4">{t.reviewsTitle}</h1>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm sm:text-base">{t.reviewsDescription}</p>
        </div>
      {/* Форма для нового отзыва */}
      <section className="mb-10 bg-background dark:bg-card rounded-lg shadow-xl border border-muted-foreground/10 p-0">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-mystical-600 dark:text-mystical-300 mb-2">{t.reviewFormTitle}</h2>
          <p className="text-muted-foreground mb-4 text-sm">{t.reviewFormDescription}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-mystical-700 dark:text-mystical-300">{t.reviewFormNameLabel}</label>
              <Input
                className="review-name-input bg-white text-purple-700 placeholder:text-purple-300 dark:bg-background dark:text-foreground"
                placeholder={t.reviewFormNamePlaceholder}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                maxLength={32}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-mystical-700 dark:text-mystical-300">{t.reviewFormTextLabel} <span className="text-destructive">*</span></label>
              <Textarea
                placeholder={t.reviewFormTextPlaceholder}
                value={form.comment}
                onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                required
                minLength={5}
                maxLength={400}
                disabled={submitting}
                className="border-0 focus:ring-2 focus:ring-mystical-400 shadow-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-mystical-700 dark:text-mystical-300">{t.reviewFormRatingLabel}</label>
              <div className="flex">{renderStars(form.rating, n => setForm(f => ({ ...f, rating: n })))}</div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={submitting || !form.comment.trim()}>
              {submitting ? t.reviewFormSubmitting : t.reviewFormSubmit}
            </Button>
          </form>
        </div>
        {/* В будущем: здесь можно показывать статус отправки/модерации */}
      </section>
      {/* Список отзывов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {loadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="shadow-xl dark:shadow-mystical-500/10 bg-background dark:bg-card animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <div key={starIndex} className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          allReviews.map((review) => (
            <Card key={review.id} className={`shadow-xl dark:shadow-mystical-500/10 bg-background dark:bg-card hover:shadow-2xl dark:hover:shadow-mystical-500/20 transition-all duration-300 ${'pending' in review && review.pending ? 'opacity-60 pointer-events-none' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-mystical-600 to-accent-600 dark:from-mystical-500 dark:to-accent-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-mystical-700 dark:text-mystical-400">{review.name}</h3>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-muted-foreground italic">"{review.comment}"</p>
                {'pending' in review && review.pending && (
                  <div className="mt-2 text-xs text-muted-foreground">{t.reviewFormPending}</div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* В будущем: отзывы будут появляться только после одобрения в админке */}
      </div>
    </main>
  );
};

export default Reviews;
