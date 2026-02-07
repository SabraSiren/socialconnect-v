import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import styles from "./Post.module.css";
import commonStyles from "../../App.module.css";
import { deletePost, likePost } from "../../store/slices/postsSlice";
import type { Post as PostType } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import FileService from "../../API/FileService";


interface PostProps {
    post: PostType;
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
        <div className={styles.postCard}>
            <div className={styles.postHeader}>
                <div className={styles.postTime}>
                    <span>{formattedTime}</span>

                    <button
                        className={styles.deleteButton}
                        onClick={handleDelete}
                        title="Delete post"
                        type="button"
                    >
                        <Trash2 className={styles.deleteIcon}/>
                    </button>
                </div>
            </div>
            <div className={commonStyles.cardContentCompact}>
                <p className={styles.postContent}>{content}</p>
                {photo_id && (
                    <div className={styles.postImage}>
                        <img src={getFileUrl(photo_id)} alt="Post attachment" />
                    </div>
                )}
                <div className={styles.postActions}>
                    <button
                        onClick={handleLike}
                        className={`${styles.actionButton} ${liked_by_user ? styles.liked : ""}`}>
                        <Heart className={`${styles.actionIcon} ${liked_by_user ? styles.heartFilled : ""}`}/>
                        <span>{likes}</span>
                    </button>
                    <Link
                        to={`/comments/${id}`}
                        className={styles.actionButton}
                    >
                        <MessageCircle className={styles.actionIcon}/>
                        <span>0</span>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Post;
