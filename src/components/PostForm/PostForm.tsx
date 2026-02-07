import React, { useState, useRef } from "react";
import type { ChangeEvent, SubmitEventHandler } from "react";
import styles from "./PostForm.module.css";
import commonStyles from "../../App.module.css";
import { createPost } from "../../store/slices/postsSlice";
import { useAppDispatch } from "../../store/hooks";
import { ImagePlus } from "lucide-react";
import FileService from "../../API/FileService";

const PostForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileId, setFileId] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { uploadFile, getFileUrl } = FileService();

    const isEmpty = !content.trim() && !fileId;

    const addNewPost: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const text = content.trim();
        if (!text && !fileId) {
            setError("Add text or image");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await dispatch(createPost({
                ...(text && { content: text }),
                ...(fileId && { photo_id: fileId }),
            })).unwrap();
            setContent("");
            setFileUrl(null);
            setFileId(null);
            setFileError(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating post");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileError(null);
        try {
            const { file_id } = await uploadFile(file);
            const url = getFileUrl(file_id);
            setFileId(file_id);
            setFileUrl(url);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setFileError(message);
            setFileUrl(null);
            setFileId(null);
        }
    };

    const handleAttachImageClick = () => {
        fileInputRef.current?.click();
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
                {fileUrl && (
                    <div className={styles.filePreview}>
                        <img src={fileUrl} alt="Uploaded" />
                    </div>
                )}
                {fileError && (
                    <div className={styles.errorMessage}>{fileError}</div>
                )}
                <div className={styles.postActions}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                        aria-hidden
                    />
                    <button
                        type="button"
                        className={styles.attachButton}
                        onClick={handleAttachImageClick}
                        title="Add image"
                        aria-label="Add image"
                    >
                        <ImagePlus size={20} />
                    </button>
                    <button
                        type="submit"
                        className={styles.postButton}
                        disabled={loading || isEmpty}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;