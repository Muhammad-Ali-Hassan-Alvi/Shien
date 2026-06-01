"use client";



import { useEffect, useRef, useState, useCallback } from "react";

import { Bell, Trash2 } from "lucide-react";

import { useSession } from "next-auth/react";

import { useNotifications } from "@/hooks/useNotifications";

import NotificationItem from "@/components/notifications/NotificationItem";



export default function NotificationDropdown() {

    const { data: session } = useSession();

    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef(null);



    const handleAutoOpen = useCallback(() => {

        setTimeout(() => setIsOpen(true), 500);

        setTimeout(() => setIsOpen(false), 5500);

    }, []);



    const {

        notifications,

        unreadCount,

        markAllRead,

        removeNotification,

        removeAllNotifications,

    } = useNotifications({

        autoOpenOnSale: true,

        onAutoOpen: handleAutoOpen,

    });



    useEffect(() => {

        const handleClickOutside = (event) => {

            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {

                setIsOpen(false);

            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);

    }, []);



    const toggleOpen = () => {

        if (!isOpen) {

            setIsOpen(true);

            if (unreadCount > 0) markAllRead();

        } else {

            setIsOpen(false);

        }

    };



    if (!session) return null;



    return (

        <div className="relative" ref={dropdownRef}>

            <button

                onClick={toggleOpen}

                className="p-2.5 hover:bg-white/50 rounded-full transition-all hover:scale-110 active:scale-95 group relative flex items-center justify-center"

                aria-label="Notifications"

            >

                <Bell

                    className={`w-5 h-5 ${unreadCount > 0 ? "text-red-500 fill-red-500" : "text-gray-700"} group-hover:text-indigo-600 transition-colors`}

                    strokeWidth={2}

                />

                {unreadCount > 0 && (

                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse" />

                )}

            </button>



            {isOpen && (

                <div className="absolute top-full right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">

                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center gap-2">

                        <span className="font-bold text-sm text-gray-900">Notifications</span>

                        <div className="flex items-center gap-2">

                            {unreadCount > 0 && (

                                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full">

                                    {unreadCount} New

                                </span>

                            )}

                            {notifications.length > 0 && (

                                <button

                                    type="button"

                                    onClick={removeAllNotifications}

                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"

                                    title="Clear all"

                                    aria-label="Clear all notifications"

                                >

                                    <Trash2 size={14} />

                                </button>

                            )}

                        </div>

                    </div>

                    <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">

                        {notifications.length === 0 ? (

                            <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">

                                <Bell size={24} className="opacity-20" />

                                No notifications

                            </div>

                        ) : (

                            <div className="divide-y divide-gray-50">

                                {notifications.map((n) => (

                                    <NotificationItem

                                        key={n._id}

                                        notification={n}

                                        onRemove={removeNotification}

                                        onNavigate={() => setIsOpen(false)}

                                        compact

                                    />

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}


