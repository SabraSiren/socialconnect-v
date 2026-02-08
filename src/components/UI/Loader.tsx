import React from "react";
import styles from "./Loader.module.css";

interface LoaderProps {
    size?: "small" | "medium" | "large";
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({size = "medium", text = "Loading..."}) => {
    return (
        <div className={styles.loader__container}>
            <div className={`${styles.loader__spinner} ${styles[`loader__spinner--${size}`]}`}></div>
            {text && <p className={styles.loader__text}>{text}</p>}
        </div>
    );
};

export default Loader;
