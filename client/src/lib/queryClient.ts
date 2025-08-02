import { QueryClient } from "@tanstack/react-query";
import { getQueryFn } from "./queryFn";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Включаем обновление при фокусе окна для мгновенного отображения изменений
      refetchOnMount: true, // Обновляем данные при монтировании компонента
      refetchOnReconnect: true, // Включаем обновление при восстановлении соединения
      staleTime: 30 * 1000, // 30 секунд - данные считаются свежими 30 секунд (быстрее обновление)
      gcTime: 2 * 60 * 1000, // 2 минуты - данные хранятся в кеше 2 минуты
      retry: 2, // Пробуем повторить запрос 2 раза при ошибке
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Optimize for preloaded data
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      retry: 1, // Пробуем повторить мутацию 1 раз при ошибке
    },
  },
});
