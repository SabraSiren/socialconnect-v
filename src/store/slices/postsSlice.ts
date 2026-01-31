import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import PostService from '../../API/PostService'
import {getFriendlyErrorMessage} from "../../utils/errorHandler";
import type { Post, PostsState, CreatePostPayload } from '../../types';

// Асинхронные экшены
export const getPosts = createAsyncThunk<Post[], void, { rejectValue: string }>(
    'posts/getPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await PostService.getPosts()
            return response.posts
        } catch (error) {
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

export const createPost = createAsyncThunk<Post, CreatePostPayload, { rejectValue: string }>(
    'posts/createPost',
    async (payload, { rejectWithValue }) => {
        try {
            return await PostService.createPost(payload)
        } catch (error) {
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

export const deletePost = createAsyncThunk<number, number, { rejectValue: string }>(
    'posts/deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            await PostService.deletePost(postId)
            return postId // возвращаем ID для удаления из состояния
        } catch (error) {
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

export const likePost = createAsyncThunk<Post | null, number, { rejectValue: string }>(
    'posts/likePost',
    async (postId, { rejectWithValue }) => {
        try {
            return await PostService.likePost(postId)
        } catch (error) {
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

const initialState: PostsState = {
    items: [],
    isLoading: false,
    error: null
}

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        // Локальное обновление лайков (оптимистичное обновление)
        updatePost: (state, action: PayloadAction<Post>) => {
            const updatedPost = action.payload;
            const index = state.items.findIndex(post => post.id === updatedPost.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...updatedPost };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // getPosts
            .addCase(getPosts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(getPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
                state.isLoading = false
                state.items = action.payload
            })
            .addCase(getPosts.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false
                state.error = action.payload ?? null
            })
            // createPost
            .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
                // Новый пост добавляется в начало списка
                state.items.unshift(action.payload);
            })
            .addCase(createPost.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? null;
            })
            // deletePost
            .addCase(deletePost.fulfilled, (state, action: PayloadAction<number>) => {
                // Удаляем пост по ID
                state.items = state.items.filter(post => post.id !== action.payload);
            })
            .addCase(deletePost.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? null;
            })
            // likePost
            .addCase(likePost.fulfilled, (state, action: PayloadAction<Post | null>) => {
                // Обновляем пост с новыми данными (лайки и т.д.)
                const updatedPost = action.payload;
                if (updatedPost) {
                    const index = state.items.findIndex(post => post.id === updatedPost.id);
                    if (index !== -1) {
                        state.items[index] = updatedPost;
                    }
                }
            })
            .addCase(likePost.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.error = action.payload ?? null;
            })
    }
})

export const { clearError, updatePost } = postsSlice.actions
export default postsSlice.reducer
