export const MODEL_CONFIGS = {
    "gemini-2.5-flash-image": {
        displayName: "Gemini 2.5 Flash (Nano Banana)",
        resolutions: ["1K"],
        maxResolution: "1K",
        supportsSearch: true,
        maxInputImages: 3,
        disableResolution: true, // Gemini 2.5 不支持分辨率参数
    },
    "gemini-3-pro-image-preview": {
        displayName: "Gemini 3 Pro (Nano Banana Pro)",
        resolutions: ["1K", "2K", "4K"],
        maxResolution: "4K",
        supportsSearch: true,
        maxInputImages: 14,
        disableResolution: false,
    },
    "nano-banana-pro-preview": {
        displayName: "Nano Banana Pro Preview",
        resolutions: ["1K", "2K", "4K"],
        maxResolution: "4K",
        supportsSearch: true,
        maxInputImages: 14,
        disableResolution: false,
    },
} as const;

export type ModelId = keyof typeof MODEL_CONFIGS;

export const ASPECT_RATIOS = [
    "1:1", "2:3", "3:2", "3:4", "4:3",
    "4:5", "5:4", "9:16", "16:9", "21:9"
] as const;

export const RESPONSE_MODALITIES = {
    "文本和图像": ["TEXT", "IMAGE"],
    "仅图像": ["IMAGE"]
} as const;
