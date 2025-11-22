"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Maximize2, Edit3, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function PromptInput({ value, onChange, disabled }: PromptInputProps) {
    const [open, setOpen] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    // Sync tempValue with value when dialog opens
    useEffect(() => {
        if (open) {
            setTempValue(value);
        }
    }, [open, value]);

    const handleSave = () => {
        onChange(tempValue);
        setOpen(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-gray-900">文本提示词</Label>
                <span className="text-xs text-gray-500">支持 Markdown • 点击放大编辑</span>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div
                        className={cn(
                            "w-full h-64 p-4 rounded-lg border-2 border-gray-200 bg-white transition-all duration-200",
                            "hover:border-banana-300 hover:shadow-sm cursor-pointer relative group",
                            "overflow-y-auto",
                            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                    >
                        {/* Preview Area */}
                        <div className="prose prose-sm max-w-none text-gray-700 prose-headings:font-bold prose-a:text-banana-600 prose-strong:text-gray-900">
                            {value ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {value}
                                </ReactMarkdown>
                            ) : (
                                <span className="text-gray-400 select-none">
                                    描述你想生成的图像...
                                    <br />
                                    <br />
                                    例如：一只可爱的**橘猫**坐在咖啡杯旁边，_插画风格_
                                </span>
                            )}
                        </div>

                        {/* Hover Overlay Icon */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 p-1.5 rounded-md backdrop-blur-sm">
                            <Maximize2 className="w-4 h-4 text-banana-600" />
                        </div>
                    </div>
                </DialogTrigger>

                <DialogContent
                    className="!max-w-[80vw] w-[80vw] h-[80vh] flex flex-col gap-3"
                    suppressHydrationWarning
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-banana-500" />
                            编辑提示词
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
                        {/* Left: Preview */}
                        <div className="flex flex-col gap-2 h-full overflow-hidden">
                            <Label className="text-sm font-medium text-gray-500">预览</Label>
                            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50/50 p-4 overflow-y-auto overflow-x-hidden">
                                <div className="prose prose-sm max-w-none text-gray-700 prose-headings:font-bold prose-a:text-banana-600 prose-strong:text-gray-900 [word-break:break-all] [overflow-wrap:anywhere]">
                                    {tempValue ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                            {tempValue}
                                        </ReactMarkdown>
                                    ) : (
                                        <span className="text-gray-400 italic">预览区域...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Edit */}
                        <div className="flex flex-col gap-2 h-full overflow-hidden">
                            <Label className="text-sm font-medium text-gray-500">编辑 (Markdown)</Label>
                            <Textarea
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="flex-1 w-full resize-none p-4 text-sm font-mono leading-relaxed border-gray-200 focus-visible:ring-banana-300 focus-visible:border-banana-300 bg-white whitespace-pre-wrap overflow-x-hidden [word-break:break-all]"
                                placeholder="在此输入详细的提示词（支持 Markdown 语法）..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <DialogClose asChild>
                            <Button variant="outline" className="gap-2">
                                <X className="w-4 h-4" /> 取消
                            </Button>
                        </DialogClose>
                        <Button onClick={handleSave} className="bg-banana-400 hover:bg-banana-500 text-gray-900 gap-2">
                            <Save className="w-4 h-4" /> 确认保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
