import JSZip from 'jszip';

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
