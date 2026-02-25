import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import styles from "./Post.module.scss";
import commonStyles from "../../App.module.scss";
import { deletePost, likePost } from "../../store/slices/postsSlice";
import type { Post as PostType } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import FileService from "../../API/FileService";


interface PostProps {
    post: PostType;
    isFirst?: boolean;
}

const Post: React.FC<PostProps> = ({ post }) => {
    const dispatch = useAppDispatch();
    const { getFileUrl } = FileService();

    const {
        id,
        content,
        likes,
        timestamp,
        liked_by_user,
        photo_id,
        isFirst,
    } = post;

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        dispatch(deletePost(id));
    };

    const handleLike = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        dispatch(likePost(id));
    };

    const formattedTime = (() => {
        if (!timestamp) return "";
        const d = new Date(timestamp);
        return isNaN(d.getTime()) ? String(timestamp) : d.toLocaleString();
    })();


    return (
        <div className={styles.post__card}>
            <div className={styles.post__header}>
                <div className={styles.post__time}>
                    <span>{formattedTime}</span>

                    <button
                        className={styles.post__deleteButton}
                        onClick={handleDelete}
                        title="Delete post"
                        type="button"
                    >
                        <Trash2 className={styles.post__deleteIcon}/>
                    </button>
                </div>
            </div>
            <div className={commonStyles['app__cardContent--compact']}>
                <div className={styles.post__divider} aria-hidden="true" />
                <p className={styles.post__content}>{content}</p>
                {photo_id && (
                    <div className={styles.post__image}>
                        <img
                            src={getFileUrl(photo_id)}
                            alt="Post attachment"
                            decoding="async"
                            loading={isFirst ? "eager" : "lazy"}
                            fetchPriority={isFirst ? "high" : "auto"}
                            width="600"
                            height="400"
                        />
                    </div>
                )}
                <div className={styles.post__actions}>
                    <button
                        onClick={handleLike}
                        className={`${styles.post__actionButton} ${liked_by_user ? styles['post__actionButton--liked'] : ""}`}>
                        <Heart className={`${styles.post__actionIcon} ${liked_by_user ? styles.post__heartFilled : ""}`}/>
                        <span>{likes}</span>
                    </button>
                    <Link
                        to={`/comments/${id}`}
                        className={styles.post__actionButton}
                    >
                        <MessageCircle className={styles.post__actionIcon}/>
                        <span>0</span>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Post;
