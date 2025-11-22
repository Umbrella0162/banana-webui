"use client";

import { useState } from "react";
import { Download, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratedImage } from "@/lib/gemini-client";
import { downloadImage } from "@/lib/image-utils";

interface ImageGalleryProps {
    images: GeneratedImage[];
    textResponse: string;
    loading: boolean;
    numImages?: number;
}

export function ImageGallery({ images, textResponse, loading, numImages = 4 }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: numImages }).map((_, i) => (
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
                        <div
                            key={index}
                            className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 bg-white"
                            onClick={() => {
                                setSelectedImage(img);
                            }}
                        >
                            <img
                                src={img.url}
                                alt={`Generated ${index + 1}`}
                                className="w-full h-auto object-contain bg-gray-50 aspect-square"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="text-white w-6 h-6 drop-shadow-md" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                {selectedImage && (
                    <DialogContent showCloseButton={false} className="max-w-none sm:max-w-none w-screen h-screen max-h-screen p-0 bg-black/20 backdrop-blur-sm border-none shadow-none flex flex-col items-center justify-center">
                        <DialogTitle className="sr-only">查看大图</DialogTitle>
                        <div
                            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImage(null)}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 z-50 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(null);
                                }}
                            >
                                <X className="w-6 h-6" />
                                <span className="sr-only">关闭</span>
                            </Button>
                            <img
                                src={selectedImage.url}
                                alt="Full screen preview"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-end">
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadImage(selectedImage.url, `gemini-generated-${Date.now()}.png`);
                                    }}
                                    className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                                    size="sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    下载原图
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>

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
