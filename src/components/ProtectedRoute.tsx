import React from 'react';
import { useAppSelector } from '../store/hooks';
import { Navigate } from 'react-router-dom';
import Loader from "./UI/Loader";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuth, isLoading } = useAppSelector((state) => state.auth);

    if (isLoading) {
        return (
            <div>
                <Loader/>
            </div>
        );
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;