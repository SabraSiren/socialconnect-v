import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "./UI/Loader";
import commonStyles from "../App.module.scss";

const LoginPage = lazy(() => import("./LoginPage/LoginPage"));
const ProfilePage = lazy(() => import("./ProfilePage/ProfilePage"));
const Comments = lazy(() => import("./Comments/Comments"));

const RouteFallback = () => (
    <div className={commonStyles.app__loaderWrapper} aria-busy="true">
        <Loader size="small" text="" />
    </div>
);

const AppRouter = () => {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* Защищенные маршруты */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/comments/:postId"
                    element={
                        <ProtectedRoute>
                            <Comments />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;
