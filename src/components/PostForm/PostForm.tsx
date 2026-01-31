import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./PostForm.module.css";
import commonStyles from "../../App.module.css";
import {createPost} from "../../store/slices/postsSlice";
import { useAppDispatch } from "../../store/hooks";

const PostForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const addNewPost = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        const text = content.trim();
        if (!text) {
            setError("Input post text");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await dispatch(createPost({content: text})).unwrap();
            setContent("");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creating post');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={commonStyles.cardContent}>
            <form onSubmit={addNewPost} name="postform">
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}
                <div className={styles.postInputContainer}>
                        <textarea
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                            className={styles.postInput}
                            rows={3}
                        />
                </div>
                <div className={styles.postActions}>
                    <button type='submit'
                            className={styles.postButton}
                            disabled={loading || !content.trim()}>
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;