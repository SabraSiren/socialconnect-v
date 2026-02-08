import React from "react";
import styles from "../../App.module.css";
import UserProfile from "../UserProfile/UserProfile";
import PostForm from "../PostForm/PostForm";
import Posts from "../Posts/Posts";


const ProfilePage: React.FC = () => {

    return (
        
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
    );
};

export default ProfilePage;