"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SecureStorage } from "@/lib/secure-storage";
import { toast } from "sonner";

export function ApiKeyInput() {
    const [apiKey, setApiKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 异步加载 API 密钥
    useEffect(() => {
        SecureStorage.getApiKey()
            .then((key) => {
                if (key) {
                    setApiKey(key);
                    setIsSaved(true);
                }
            })
            .catch((error) => {
                console.error("Failed to load API key:", error);
                toast.error("加载 API 密钥失败");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleSave = async () => {
        if (!apiKey.trim()) {
            toast.error("请输入有效的 API 密钥");
            return;
        }

        try {
            await SecureStorage.saveApiKey(apiKey);
            setIsSaved(true);
            toast.success("API 密钥已安全保存 (加密存储)");
        } catch (error) {
            console.error("Failed to save API key:", error);
            toast.error("保存失败,请重试");
        }
    };

    const handleClear = async () => {
        try {
            await SecureStorage.clearAll();
            setApiKey("");
            setIsSaved(false);
            toast.info("API 密钥已清除");
        } catch (error) {
            console.error("Failed to clear API key:", error);
            toast.error("清除失败,请重试");
        }
    };

    if (isLoading) {
        return (
            <Card className="p-4 bg-banana-50 border border-banana-200 mb-6">
                <div className="flex items-center justify-center py-2">
                    <div className="text-sm text-gray-500">加载中...</div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4 bg-banana-50 border border-banana-200 mb-6">
            <div className="flex items-start space-x-3">
                <Key className="w-5 h-5 text-banana-500 mt-1" />
                <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-900">Gemini API 密钥</Label>
                    <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                            <Input
                                type={showKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="输入你的 Gemini API 密钥"
                                className="pr-10 border-banana-300 focus-visible:ring-banana-300 bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <Button
                            onClick={handleSave}
                            variant={isSaved ? "outline" : "default"}
                            className={isSaved ? "border-banana-300 text-banana-600 hover:bg-banana-50" : "bg-banana-400 hover:bg-banana-500 text-gray-900"}
                        >
                            {isSaved ? "已保存" : "保存"}
                        </Button>
                        {isSaved && (
                            <Button onClick={handleClear} variant="ghost" className="text-gray-500 hover:text-red-500">
                                清除
                            </Button>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                        密钥使用 AES-GCM 加密后存储在浏览器 IndexedDB 中,不会上传到任何服务器。
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-banana-600 hover:underline ml-1 font-medium"
                        >
                            获取密钥 →
                        </a>
                    </p>
                </div>
            </div>
        </Card>
    );
}
