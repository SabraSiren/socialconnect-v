import React, {useEffect} from "react";
import Post from "../Post/Post";
import styles from "./Posts.module.css";
import {getPosts} from '../../store/slices/postsSlice'
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const Posts: React.FC = () => {
    const dispatch = useAppDispatch()
    const {items: posts, isLoading, error} = useAppSelector(state => state.posts)
    const { isAuth } = useAppSelector(state => state.auth)

    useEffect(() => {
        if (isAuth) {
            dispatch(getPosts());
        }
    }, [dispatch, isAuth]);

    const handleRetry = (): void => {
        dispatch(getPosts());
    };

    return (
        <div>
            {error && (
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button
                        onClick={handleRetry}
                        className={styles.retryButton}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!isLoading && !error && posts.length === 0 && (
                <div className={styles.feed}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyContent}>
                            <p className={styles.emptyText}>No posts yet. Share your first thought!</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.feed}>
                {posts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                    />
                ))}
            </div>
        </div>
    )
};

export default Posts;

