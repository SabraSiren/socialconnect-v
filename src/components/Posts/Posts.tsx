import React, {useEffect} from "react";
import Post from "../Post/Post";
import Loader from "../UI/Loader";
import styles from "./Posts.module.scss";
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
                <div className={styles.posts__errorContainer}>
                    <p className={styles.posts__errorMessage}>{error}</p>
                    <button
                        onClick={handleRetry}
                        className={styles.posts__retryButton}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {isLoading && !error && <Loader text="Loading posts..." />}

            {!isLoading && !error && posts.length === 0 && (
                <div className={styles.posts__feed}>
                    <div className={styles.posts__emptyState}>
                        <div className={styles.posts__emptyContent}>
                            <p className={styles.posts__emptyText}>No posts yet. Share your first thought!</p>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && !error && posts.length > 0 && (
                <div className={styles.posts__feed}>
                    {posts.map((post) => (
                        <Post
                            key={post.id}
                            post={post}
                        />
                    ))}
                </div>
            )}
        </div>
    )
};

export default Posts;

