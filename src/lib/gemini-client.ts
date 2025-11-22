import { fileToBase64 } from "./image-utils";

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
}

export interface GenerationResult {
    images: GeneratedImage[];
    text: string;
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

        // Prepare contents
        const contents: any[] = [{
            role: "user",
            parts: [{ text: prompt }]
        }];

        if (images && images.length > 0) {
            for (const img of images) {
                const base64 = await fileToBase64(img);
                // Add image part
                contents[0].parts.push({
                    inlineData: {
                        mimeType: img.type,
                        data: base64,
                    },
                });
            }
        }

        // Prepare config
        const generationConfig: any = {
            responseModalities: ["TEXT", "IMAGE"],
        };

        const imageConfig: any = {};
        if (aspectRatio && aspectRatio !== "不设置") {
            imageConfig.aspectRatio = aspectRatio;
        }
        if (resolution && resolution !== "不设置") {
            imageConfig.imageSize = resolution;
        }

        if (Object.keys(imageConfig).length > 0) {
            generationConfig.imageConfig = imageConfig;
        }

        const payload: any = {
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
                throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return this.extractResults(data);
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }

    private extractResults(response: any): GenerationResult {
        const images: GeneratedImage[] = [];
        const textParts: string[] = [];

        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.text) {
                        textParts.push(part.text);
                    } else if (part.inlineData) {
                        const base64 = part.inlineData.data;
                        const mimeType = part.inlineData.mimeType || "image/png";
                        const url = `data:${mimeType};base64,${base64}`;
                        images.push({
                            url,
                            base64,
                            mimeType,
                        });
                    }
                }
            }
        }

        return {
            images,
            text: textParts.join("\n"),
        };
    }
}
