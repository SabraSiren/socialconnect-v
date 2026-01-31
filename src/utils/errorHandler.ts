import type { AxiosError } from 'axios';
import { isAxiosError as axiosIsAxiosError } from 'axios';

// Тип для ошибки, которая может прийти в функцию
type ErrorInput = 
    | AxiosError<{ message?: string }>  // Axios ошибка с возможным message в response.data
    | Error                              // Обычная JavaScript ошибка
    | string                             // Строка с сообщением
    | unknown;                           // Любой другой тип (для безопасности)

/**
 * Преобразует технические ошибки в понятные пользователю сообщения.
 * 
 * @param error - Ошибка любого типа (AxiosError, Error, string, или unknown)
 * @returns Строка с дружелюбным сообщением для пользователя
 */
export const getFriendlyErrorMessage = (error: ErrorInput): string => {
    // Если это уже дружелюбное сообщение (строка) - возвращаем как есть
    if (typeof error === 'string' && !error.includes('status code') && !error.includes('Network Error')) {
        return error;
    }

    // Обработка Axios ошибок (HTTP ошибки)
    if (isAxiosErrorGuard(error)) {
        const status = error.response?.status;
        
        if (status) {
            switch (status) {
                case 400:
                    return 'Invalid request. Please check your data.';
                case 401:
                    return 'Please log in to continue.';
                case 403:
                    return 'You do not have permission for this action.';
                case 404:
                    return 'Resource not found.';
                case 409:
                    return 'This resource already exists.';
                case 422:
                    return 'Validation error. Please check your input.';
                case 429:
                    return 'Too many requests. Please try again later.';
                case 500:
                    return 'Server error. Please try again later.';
                case 502:
                    return 'Service temporarily unavailable.';
                case 503:
                    return 'Service unavailable. Please try again later.';
                default:
                    return 'Something went wrong. Please try again.';
            }
        }

        // Обработка сетевых ошибок Axios
        if (error.message) {
            if (error.message.includes('Network Error')) {
                return 'Network connection failed. Please check your internet connection.';
            }
            if (error.message.includes('timeout')) {
                return 'Request timeout. Please try again.';
            }
        }
    }

    // Обработка обычных Error объектов
    if (error instanceof Error && error.message) {
        const message = error.message.toLowerCase();

        if (message.includes('username') && message.includes('already exists')) {
            return 'This username is already taken. Please choose another one.';
        }
        if (message.includes('password')) {
            return 'Invalid password. Please try again.';
        }
        if (message.includes('email')) {
            return 'Please enter a valid email address.';
        }
        
        // Если это обычная ошибка, но не Axios - возвращаем её сообщение
        if (!isAxiosErrorGuard(error)) {
            return error.message;
        }
    }

    // Обработка строковых ошибок (если не прошли первую проверку)
    if (typeof error === 'string') {
        const message = error.toLowerCase();

        if (message.includes('username') && message.includes('already exists')) {
            return 'This username is already taken. Please choose another one.';
        }
        if (message.includes('password')) {
            return 'Invalid password. Please try again.';
        }
        if (message.includes('email')) {
            return 'Please enter a valid email address.';
        }
    }

    // Дефолтное сообщение для неизвестных типов ошибок
    return 'Something went wrong. Please try again.';
};

/**
 * Type guard для проверки, является ли ошибка AxiosError
 */
function isAxiosErrorGuard(error: ErrorInput): error is AxiosError<{ message?: string }> {
    return axiosIsAxiosError(error);
}
