import API from "./api";
import { AxiosError } from "axios";
import type { User, LoginCredentials, RegisterCredentials } from "../types"


interface QueueItem {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}

interface RefreshResponse {
    [key: string]: unknown;
}

interface LoginResponse {
    user?: User;
    [key: string]: unknown; // Для других возможных полей ответа
}


const AuthService = (() => {

    // Рефреш механика.
    let isRefreshing: boolean = false; 
    let failedQueue: QueueItem[] = []; 
    let interceptorId: number | null = null;
    
    const processQueue = (error: unknown, token: unknown = null) => {
        failedQueue.forEach((p) => {
            if (error) p.reject(error); // если ошибка - отклоняем все промисы.
            else p.resolve(token); // если успех - разрешаем все промисы.
        });
        failedQueue = [];  // очищаем очередь.
    };


    const refreshTokenRequest = async (): Promise<RefreshResponse> => {
        const res = await API.post<RefreshResponse>('/auth/refresh');
        return res.data;
    };

    // Интерцептор - ловим 401 и пробуем рефрешнуть
    const ensureResponseInterceptor = (): void => {
        if (interceptorId !== null) return;

        API.interceptors.response.use(
            (response) => response, // если все ок - пропускаем ответ.
            async (error: AxiosError) => { // если ошибка - обрабатываем.
                const originalRequest = error.config;

                // Проверка URL
                const url = originalRequest?.url ?? '';
                const isLoginOrRegister =
                    url.includes('/auth/login') ||
                    url.includes('/auth/register');

                // если нет config или это не 401 — просто проброс
                if (!originalRequest || !error.response || error.response.status !== 401 || isLoginOrRegister) {
                    return Promise.reject(error); // не обрабатываем.
                }                  // Если это запрос на логин/регистрацию и там 401 - значит просто неправильный пароль, а не истекший токен.

                if (originalRequest._retry) { // избегаем бесконечных ретраев.
                    return Promise.reject(error);
                }

                // если уже идёт рефреш — ставим этот запрос в очередь и ждём.
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({resolve, reject});
                    })
                        .then(() => {
                            originalRequest._retry = true;
                            return API(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                // начинаем рефреш
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    await refreshTokenRequest(); 
                    processQueue(null);  // разрешаем все ожидающие запросы. без передачи токена.
                    isRefreshing = false;
                    // повторяем оригинальный запрос (куки уже обновились в браузере)
                    return API(originalRequest);
                } catch (err) {
                    // рефреш не удался — выходим из системы.
                    processQueue(err, null);
                    isRefreshing = false;
                    return Promise.reject(err);
                }
            }
        );
    };
    ensureResponseInterceptor();


    async function login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const res = await API.post<LoginResponse>('/auth/login', credentials);
            return  res?.data ?? {}; 
        } catch (err) {
            throw err;
        }
    }


    async function register(credentials: RegisterCredentials):Promise<LoginResponse> {
        try {
            const res = await API.post<LoginResponse>('/auth/register', credentials);
            return  res?.data ?? {};
        } catch (err) {
            throw err;
        }
    }

    async function logout(): Promise<void> {
        try {
            await API.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    async function getCurrentUser(): Promise<User | null> {
        try {
            const res = await API.get<User>('/auth/me');
            return  res?.data ?? null;
        } catch (err) {
            // пользователь не авторизован = не ошибка.
            return null;
        }
    }


    return {
        login,
        register,
        logout,
        getCurrentUser,
    };
})();

export default AuthService;
