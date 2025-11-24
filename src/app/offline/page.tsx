"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const handleRetry = () => {
        if (navigator.onLine) {
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {isOnline ? "页面未找到" : "您当前处于离线状态"}
                </h1>

                <p className="text-gray-600 mb-6">
                    {isOnline
                        ? "抱歉，您访问的页面不存在。"
                        : "请检查您的网络连接，然后重试。"}
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleRetry}
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-medium py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        {isOnline ? "返回首页" : "重试连接"}
                    </button>

                    {!isOnline && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>离线模式</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        💡 提示：已缓存的页面可以在离线时访问
                    </p>
                </div>
            </div>
        </div>
    );
}
