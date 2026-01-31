
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter";
import {useEffect} from "react";
import { checkAuth } from './store/slices/authSlice';
import { useAppDispatch } from './store/hooks';

function App() {
    const dispatch = useAppDispatch();

    // Проверяем авторизацию при запуске приложения
    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return (
        <BrowserRouter>
            <AppRouter/>
        </BrowserRouter>
    );
}

export default App;
