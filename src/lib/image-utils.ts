import JSZip from 'jszip';

/**
 * 压缩图片选项
 */
export interface CompressOptions {
    quality?: number;      // 压缩质量 (0-1)，默认 0.8
    maxWidth?: number;     // 最大宽度，默认 1920
    maxHeight?: number;    // 最大高度，默认 1920
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
export const compressImage = (file: File, options: CompressOptions = {}): Promise<File> => {
    const { quality = 0.8, maxWidth = 1920, maxHeight = 1920 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;

            img.onload = () => {
                // 计算新的尺寸
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }

                // 创建 canvas 进行压缩
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // 转换为 blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        // 创建新的 File 对象
                        const compressedFile = new File(
                            [blob],
                            file.name,
                            { type: file.type || 'image/jpeg' }
                        );

                        resolve(compressedFile);
                    },
                    file.type || 'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
    });
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // Remove data:image/xxx;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = error => reject(error);
    });
};

export const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const downloadAsZip = async (images: { url: string; filename: string }[], zipFilename: string) => {
    const zip = new JSZip();

    const promises = images.map(async (img) => {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(img.filename, blob);
    });

    await Promise.all(promises);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    downloadImage(url, zipFilename);
    URL.revokeObjectURL(url);
};
