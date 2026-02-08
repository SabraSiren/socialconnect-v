import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import styles from "./Comments.module.scss";

const Comments: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className={styles.comments__container}>
            <div className={styles.comments__header}>
                <div className={styles.comments__headerTop}>
                    <Link to="/profile" className={styles.comments__backButton}>
                        <ArrowLeft className={styles.comments__backIcon}/>
                        Back to profile
                    </Link>
                </div>
                <div className={styles.comments__headerContent}>
                    <div className={styles.comments__titleContainer}>
                        <MessageCircle className={styles.comments__titleIcon}/>
                        <h1 className={styles.comments__title}>Comments: 0</h1>
                    </div>
                </div>
            </div>
            <div className={styles.comments__emptyState}>
                <div className={styles.comments__emptyContent}>
                    <h3 className={styles.comments__emptyTitle}>No comments yet</h3>
                    <p className={styles.comments__emptyText}>
                        This post doesn't have any comments yet. Be the first to comment!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Comments;
