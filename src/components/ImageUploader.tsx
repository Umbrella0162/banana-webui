"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    images: File[];
    setImages: (images: File[]) => void;
    disabled?: boolean;
    maxImages?: number;
    enableCompression?: boolean;
    setEnableCompression?: (value: boolean) => void;
}

export function ImageUploader({
    images,
    setImages,
    disabled,
    maxImages = 14,
    enableCompression = true,
    setEnableCompression
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(file =>
                file.type.startsWith("image/")
            );
            addFiles(newFiles);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            addFiles(newFiles);
        }
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const addFiles = (newFiles: File[]) => {
        // Limit total images to maxImages
        const totalImages = images.length + newFiles.length;
        if (totalImages > maxImages) {
            alert(`最多只能上传 ${maxImages} 张参考图像`);
            const allowedCount = maxImages - images.length;
            if (allowedCount > 0) {
                setImages([...images, ...newFiles.slice(0, allowedCount)]);
            }
        } else {
            setImages([...images, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        if (disabled) return;
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    // Sorting Logic
    const dragItem = useRef<number | null>(null);
    const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

    const handleSortStart = (e: React.DragEvent, position: number) => {
        if (disabled) return;
        dragItem.current = position;
        setActiveDragIndex(position);
        // e.dataTransfer.effectAllowed = "move";
    };

    const handleSortEnter = (e: React.DragEvent, position: number) => {
        if (disabled) return;
        e.preventDefault();

        // Use ref for logic to avoid closure staleness issues during rapid events
        if (dragItem.current !== null && dragItem.current !== position) {
            const newImages = [...images];
            const draggedItemContent = newImages[dragItem.current];
            newImages.splice(dragItem.current, 1);
            newImages.splice(position, 0, draggedItemContent);

            setImages(newImages);
            dragItem.current = position;
            setActiveDragIndex(position);
        }
    };

    const handleSortEnd = () => {
        dragItem.current = null;
        setActiveDragIndex(null);
    };

    return (
        <div className="space-y-2">
            {/* Header with label and compression toggle */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">参考图像 (可选)</Label>
                {setEnableCompression && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="compress-toggle" className="text-xs text-gray-600 cursor-pointer">
                            压缩图片
                        </Label>
                        <Switch
                            id="compress-toggle"
                            checked={enableCompression}
                            onCheckedChange={setEnableCompression}
                            disabled={disabled}
                            className="data-[state=checked]:bg-banana-400"
                        />
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div
                onClick={() => !disabled && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center min-h-[120px]",
                    isDragging ? "border-banana-400 bg-banana-50" : "border-gray-300 hover:border-banana-300 bg-white",
                    disabled && "opacity-50 cursor-not-allowed hover:border-gray-300"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={disabled}
                />
                <Upload className={cn("w-8 h-8 mb-2", isDragging ? "text-banana-500" : "text-gray-400")} />
                <p className="text-sm text-gray-600 text-center">
                    拖拽图像到此处或点击上传
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                    支持 JPG, PNG, WEBP (最多{maxImages}张)
                </p>
            </div>

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {images.map((file, index) => (
                        <div
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            className={cn(
                                "relative group aspect-square cursor-move transition-all duration-200 ease-in-out active:scale-95",
                                disabled && "cursor-not-allowed opacity-75",
                                activeDragIndex === index && "opacity-50 scale-95 ring-2 ring-banana-400 ring-offset-2"
                            )}
                            draggable={!disabled}
                            onDragStart={(e) => handleSortStart(e, index)}
                            onDragEnter={(e) => handleSortEnter(e, index)}
                            onDragEnd={handleSortEnd}
                            onDragOver={(e) => e.preventDefault()} // Necessary for onDrop/onDragEnter to work smoothly
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`preview ${index}`}
                                className="w-full h-full object-cover rounded-md border border-gray-200 pointer-events-none select-none"
                                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                            />
                            <div className={cn(
                                "absolute top-1 left-1 text-white text-xs px-1.5 py-0.5 rounded-md transition-opacity pointer-events-none opacity-0 group-hover:opacity-100",
                                index === 0 ? "bg-black/60 font-medium" : "bg-black/50"
                            )}>
                                {index === 0 ? "主参考" : index + 1}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                disabled={disabled}
                                className="
                  absolute top-1 right-1
                  bg-red-500 text-white rounded-full
                  w-5 h-5 flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity shadow-sm
                  hover:bg-red-600
                "
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
