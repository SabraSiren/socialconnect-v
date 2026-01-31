import React from "react";
import styles from "./Loader.module.css";

interface LoaderProps {
    size?: "small" | "medium" | "large";
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({size = "medium", text = "Loading..."}) => {
    return (
        <div className={styles.loaderContainer}>
            <div className={`${styles.spinner} ${styles[size]}`}></div>
            {text && <p className={styles.loaderText}>{text}</p>}
        </div>
    );
};

export default Loader;
