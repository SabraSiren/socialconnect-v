import API from './api';
import {normalizePost, normalizePostsArray} from "../utils/normalizePost";
import type { Post, CreatePostPayload } from '../types';
import axios from 'axios';

// Интерфейсы для API ответов
interface ArticlesResponse {
    articles: unknown[]; // Сырые данные с сервера до нормализации
}

interface PostResponse {
    [key: string]: unknown; // Сырые данные поста с сервера
}

interface GetPostsResponse {
    posts: Post[];
}



const PostService = () => {
    const getErrorMessage = (err: unknown, fallback: string): string => {
        if (axios.isAxiosError<{ message?: string }>(err)) {
            return err.response?.data?.message || err.message || fallback;
        }
        if (err instanceof Error) {
            return err.message || fallback;
        }
        return fallback;
    };

    async function getPosts(): Promise<GetPostsResponse> {
        try {
            const res = await API.get<ArticlesResponse>('/articles');
            const postList = res?.data?.articles ?? [];
            const posts = normalizePostsArray(postList);
            return {posts}
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Error loading posts'));
        }
    }

    async function getPost(postId: number): Promise<Post> {
        try {
            const res = await API.get<PostResponse>(`/articles/${postId}`);
            return normalizePost(res?.data ?? {});
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Error loading post'));
        }
    }

    async function createPost(payload: CreatePostPayload): Promise<Post> {
        try {
            const res = await API.post<PostResponse>('/articles', payload);
            return normalizePost(res?.data ?? {});
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Error creating post'));
        }
    }

    async function deletePost(postId: number): Promise<void> {
        try {
            await API.delete(`/articles/${postId}`);
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Error delete post'));
        }
    }

    async function likePost(postId: number): Promise<Post | null> {
        try {
            const res = await API.patch<PostResponse>(`/articles/${postId}/like`)
            if (res?.data) {
                return normalizePost(res.data);
            }
            return null;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Error liking post'));
        }
    }

    return {
        getPosts,
        getPost,
        createPost,
        deletePost,
        likePost,
    }
};

export default PostService();