import React, { useRef, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import styles from "./OptionMenu.module.scss";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { logout, updateUser } from "../../store/slices/authSlice";
import AuthService from "../../API/AuthService";
import ExchangeRate from "../ExchangeRate/ExchangeRate";

const OptionMenu: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleDeleteAvatar = async (): Promise<void> => {
        try {
            const updated = await AuthService.updateProfile({ avatar_id: null });
            if (updated) {
                dispatch(updateUser(updated));
            } else {
                dispatch(updateUser({ avatar_id: null }));
            }
        } catch (err) {
            console.error("Ошибка при удалении аватара:", err);
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await dispatch(logout()).unwrap();
            navigate("/login");
        } catch (err) {
            console.error("Ошибка при выходе:", err);
        }
    };

    const toggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className={styles.optionMenu} ref={menuRef}>
            <button
                type="button"
                className={styles.optionMenu__trigger}
                onClick={toggleMenu}
                aria-label="Options"
                aria-expanded={isOpen}
            >
                <Menu size={20} />
            </button>
            {isOpen && (
                <div className={styles.optionMenu__dropdown}>
                    {user?.avatar_id && (
                        <button
                            type="button"
                            className={styles.optionMenu__menuItem}
                            onClick={handleDeleteAvatar}
                        >
                            Delete photo
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.optionMenu__menuItem}
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                    <div className={styles.optionMenu__divider} />
                    <div className={styles.optionMenu__exchangeWrapper}>
                        <ExchangeRate embedded />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptionMenu;
