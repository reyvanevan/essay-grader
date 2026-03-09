"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    LayoutDashboard,
    Settings,
    FileText,
    BarChart3,
    Sparkles,
    ChevronRight,
    LogOut,
    User
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Assignments",
        url: "/dashboard/assignments",
        icon: BookOpen,
    },
    {
        title: "Submissions",
        url: "/dashboard/submissions",
        icon: FileText,
    },
    {
        title: "Reports & Analysis",
        url: "/dashboard/reports",
        icon: BarChart3,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-black/[0.04]">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-b from-[#333] to-[#000] text-white shadow-[0_2px_10px_0_rgba(0,0,0,0.06)]">
                                <Sparkles className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold text-[#111] tracking-wide">KROMIA</span>
                                <span className="truncate text-[11px] text-[#888] font-medium tracking-widest uppercase">Eval Engine</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[#888] font-medium text-[12px] uppercase tracking-wider mb-1">Menu Utama</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        render={<a href={item.url} />}
                                        className={`transition-colors flex items-center gap-2 ${isActive
                                            ? "bg-black/[0.06] text-[#111] font-semibold"
                                            : "text-[#555] font-medium hover:text-[#111] hover:bg-black/[0.04]"
                                            }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="text-[14px]">{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                />
                            }>
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src="/avatar.jpg" alt="Lecturer" />
                                    <AvatarFallback className="rounded-lg">RP</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium text-[#111]">M Reyvan Purnama</span>
                                    <span className="truncate text-xs text-[#555]">Lecturer</span>
                                </div>
                                <ChevronRight className="ml-auto size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="/avatar.jpg" alt="Lecturer" />
                                            <AvatarFallback className="rounded-lg">RP</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium text-[#111]">M Reyvan Purnama</span>
                                            <span className="truncate text-xs text-[#555]">reyvan@umb.ac.id</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 size-4" />
                                    Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 size-4" />
                                    Pengaturan
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
