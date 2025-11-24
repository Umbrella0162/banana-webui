"use client";

import { useState, useEffect } from "react";
import { Download, Maximize2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GeneratedImage } from "@/lib/gemini-client";
import { downloadImage } from "@/lib/image-utils";
import ReactMarkdown from "react-markdown";

interface ImageGalleryProps {
    images: GeneratedImage[];
    textResponse: string;
    loading: boolean;
    numImages?: number;
}

export function ImageGallery({ images, textResponse, loading, numImages = 4 }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (zoom > 1) {
                e.preventDefault();
                const newX = e.clientX - dragStart.x;
                const newY = e.clientY - dragStart.y;
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            setIsDragging(false);

            // Bounce back logic
            if (zoom > 1) {
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;

                const img = document.querySelector('.zoomable-image') as HTMLImageElement;
                if (img) {
                    const rect = img.getBoundingClientRect();
                    const currentWidth = rect.width;
                    const currentHeight = rect.height;

                    // Calculate the final position based on the mouse up event
                    const currentX = e.clientX - dragStart.x;
                    const currentY = e.clientY - dragStart.y;

                    let newX = currentX;
                    let newY = currentY;

                    // Horizontal Bounds
                    if (currentWidth <= containerWidth) {
                        newX = 0;
                    } else {
                        const maxOffset = (currentWidth - containerWidth) / 2;
                        if (newX > maxOffset) newX = maxOffset;
                        if (newX < -maxOffset) newX = -maxOffset;
                    }

                    // Vertical Bounds
                    if (currentHeight <= containerHeight) {
                        newY = 0;
                    } else {
                        const maxOffset = (currentHeight - containerHeight) / 2;
                        if (newY > maxOffset) newY = maxOffset;
                        if (newY < -maxOffset) newY = -maxOffset;
                    }

                    // Always update position to ensure it snaps to bounds or stays at the final drag position
                    setPosition({ x: newX, y: newY });
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, zoom, dragStart]);

    // Reset zoom and position when opening a new image
    useEffect(() => {
        if (selectedImage) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setPosition({ x: 0, y: 0 });
        }
    }, [selectedImage]);

    // Clamp position when zooming out
    useEffect(() => {
        if (zoom > 1) {
            const img = document.querySelector('.zoomable-image') as HTMLImageElement;
            if (img) {
                const rect = img.getBoundingClientRect();
                const containerWidth = window.innerWidth;
                const containerHeight = window.innerHeight;
                const currentWidth = rect.width;
                const currentHeight = rect.height;

                let newX = position.x;
                let newY = position.y;

                if (currentWidth <= containerWidth) {
                    newX = 0;
                } else {
                    const maxOffset = (currentWidth - containerWidth) / 2;
                    if (newX > maxOffset) newX = maxOffset;
                    if (newX < -maxOffset) newX = -maxOffset;
                }

                if (currentHeight <= containerHeight) {
                    newY = 0;
                } else {
                    const maxOffset = (currentHeight - containerHeight) / 2;
                    if (newY > maxOffset) newY = maxOffset;
                    if (newY < -maxOffset) newY = -maxOffset;
                }

                if (newX !== position.x || newY !== position.y) {
                    setPosition({ x: newX, y: newY });
                }
            }
        } else {
            // Reset position if zoom is 1 or less
            if (position.x !== 0 || position.y !== 0) {
                setPosition({ x: 0, y: 0 });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [zoom]);

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
                <div className={`grid gap-4 ${numImages <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {Array.from({ length: numImages }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-banana-50 rounded-lg animate-pulse border border-banana-100"
                        />
                    ))}
                </div>
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
                <div className={`grid gap-4 ${images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 bg-white"
                            onClick={() => {
                                setSelectedImage(img);
                            }}
                        >
                            {img.isTextOnly ? (
                                <div className="w-full aspect-square bg-banana-50 p-4 flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-2 text-banana-600 mb-2">
                                        <FileText className="w-5 h-5" />
                                        <span className="text-sm font-medium">文本响应</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative">
                                        <div className="text-sm text-gray-600 line-clamp-[8] font-sans prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-banana-600 prose-code:text-banana-700 prose-code:bg-banana-100 prose-code:px-1 prose-code:rounded">
                                            <ReactMarkdown>{img.text || ''}</ReactMarkdown>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-banana-50 to-transparent" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={img.url}
                                        alt={`Generated ${index + 1}`}
                                        className="w-full h-auto object-contain bg-gray-50 aspect-square"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Maximize2 className="text-white w-6 h-6 drop-shadow-md" />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedImage} onOpenChange={(open) => {
                if (!open) {
                    setSelectedImage(null);
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                }
            }}>
                {selectedImage && (
                    <DialogContent showCloseButton={false} className="max-w-none sm:max-w-none w-screen h-screen max-h-screen p-0 bg-black/20 backdrop-blur-sm border-none shadow-none flex flex-col items-center justify-center">
                        <DialogTitle className="sr-only">查看详情</DialogTitle>
                        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                            {/* Previous Navigation Area */}
                            {images.length > 1 && (
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-24 z-40 flex items-center justify-center group/nav cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-black/40 hover:to-transparent"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentIndex = images.findIndex(img => img === selectedImage);
                                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                                        setSelectedImage(images[prevIndex]);
                                        setZoom(1);
                                        setPosition({ x: 0, y: 0 });
                                    }}
                                >
                                    <div className="opacity-0 -translate-x-4 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 transition-all duration-300 ease-out p-2">
                                        <svg className="w-10 h-10 text-white/90 drop-shadow-lg filter" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>
                                    <span className="sr-only">上一张</span>
                                </div>
                            )}

                            {/* Next Navigation Area */}
                            {images.length > 1 && (
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-24 z-40 flex items-center justify-center group/nav cursor-pointer transition-all duration-300 hover:bg-gradient-to-l hover:from-black/40 hover:to-transparent"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentIndex = images.findIndex(img => img === selectedImage);
                                        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                                        setSelectedImage(images[nextIndex]);
                                        setZoom(1);
                                        setPosition({ x: 0, y: 0 });
                                    }}
                                >
                                    <div className="opacity-0 translate-x-4 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 transition-all duration-300 ease-out p-2">
                                        <svg className="w-10 h-10 text-white/90 drop-shadow-lg filter" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <span className="sr-only">下一张</span>
                                </div>
                            )}

                            {/* Image - only show if not text-only */}
                            {!selectedImage.isTextOnly && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center p-16"
                                    style={{
                                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                                        zIndex: 10
                                    }}
                                    onMouseDown={(e) => {
                                        if (zoom > 1) {
                                            setIsDragging(true);
                                            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
                                        }
                                    }}
                                    onClick={() => {
                                        if (!isDragging && zoom === 1) {
                                            setSelectedImage(null);
                                        }
                                    }}
                                    onWheel={(e) => {
                                        e.preventDefault();
                                        const delta = e.deltaY > 0 ? -0.25 : 0.25;
                                        setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={selectedImage.url}
                                        alt="Full screen preview"
                                        className="zoomable-image max-w-full max-h-full object-contain transition-transform select-none"
                                        style={{
                                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                                        }}
                                        draggable={false}
                                    />
                                </div>
                            )}

                            {/* Text Section - Overlay Mode - Can overlap bottom controls */}
                            {selectedImage.text && (
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-6 pt-6 pb-6"
                                    style={{ zIndex: 41 }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ScrollArea className="h-[240px] w-full">
                                        <div className="pr-4 relative pb-16">
                                            <h4 className="text-sm font-semibold text-white/90 mb-2">
                                                {selectedImage.text &&
                                                    (selectedImage.text.includes("API 请求失败") || selectedImage.text.includes("请求异常") || selectedImage.text.includes("空响应"))
                                                    ? "错误信息"
                                                    : "文本响应"
                                                }
                                            </h4>
                                            <div className="text-sm text-white/90 font-sans prose prose-sm prose-invert max-w-none prose-headings:text-white prose-p:text-white/90 prose-a:text-banana-300 prose-strong:text-white prose-code:text-banana-200 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-white/10 prose-pre:border prose-pre:border-white/20">
                                                <ReactMarkdown>{selectedImage.text}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {/* Bottom Control Bar - Glassmorphism Style */}
                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Zoom controls - only show for images */}
                                {!selectedImage.isTextOnly && (
                                    <>
                                        {/* Zoom Out */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                                            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.5))}
                                            disabled={zoom <= 0.5}
                                            title="缩小"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                            </svg>
                                        </Button>

                                        {/* Reset Zoom and Position */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                                            onClick={() => {
                                                setZoom(1);
                                                setPosition({ x: 0, y: 0 });
                                            }}
                                            disabled={zoom === 1 && position.x === 0 && position.y === 0}
                                            title="重置位置和缩放"
                                        >
                                            <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
                                        </Button>

                                        {/* Zoom In */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                                            onClick={() => setZoom(prev => Math.min(3, prev + 0.5))}
                                            disabled={zoom >= 3}
                                            title="放大"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                            </svg>
                                        </Button>

                                        {/* Divider */}
                                        <div className="h-6 w-px bg-white/30 mx-1" />

                                        {/* Download */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                                            onClick={() => {
                                                downloadImage(selectedImage.url, `gemini-generated-${Date.now()}.png`);
                                            }}
                                            title="下载"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>

                                        {/* Divider */}
                                        <div className="h-6 w-px bg-white/30 mx-1" />
                                    </>
                                )}

                                {/* Close Button - always show */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(null);
                                    }}
                                    title="关闭"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}


