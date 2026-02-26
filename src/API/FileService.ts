import axios from "axios";
import API from "./api"


const FILE_RULES = {
    maxSize: 512 * 1024, // 512KB
    allowedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
};

interface UploadFileResponse {
    file_id: string;
}

interface FileValidationResult {
    valid: boolean;
    error?: string;
    type?: 'size' | 'format';
}

export const validateFile = (file: File): FileValidationResult => {
    if (file.size > FILE_RULES.maxSize) {
        return {
            valid: false,
            error: `The file is too large. Maximum size — ${FILE_RULES.maxSize / 1024} kB.`,
            type: 'size',
        };
    }

    if (!FILE_RULES.allowedFormats.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file format. Acceptable formats: ${FILE_RULES.allowedFormats.join(', ')}`,
            type: 'format',
        };
    }

    return {valid: true};
};

export async function compressImage(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file, {
        resizeWidth: 1200,
        resizeQuality: "high"
    });

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas error");

    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.7)
    );

    if (!blob) throw new Error("Compression failed");

    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
        type: "image/webp"
    });
}

const FileService = () => {
    const getErrorMessage = (err: unknown, fallback: string): string => {
        if (axios.isAxiosError<{ message?: string }>(err)) {
            return err.response?.data?.message || err.message || fallback;
        }
        if (err instanceof Error) {
            return err.message || fallback;
        }
        return fallback;
    };

    async function uploadFile(file: File): Promise<UploadFileResponse> {
        const validation = validateFile(file);

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        try {
            const optimizedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('file', optimizedFile);
            const res = await API.post('/files', formData, {
                headers: {'Content-Type': false as unknown as string},
            });
            return res.data;
        } catch (err) {
            throw new Error(getErrorMessage(err, 'Error uploading file'));
        }
    }

    /** URL картинки по file_id — без XHR, чтобы не упираться в CORS при загрузке в <img>. */
    function getFileUrl(fileId: string): string {
        const base = API.defaults.baseURL ?? '';
        const baseClean = base.endsWith('/') ? base.slice(0, -1) : base;
        return `${baseClean}/files/${fileId}`;
    }

    return {
        uploadFile,
        getFileUrl,
    }
}

export {FileService};
export default FileService;