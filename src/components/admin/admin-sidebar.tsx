"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, Users, FileText, ChevronDown, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const menuStructure = [
    {
        group: "Dashboard",
        items: [{ label: "Overview", icon: Home, href: "/admin" }],
    },
    {
        group: "Manajemen",
        items: [
            { label: "User", icon: Users, href: "/admin/user-management" },
            { label: "Konten", icon: FileText, href: "/admin/content-management" },
        ],
        initiallyOpen: true,
    },
];

function SidebarHeader({ onClose }: { onClose?: () => void }) {
    return (
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
            <Link href="/admin" className="group relative flex items-center gap-2">
                <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
                    <Image src="/icon-edu.webp" alt="Admin Logo" width={40} height={40} sizes="(max-width: 768px) 32px, 40px" className="object-contain" />
                    <p className="text-sm text-gray-500 font-medium">Admin Panel</p>
                </div>
            </Link>
            {onClose && (
                <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            )}
        </div>
    );
}

export default function Sidebar({ mobile, onClose }: { mobile: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Dashboard: true,
        Manajemen: true,
    });

    const toggleGroup = (groupName: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    return (
        <div className={cn("bg-white border-r border-gray-200 flex flex-col", mobile ? "h-full w-full" : "h-screen w-64 fixed top-0 left-0 z-50")}>
            <SidebarHeader onClose={onClose} />
            <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
                {menuStructure.map((group) => (
                    <div key={group.group} className="space-y-1">
                        <button
                            onClick={() => toggleGroup(group.group)}
                            className="flex items-center justify-between w-full px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            aria-expanded={openGroups[group.group]}
                            aria-controls={`group-${group.group}`}
                        >
                            <span className="font-medium text-sm uppercase tracking-wider">{group.group}</span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", openGroups[group.group] ? "rotate-0" : "-rotate-90")} />
                        </button>
                        {openGroups[group.group] && (
                            <div id={`group-${group.group}`} className="space-y-1 pl-2">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={mobile ? onClose : undefined}
                                        prefetch
                                        className={cn("flex items-center px-3 py-2 rounded-lg transition-colors", pathname === item.href ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50")}
                                    >
                                        <item.icon className="w-5 h-5 mr-3" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed">
            <div className="px-8 py-5 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-32 bg-gray-200 animate-pulse" />
                    <Skeleton className="h-4 w-20 mt-2 bg-gray-200 animate-pulse" />
                </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-4">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-24 bg-gray-200 animate-pulse" />
                        {[...Array(2)].map((_, j) => (
                            <Skeleton key={j} className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
                        ))}
                    </div>
                ))}
            </nav>
        </div>
    );
}
