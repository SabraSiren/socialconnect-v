import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { User, LogOut } from "lucide-react";
import styles from "./UserProfile.module.css";
import commonStyles from "../../App.module.css";
import { logout, updateUser } from "../../store/slices/authSlice";
import ExchangeRate from "../ExchangeRate/ExchangeRate";
import FileService from "../../API/FileService";
import AuthService from "../../API/AuthService";

const UserProfile: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const { user } = useAppSelector((state) => state.auth);
    const postsCount = useAppSelector((state) => state.posts.items.length);
    const { uploadFile, getFileUrl } = FileService();

    const handleLogout = async (): Promise<void> => {
        try {
            await dispatch(logout()).unwrap();
            navigate("/login");
        } catch (err) {
            console.error("Ошибка при выходе:", err);
        }
    };

    const handleAvatarClick = () => {
        setAvatarError(null);
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarLoading(true);
        setAvatarError(null);
        try {
            const { file_id } = await uploadFile(file);
            try {
                const updated = await AuthService.updateProfile({ avatar_id: file_id });
                if (updated) dispatch(updateUser(updated));
                else dispatch(updateUser({ avatar_id: file_id }));
            } catch {
                dispatch(updateUser({ avatar_id: file_id }));
            }
        } catch (err) {
            setAvatarError(err instanceof Error ? err.message : "Loading error");
        } finally {
            setAvatarLoading(false);
            e.target.value = "";
        }
    };

    const avatarUrl = user?.avatar_id ? getFileUrl(user.avatar_id) : null;

    return (
        <div className={commonStyles.profileCard}>
            <div className={commonStyles.cardContent}>
                <div className={styles.userInfo}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleAvatarChange}
                        className={styles.hiddenInput}
                        aria-hidden
                    />
                    <button
                        type="button"
                        className={styles.avatarButton}
                        onClick={handleAvatarClick}
                        disabled={avatarLoading}
                        title="Change photo"
                        aria-label="Change photo"
                    >
                        <div className={styles.avatar}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="" className={styles.avatarImage} />
                            ) : (
                                <div className={styles.emptyAvatar}>
                                    <User className={styles.userIcon} />
                                </div>
                            )}
                            {avatarLoading && <div className={styles.avatarOverlay}>...</div>}
                        </div>
                    </button>
                    <div className={styles.userDetails}>
                        <h1 className={styles.userName}>{user?.full_name}</h1>
                        {avatarError && <div className={styles.avatarError}>{avatarError}</div>}
                        <div className={styles.userStats}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{postsCount}</span>
                                <span className={styles.statLabel}>Posts</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>1.2k</span>
                                <span className={styles.statLabel}>Followers</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>892</span>
                                <span className={styles.statLabel}>Following</span>
                            </div>
                        </div>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            <LogOut className={styles.logoutIcon} />
                            Logout
                        </button>
                        <ExchangeRate />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
