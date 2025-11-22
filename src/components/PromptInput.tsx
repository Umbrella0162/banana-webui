"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
    return (
        <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-900">文本提示词</Label>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="
          w-full min-h-[120px] p-4
          border-2 border-gray-200
          focus-visible:border-banana-300 focus-visible:ring-2 focus-visible:ring-banana-200
          rounded-lg resize-none
          font-sans text-base
          placeholder-gray-400
          transition-all duration-200
          bg-white
        "
                placeholder="描述你想生成的图像...&#10;&#10;例如：一只可爱的橘猫坐在咖啡杯旁边，插画风格"
            />
        </div>
    );
}
