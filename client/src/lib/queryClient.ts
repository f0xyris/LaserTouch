import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error = new Error(`HTTP error! status: ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  await throwIfResNotOk(response);
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Временно отключено для тестирования
      refetchOnMount: true, // Обновляем данные при монтировании компонента
      refetchOnReconnect: false, // Временно отключено для тестирования
      staleTime: 2 * 60 * 1000, // 2 минуты - данные считаются свежими 2 минуты
      gcTime: 5 * 60 * 1000, // 5 минут - данные хранятся в кеше 5 минут
      retry: 2, // Пробуем повторить запрос 2 раза при ошибке
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Пробуем повторить мутацию 1 раз при ошибке
    },
  },
});
