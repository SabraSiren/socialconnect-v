export interface Post {
    id: number;
    content: string;
    likes: number;
    timestamp: string;
    liked_by_user: boolean;
}

export interface User {
    id: number;
    username: string;
    full_name?: string;
}

export interface AuthState {
    user: User | null;
    isAuth: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface PostsState {
    items: Post[];
    isLoading: boolean;
    error: string | null;
}

export interface RootState {
    auth: AuthState;
    posts: PostsState;
}

// Интерфейсы для данных авторизации
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    password: string;
    full_name: string;
}

// Интерфейсы для работы с постами
export interface CreatePostPayload {
    content: string;
}