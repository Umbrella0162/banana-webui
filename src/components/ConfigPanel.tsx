"use client";

import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    MODEL_CONFIGS,
    ASPECT_RATIOS,
    RESPONSE_MODALITIES,
    ModelId
} from "@/lib/config";

interface ConfigPanelProps {
    model: string;
    aspectRatio: string;
    setAspectRatio: (value: string) => void;
    resolution: string;
    setResolution: (value: string) => void;
    responseMode: string;
    setResponseMode: (value: string) => void;
    enableSearch: boolean;
    setEnableSearch: (value: boolean) => void;
    numImages: number;
    setNumImages: (value: number) => void;
    disabled?: boolean;
}

export function ConfigPanel({
    model,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    responseMode,
    setResponseMode,
    enableSearch,
    setEnableSearch,
    numImages,
    setNumImages,
    disabled
}: ConfigPanelProps) {

    const modelConfig = MODEL_CONFIGS[model as ModelId] || MODEL_CONFIGS["gemini-2.5-flash-image"];
    const supportedResolutions = modelConfig.resolutions;
    const supportsSearch = modelConfig.supportsSearch;

    const disableResolution = modelConfig.disableResolution;

    return (
        <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
                <Settings className="w-5 h-5 mr-2 text-banana-500" />
                生成配置
            </h3>

            <div className="space-y-6">
                {/* 长宽比 */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">长宽比</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={disabled}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="选择长宽比" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="不设置">不设置 (默认)</SelectItem>
                            {ASPECT_RATIOS.map((ratio) => (
                                <SelectItem key={ratio} value={ratio}>
                                    {ratio}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 分辨率 */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                        分辨率
                        {disableResolution && <span className="ml-2 text-xs text-gray-400 font-normal">(当前模型不可用)</span>}
                    </Label>
                    <Select value={resolution} onValueChange={setResolution} disabled={disabled || disableResolution}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="选择分辨率" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="不设置">不设置 (默认)</SelectItem>
                            {supportedResolutions.map((res) => (
                                <SelectItem key={res} value={res}>
                                    {res}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 响应模式 */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">响应模式</Label>
                    <Select value={responseMode} onValueChange={setResponseMode} disabled={disabled}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="选择响应模式" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(RESPONSE_MODALITIES).map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                    {mode}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Google Search */}
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="search-mode" className="text-sm font-medium text-gray-700">
                        启用 Google 搜索
                    </Label>
                    <Switch
                        id="search-mode"
                        checked={enableSearch}
                        onCheckedChange={setEnableSearch}
                        disabled={disabled || !supportsSearch}
                        className="data-[state=checked]:bg-banana-400"
                    />
                </div>

                {/* 生成数量 */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label className="text-sm font-medium text-gray-700">生成数量</Label>
                        <span className="text-sm font-semibold text-banana-600">{numImages} 张</span>
                    </div>
                    <Slider
                        value={[numImages]}
                        onValueChange={(vals) => setNumImages(vals[0])}
                        min={1}
                        max={9}
                        step={1}
                        disabled={disabled}
                        className="[&_[role=slider]]:bg-banana-400 [&_[role=slider]]:border-banana-500 [&_.bg-primary]:bg-banana-300"
                    />
                </div>
            </div>
        </Card>
    );
}
