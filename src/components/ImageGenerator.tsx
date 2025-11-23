"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Banana } from "lucide-react";
import { PromptInput } from "@/components/PromptInput";
import { ModelSelector } from "@/components/ModelSelector";
import { ConfigPanel } from "@/components/ConfigPanel";
import { ImageUploader } from "@/components/ImageUploader";
import { GenerateButton } from "@/components/GenerateButton";
import { ImageGallery } from "@/components/ImageGallery";
import { SettingsDialog } from "@/components/SettingsDialog";
import { GeminiImageClient, GeneratedImage } from "@/lib/gemini-client";
import { StorageManager } from "@/lib/storage";
import { MODEL_CONFIGS, ModelId } from "@/lib/config";

export function ImageGenerator() {
    // State
    const [prompt, setPrompt] = useState("");
    const [model, setModel] = useState<string>("gemini-2.5-flash-image");
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    // Config State
    const [aspectRatio, setAspectRatio] = useState("不设置");
    const [resolution, setResolution] = useState("不设置");
    const [responseMode, setResponseMode] = useState("文本和图像");
    const [enableSearch, setEnableSearch] = useState(false);
    const [numImages, setNumImages] = useState(1);

    // Generation State
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [textResponse, setTextResponse] = useState("");

    // Reset resolution when model changes if not supported
    useEffect(() => {
        const config = MODEL_CONFIGS[model as ModelId];
        if (config && resolution !== "不设置" && !(config.resolutions as readonly string[]).includes(resolution)) {
            setResolution("不设置");
        }
        // Also reset search if not supported
        if (config && !config.supportsSearch && enableSearch) {
            setEnableSearch(false);
        }
    }, [model]);

    const handleGenerate = async () => {
        const apiKey = StorageManager.getApiKey();
        const apiEndpoint = StorageManager.getEndpoint(); // Get custom endpoint

        // 验证 API 密钥是否存在且不为空
        if (!apiKey || apiKey.trim() === '') {
            toast.error("请先在右上角设置中配置 API 密钥");
            return;
        }

        if (!prompt && uploadedImages.length === 0) {
            toast.error("请输入提示词或上传参考图像");
            return;
        }

        setLoading(true);
        setGeneratedImages([]);
        setTextResponse("");

        try {
            // Pass apiEndpoint to client
            const client = new GeminiImageClient(apiKey, apiEndpoint || undefined);
            const results: GeneratedImage[] = [];
            let combinedText = "";

            const requests = Array(numImages).fill(null).map(() =>
                client.generateImage({
                    model,
                    prompt,
                    images: uploadedImages,
                    aspectRatio,
                    resolution,
                    enableSearch,
                    apiKey,
                    apiEndpoint: apiEndpoint || undefined
                })
            );

            const responses = await Promise.all(requests);

            responses.forEach((res) => {
                if (res.images) {
                    results.push(...res.images);
                }
                // 保留textResponse用于纯文本响应显示（虽然现在也会创建占位图）
                if (res.text && !combinedText) {
                    combinedText = res.text;
                }
            });

            setGeneratedImages(results);
            setTextResponse(combinedText);

            if (results.length > 0) {
                toast.success(`成功生成 ${results.length} 张图像`);
            } else if (combinedText) {
                toast.info("仅收到了文本响应");
            } else {
                toast.warning("未生成任何内容");
            }

        } catch (error: any) {
            console.error("Generation failed:", error);
            toast.error(`生成失败: ${error.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
            {/* Integrated Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="bg-banana-300 p-2 rounded-lg shadow-sm">
                        <Banana className="w-6 h-6 text-gray-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Nano-Banana 图像生成
                    </h1>
                </div>
                <SettingsDialog />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Input */}
                <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 space-y-6">
                    <PromptInput
                        value={prompt}
                        onChange={setPrompt}
                        disabled={loading}
                    />
                    <ImageUploader
                        images={uploadedImages}
                        setImages={setUploadedImages}
                        disabled={loading}
                    />
                </div>

                {/* Center Column: Config */}
                <div className="w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 space-y-6">
                    <ModelSelector
                        value={model}
                        onChange={setModel}
                        disabled={loading}
                    />
                    <ConfigPanel
                        model={model}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        resolution={resolution}
                        setResolution={setResolution}
                        responseMode={responseMode}
                        setResponseMode={setResponseMode}
                        enableSearch={enableSearch}
                        setEnableSearch={setEnableSearch}
                        numImages={numImages}
                        setNumImages={setNumImages}
                        disabled={loading}
                    />
                    <GenerateButton
                        onClick={handleGenerate}
                        loading={loading}
                        disabled={!prompt && uploadedImages.length === 0}
                    />
                </div>

                {/* Right Column: Gallery */}
                <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <ImageGallery
                        images={generatedImages}
                        textResponse={textResponse}
                        loading={loading}
                        numImages={numImages}
                    />
                </div>
            </div>
        </div>
    );
}
