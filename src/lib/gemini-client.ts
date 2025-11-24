import { fileToBase64 } from "./image-utils";
import { MODEL_CONFIGS, ModelId } from "./config";

export interface GenerateImageParams {
    model: string;
    prompt: string;
    images?: File[];
    aspectRatio?: string;
    resolution?: string;
    enableSearch?: boolean;
    apiKey: string;
    apiEndpoint?: string;
}

export interface GeneratedImage {
    url: string;
    base64: string;
    mimeType: string;
    text?: string;         // 该图片对应的文本响应
    isTextOnly?: boolean;  // 标识这是仅文本的占位图
}

export interface GenerationResult {
    images: GeneratedImage[];
    text: string;
}

// Gemini API 请求和响应类型定义
interface InlineData {
    mimeType: string;
    data: string;
}

interface ContentPart {
    text?: string;
    inlineData?: InlineData;
}

interface Content {
    role: string;
    parts: ContentPart[];
}

interface ImageConfig {
    aspectRatio?: string;
    imageSize?: string;
}

interface GenerationConfig {
    responseModalities: string[];
    imageConfig?: ImageConfig;
}

interface ApiPayload {
    contents: Content[];
    generationConfig: GenerationConfig;
    tools?: Array<{ googleSearch: Record<string, never> }>;
}

interface ApiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
                inlineData?: InlineData;
            }>;
        };
    }>;
}

export class GeminiImageClient {
    private apiKey: string;
    private apiEndpoint: string;

    constructor(apiKey: string, apiEndpoint?: string) {
        this.apiKey = apiKey;
        // Default to official endpoint if not provided, remove trailing slash if present
        this.apiEndpoint = (apiEndpoint || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
    }

    async generateImage(params: GenerateImageParams): Promise<GenerationResult> {
        const { model, prompt, images, aspectRatio, resolution, enableSearch } = params;

        // Construct URL
        // Pattern: https://{endpoint}/v1beta/models/{model}:generateContent?key={apiKey}
        const url = `${this.apiEndpoint}/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

        // Prepare parts
        const parts: ContentPart[] = [];

        if (prompt && prompt.trim()) {
            parts.push({ text: prompt });
        }

        if (images && images.length > 0) {
            // Send images in original order so the first one in the UI list is the main reference
            for (const img of images) {
                const base64 = await fileToBase64(img);
                // Add image part
                parts.push({
                    inlineData: {
                        mimeType: img.type,
                        data: base64,
                    },
                });
            }
        }

        const contents: Content[] = [{
            role: "user",
            parts: parts
        }];

        // Prepare config
        const generationConfig: GenerationConfig = {
            responseModalities: ["TEXT", "IMAGE"],
        };

        const imageConfig: ImageConfig = {};
        if (aspectRatio && aspectRatio !== "不设置") {
            imageConfig.aspectRatio = aspectRatio;
        }

        // 检查模型是否禁用分辨率参数
        const modelConfig = MODEL_CONFIGS[model as ModelId];
        const shouldSendResolution = !modelConfig?.disableResolution;

        if (shouldSendResolution && resolution && resolution !== "不设置") {
            imageConfig.imageSize = resolution;
        }

        if (Object.keys(imageConfig).length > 0) {
            generationConfig.imageConfig = imageConfig;
        }

        const payload: ApiPayload = {
            contents,
            generationConfig,
        };

        if (enableSearch) {
            payload.tools = [{ googleSearch: {} }];
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorMessage = `API 请求失败 (${response.status}):\n${errorText}`;
                console.error("Gemini API Error:", errorMessage);

                // 返回错误信息作为文本响应,而不是抛出异常
                return this.createTextOnlyResult(errorMessage);
            }

            const data = await response.json();
            return this.extractResults(data);
        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);

            // 将所有错误转换为文本响应
            return this.createTextOnlyResult(`请求异常:\n${errorMessage}`);
        }
    }

    private createTextOnlyResult(text: string): GenerationResult {
        // 创建一个1x1黄色占位图 (RGB: 254, 240, 138 - banana-200)
        const yellowPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

        return {
            images: [{
                url: `data:image/png;base64,${yellowPixel}`,
                base64: yellowPixel,
                mimeType: "image/png",
                text: text,
                isTextOnly: true,
            }],
            text: text,
        };
    }

    private extractResults(response: ApiResponse): GenerationResult {
        const images: GeneratedImage[] = [];
        const textParts: string[] = [];

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                // 首先收集所有文本和图片
                const imageParts: Array<{ base64: string; mimeType: string }> = [];

                for (const part of candidate.content.parts) {
                    if (part.text) {
                        textParts.push(part.text);
                    } else if (part.inlineData) {
                        imageParts.push({
                            base64: part.inlineData.data,
                            mimeType: part.inlineData.mimeType || "image/png"
                        });
                    }
                }

                const combinedText = textParts.join("\n");

                // 如果有图片，将文本关联到每张图片
                if (imageParts.length > 0) {
                    for (const imgPart of imageParts) {
                        const url = `data:${imgPart.mimeType};base64,${imgPart.base64}`;
                        images.push({
                            url,
                            base64: imgPart.base64,
                            mimeType: imgPart.mimeType,
                            text: combinedText || undefined,
                        });
                    }
                } else if (combinedText) {
                    // 如果只有文本没有图片，创建一个1x1黄色占位图
                    // 1x1黄色PNG的base64 (RGB: 254, 240, 138 - banana-200)
                    const yellowPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
                    images.push({
                        url: `data:image/png;base64,${yellowPixel}`,
                        base64: yellowPixel,
                        mimeType: "image/png",
                        text: combinedText,
                        isTextOnly: true,
                    });
                }
            }
        }

        // 如果既没有图片也没有文本,创建一个空响应占位图
        if (images.length === 0 && textParts.length === 0) {
            const yellowPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
            images.push({
                url: `data:image/png;base64,${yellowPixel}`,
                base64: yellowPixel,
                mimeType: "image/png",
                text: "API 返回了空响应",
                isTextOnly: true,
            });
        }

        return {
            images,
            text: textParts.join("\n"),
        };
    }
}
