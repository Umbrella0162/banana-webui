"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Link as LinkIcon, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StorageManager } from "@/lib/storage";
import { toast } from "sonner";

export function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [endpoint, setEndpoint] = useState("");

    useEffect(() => {
        if (open) {
            setApiKey(StorageManager.getApiKey() || "");
            setEndpoint(StorageManager.getEndpoint() || "");
        }
    }, [open]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            toast.error("API 密钥不能为空");
            return;
        }
        StorageManager.saveApiKey(apiKey.trim());
        if (endpoint.trim()) {
            StorageManager.saveEndpoint(endpoint.trim());
        } else {
            localStorage.removeItem('gemini_api_endpoint'); // Clear if empty
        }

        toast.success("配置已保存");
        setOpen(false);
    };

    const handleClear = () => {
        StorageManager.clearAll();
        setApiKey("");
        setEndpoint("");
        toast.info("配置已清除");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-banana-600 hover:bg-banana-50">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>设置</DialogTitle>
                    <DialogDescription>
                        配置你的 Gemini API 密钥和自定义端点。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="api-key" className="flex items-center gap-2">
                            <Key className="w-4 h-4" /> API 密钥
                        </Label>
                        <Input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="输入 Gemini API Key"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="endpoint" className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> 自定义端点 (可选)
                        </Label>
                        <Input
                            id="endpoint"
                            value={endpoint}
                            onChange={(e) => setEndpoint(e.target.value)}
                            placeholder="https://generativelanguage.googleapis.com"
                            className="col-span-3"
                        />
                        <p className="text-xs text-gray-500">
                            如果你使用代理或自定义网关，请在此处输入 Base URL。
                        </p>
                    </div>
                </div>
                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button variant="destructive" size="sm" onClick={handleClear} className="gap-2">
                        <Trash2 className="w-4 h-4" /> 清除配置
                    </Button>
                    <Button onClick={handleSave} className="bg-banana-400 hover:bg-banana-500 text-gray-900 gap-2">
                        <Save className="w-4 h-4" /> 保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
