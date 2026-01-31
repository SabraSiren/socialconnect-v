import styles from "./LoginPage.module.css";
import commonStyles from "../../App.module.css";
import type { ChangeEvent, SubmitEventHandler } from "react";
import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import {login, register, clearError} from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import type { LoginCredentials, RegisterCredentials } from "../../types";

const isRegisterCredentialsField = (name: string): name is keyof RegisterCredentials =>
    name === 'username' || name === 'password' || name === 'full_name';

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {
        user,
        isAuth,
        isLoading,
        error
    } = useAppSelector((state) => state.auth);

    // Локальное состояние UI.
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true); // Режим отображения формы: вход (login) или регистрация (register)
    const [formData, setFormData] = useState<RegisterCredentials>({
        username: "",
        password: "",
        full_name: ""
    });

    useEffect(() => {
        if (!isLoading && isAuth && user) {
            navigate('/profile');
        }
    }, [isAuth, user, navigate, isLoading]);


    // Обработчик изменения полей формы. Синхронизирует локальное состояние с инпутами и очищает текст ошибки при вводе.
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const {name, value} = e.target;
        if (!isRegisterCredentialsField(name)) return;
        setFormData(prev => {
            const updated: RegisterCredentials = {
                ...prev,
                [name]: value
            };
            return updated;
        });
        // Очищаем ошибки из Redux при изменении полей.
        if (error) {
            dispatch(clearError());
        }
    };


    //Обработчик отправки формы. В зависимости от текущего режима выполняет вход или регистрацию.
    const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        // Устанавливаем локальное состояние загрузки.
        setIsButtonLoading(true);
        setSuccessMessage(null); // сбрасываем сообщение
        // Выполняем запрос: вход или регистрация.
        try {
            if (isLoginMode) {
                // Формируем данные для входа
                const loginData: LoginCredentials = {
                    username: formData.username,
                    password: formData.password
                };
                console.log('Отправляем вход:', loginData);
                // dispatch возвращает Promise, unwrap() извлекает результат/ошибку.
                const result = await dispatch(login(loginData)).unwrap();
                console.log('Вход успешен:', result);
                // Редирект выполнится в useEffect выше.
            } else {
                // Формируем данные для регистрации
                const registerData: RegisterCredentials = {
                    username: formData.username,
                    password: formData.password,
                    full_name: formData.full_name
                };
                console.log('Отправляем регистрацию:', registerData);
                const result = await dispatch(register(registerData)).unwrap();
                setSuccessMessage(`Registration successful! Please log in to your account`);
                console.log('Регистрация успешна:', result);
                setIsLoginMode(true); // Автоматически переключаем на логин

            }
        } catch (err) {
            console.error(`Ошибка ${isLoginMode ? 'входа' : 'регистрации'}:`, err);
            setSuccessMessage(null); // убираем success при ошибке
            // Ошибка уже сохранена в состоянии через rejectWithValue.
        } finally {
            // Сбрасываем состояние кнопки в любом случае.
            setIsButtonLoading(false);
        }
    };


    // Переключение между режимами (login/register). Сбрасывает значения формы и очищает ошибку.
    const toggleMode = (): void => {
        setIsLoginMode(!isLoginMode);
        setFormData({
            username: "",
            password: "",
            full_name: ""
        });
        setSuccessMessage(null); // очищаем сообщение
        dispatch(clearError());
    };


    return (
        <div className={commonStyles.pageContainer}>
            <div className={styles.authCard}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h1 className={styles.title}>Welcome to SocialConnect</h1>
                        <p className={styles.description}>Connect with friends and share your moments</p>
                    </div>

                    {/* Переключатель режимов (кнопки) */}
                    <div className={styles.modeToggle}>
                        <button
                            className={`${styles.toggleButton} ${isLoginMode ? styles.active : ''}`}
                            onClick={() => !isLoginMode && toggleMode()}
                        >
                            Login
                        </button>
                        <button
                            className={`${styles.toggleButton} ${!isLoginMode ? styles.active : ''}`}
                            onClick={() => isLoginMode && toggleMode()}
                        >
                            Register
                        </button>
                    </div>

                    <div className={commonStyles.cardContent}>
                        {/* Сообщение об успешной регистрации */}
                        {successMessage && (
                            <div className={styles.successMessage}>
                                 {successMessage}
                            </div>
                        )}
                        {/* Блок отображения текстовой ошибки */}
                        {error && !successMessage && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formFields}>
                                {/* Поле: логин */}
                                <div className={styles.field}>
                                    <label htmlFor="login" className={styles.label}>
                                        Login
                                    </label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        placeholder="Enter username"
                                        minLength={3}
                                        maxLength={50}
                                        required
                                        onChange={handleInputChange}
                                        value={formData.username}
                                        className={styles.input}
                                    />
                                </div>

                                {/* Поле: пароль */}
                                <div className={styles.field}>
                                    <label htmlFor="password" className={styles.label}>
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter password"
                                        minLength={6}
                                        maxLength={128}
                                        required
                                        onChange={handleInputChange}
                                        value={formData.password}
                                        className={styles.input}
                                    />
                                </div>

                                {/* Поле: отображаемое имя (только для регистрации; видно на странице профиля) */}
                                {!isLoginMode && (
                                    <div className={styles.field}>
                                        <label htmlFor="full_name" className={styles.label}>
                                            Full name
                                        </label>
                                        <input
                                            id="full_name"
                                            name="full_name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            minLength={1}
                                            maxLength={30}
                                            required={!isLoginMode}
                                            onChange={handleInputChange}
                                            value={formData.full_name}
                                            className={styles.input}
                                        />
                                    </div>
                                )}

                                {/* Кнопка отправки формы */}
                                <button
                                    type="submit"
                                    disabled={isButtonLoading}
                                    className={styles.submitButton}>
                                    {isButtonLoading ? 'Loading...' : (isLoginMode ? 'Sign in' : 'Sign up')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
