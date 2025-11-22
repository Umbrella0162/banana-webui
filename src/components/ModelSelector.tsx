"use client";

import { Sparkles } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MODEL_CONFIGS, ModelId } from "@/lib/config";

interface ModelSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">模型选择</Label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="
          w-full p-3 h-auto
          border border-gray-200 rounded-lg
          hover:border-banana-300
          focus:ring-2 focus:ring-banana-200
          bg-white
        ">
                    <div className="flex items-center">
                        <Sparkles className="w-4 h-4 text-banana-500 mr-2" />
                        <SelectValue placeholder="选择模型" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(MODEL_CONFIGS).map(([id, config]) => (
                        <SelectItem key={id} value={id}>
                            {config.displayName}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
