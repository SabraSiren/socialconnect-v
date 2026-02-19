import React from "react";
import styles from "../../App.module.scss";
import UserProfile from "../UserProfile/UserProfile";
import PostForm from "../PostForm/PostForm";
import Posts from "../Posts/Posts";
import { WebSocketProvider } from "../../API/WebSocketContext";

const ProfilePage: React.FC = () => {
    return (
        <WebSocketProvider>
        <div className={styles.app__container}>
            <div className={styles.app__mainContent}>
                <div className={styles.app__profileCard}>
                    <UserProfile/>
                    <div className={styles.app__divider}></div>
                    <PostForm/>
                </div>
                <Posts/>
            </div>
        </div>
        </WebSocketProvider>
    );
};

export default ProfilePage;