import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import AuthService from '../../API/AuthService'
import { getFriendlyErrorMessage } from '../../utils/errorHandler'
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '../../types';


// Асинхронные экшены
export const checkAuth = createAsyncThunk<User | null, void, { rejectValue: null }>(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            return await AuthService.getCurrentUser() // Пользователь авторизован.
        } catch (error) {
            // Любая ошибка при проверке = не авторизован, но без дружелюбного сообщения.
            return rejectWithValue(null);
        }
    }
)

export const login = createAsyncThunk<User | null, LoginCredentials, { rejectValue: string }>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const data = await AuthService.login(credentials)
            const user = await AuthService.getCurrentUser()
            return user || data?.user || null
        } catch (error) {
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

export const register = createAsyncThunk<string, RegisterCredentials, { rejectValue: string }>(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            await AuthService.register(userData)
            return userData.username; // возвращаем только имя для сообщения
        } catch (error) {
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

export const logout = createAsyncThunk<null, void, { rejectValue: string }>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await AuthService.logout() // ← вызывает API /auth/logout
            return null // успешный выход
        } catch (error) {
            // Даже если ошибка API - все равно очищаем локально
            console.error('Logout API error:', error)
            return rejectWithValue(getFriendlyErrorMessage(error))
        }
    }
)

const initialState: AuthState = {
    user: null,
    isAuth: false,
    isLoading: true,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // checkAuth
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User | null>) => {
                state.isLoading = false
                state.isAuth = !!action.payload
                state.user = action.payload
                state.error = null
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false
                state.isAuth = false
                state.user = null
                state.error = null // специально null именно для checkAuth.
            })
            // login
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<User | null>) => {
                state.isLoading = false
                state.isAuth = !!action.payload
                state.user = action.payload
            })
            .addCase(login.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false
                state.isAuth = false
                state.user = null
                state.error = action.payload ?? null
            })
            // register
            .addCase(register.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state) => {
                state.isLoading = false
                state.isAuth = false
                state.user = null
                state.error = null;
            })
            .addCase(register.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false
                state.isAuth = false
                state.user = null
                state.error = action.payload ?? null
            })
            // logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false
                state.isAuth = false
                state.user = null
                state.error = null
            })
            .addCase(logout.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.isLoading = false
                state.isAuth = false
                state.user = null
                state.error = action.payload ?? null
            });
    }
});

export const {clearError } = authSlice.actions;
export default authSlice.reducer;