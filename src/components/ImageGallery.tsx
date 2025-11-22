"use client";

import { useState } from "react";
import { Download, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratedImage } from "@/lib/gemini-client";
import { downloadImage } from "@/lib/image-utils";

interface ImageGalleryProps {
    images: GeneratedImage[];
    textResponse: string;
    loading: boolean;
}

export function ImageGallery({ images, textResponse, loading }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="aspect-square bg-banana-50 rounded-lg animate-pulse border border-banana-100"
                        />
                    ))}
                </div>
                <div className="h-24 bg-gray-50 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (images.length === 0 && !textResponse) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p>生成的图像将显示在这里</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                生成结果
                {images.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                        {images.length} 张图像
                    </span>
                )}
            </h3>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    {images.map((img, index) => (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 bg-white">
                                    <img
                                        src={img.url}
                                        alt={`Generated ${index + 1}`}
                                        className="w-full h-auto object-contain bg-gray-50 aspect-square"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Maximize2 className="text-white w-6 h-6 drop-shadow-md" />
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-1 bg-transparent border-none shadow-none">
                                <DialogTitle className="sr-only">查看大图</DialogTitle>
                                <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                                    <img
                                        src={img.url}
                                        alt={`Generated ${index + 1}`}
                                        className="w-full h-auto max-h-[80vh] object-contain"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-end">
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadImage(img.url, `gemini-generated-${Date.now()}-${index}.png`);
                                            }}
                                            className="bg-white text-gray-900 hover:bg-gray-100"
                                            size="sm"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            下载原图
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            )}

            {/* Text Response */}
            {textResponse && (
                <Card className="p-4 bg-white border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">文本响应</h4>
                    <ScrollArea className="h-[150px] w-full rounded-md border p-2 bg-gray-50 text-sm text-gray-800">
                        <pre className="whitespace-pre-wrap font-sans">{textResponse}</pre>
                    </ScrollArea>
                </Card>
            )}
        </div>
    );
}
