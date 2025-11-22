"use client";

import { Sparkles, Loader2, Banana } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
    onClick: () => void;
    loading: boolean;
    disabled?: boolean;
}

export function GenerateButton({ onClick, loading, disabled }: GenerateButtonProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "w-full h-12 text-lg font-semibold relative overflow-hidden transition-all duration-200",
                "bg-gradient-to-br from-banana-300 to-banana-400",
                "hover:from-banana-400 hover:to-banana-500 hover:shadow-lg hover:-translate-y-0.5",
                "active:from-banana-500 active:to-banana-600 active:translate-y-0",
                "text-gray-900 shadow-md",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
            )}
        >
            {loading ? (
                <div className="flex items-center space-x-2">
                    <Banana className="w-5 h-5 animate-spin text-gray-800" />
                    <span>正在生成...</span>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>生成图像</span>
                </div>
            )}
        </Button>
    );
}
