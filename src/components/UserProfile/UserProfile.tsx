import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { User } from "lucide-react";
import styles from "./UserProfile.module.scss";
import commonStyles from "../../App.module.scss";
import { updateUser } from "../../store/slices/authSlice";
import OptionMenu from "../OptionMenu/OptionMenu";
import FileService from "../../API/FileService";
import AuthService from "../../API/AuthService";

const UserProfile: React.FC = () => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const { user } = useAppSelector((state) => state.auth);
    const postsCount = useAppSelector((state) => state.posts.items.length);
    const { uploadFile, getFileUrl } = FileService();

    

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
        <div className={commonStyles.app__profileCard}>
            <div className={commonStyles.app__cardContent}>
                <div className={styles.userProfile__userInfo}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleAvatarChange}
                        className="visuallyHidden"
                        aria-hidden
                    />
                    <button
                        type="button"
                        className={styles.userProfile__avatarButton}
                        onClick={handleAvatarClick}
                        disabled={avatarLoading}
                        title="Change photo"
                        aria-label="Change photo"
                    >
                        <div className={styles.userProfile__avatar}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt=""
                                    className={styles.userProfile__avatarImage}
                                    width={80}
                                    height={80}
                                    decoding="async"
                                    fetchPriority="high"
                                    loading="eager"
                                />
                            ) : (
                                <div className={styles.userProfile__emptyAvatar}>
                                    <User className={styles.userProfile__userIcon} />
                                </div>
                            )}
                            {avatarLoading && <div className={styles.userProfile__avatarOverlay}>...</div>}
                        </div>
                    </button>
                    <div className={styles.userProfile__userDetails}>
                        <OptionMenu />
                        <h1 className={styles.userProfile__userName}>{user?.full_name}</h1>
                        {avatarError && <div className={styles.userProfile__avatarError}>{avatarError}</div>}
                        <div className={styles.userProfile__userStats}>
                            <div className={styles.userProfile__stat}>
                                <span className={styles.userProfile__statNumber}>{postsCount}</span>
                                <span className={styles.userProfile__statLabel}>Posts</span>
                            </div>
                            <div className={styles.userProfile__stat}>
                                <span className={styles.userProfile__statNumber}>1.2k</span>
                                <span className={styles.userProfile__statLabel}>Followers</span>
                            </div>
                            <div className={styles.userProfile__stat}>
                                <span className={styles.userProfile__statNumber}>892</span>
                                <span className={styles.userProfile__statLabel}>Following</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
