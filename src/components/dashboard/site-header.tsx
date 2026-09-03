"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Settings, Sun, Moon, LogOut, User as UserIcon, CreditCard, KeyRound } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const notifIcon: Record<string, string> = {
  pipeline_started: "🚀", pipeline_complete: "✅", pipeline_failed: "❌",
  agent_created: "🤖", agent_deleted: "🗑️", api_key_added: "🔑",
  api_key_deleted: "⚠️", user_registered: "👤", system_alert: "🔔",
};

export function SiteHeader() {
  const { isDark, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data.count || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    setNotifLoading(true);
    try {
      const res = await api.get("/notifications?limit=8");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    setNotifLoading(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await api.post("/auth/logout"); } catch {}
    clearAuth();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    setLoggingOut(false);
    setLogoutOpen(false);
    router.push("/");
  };

  const initials = (user?.name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/dashboard/settings" />} aria-label="Settings">
          <Settings className="size-4" />
        </Button>

        <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />}
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-1.5 rounded-full bg-destructive" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground">{unreadCount} new</span>}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {notifLoading ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n._id}
                  className="flex-col items-start gap-0.5"
                  onClick={() => !n.isRead && markAsRead(n._id)}
                >
                  <span className="flex w-full items-center gap-1.5 text-sm font-medium">
                    <span>{n.icon || notifIcon[n.type] || "🔔"}</span>
                    <span className="flex-1 truncate">{n.title}</span>
                    {!n.isRead && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">{n.message}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/notifications" />} className="justify-center text-sm font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="ml-1 rounded-full" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
                <Avatar className="size-9">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{user?.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
              <UserIcon /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
              <CreditCard /> Billing
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/settings?tab=security" />}>
              <KeyRound /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setLogoutOpen(true)}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>You will be signed out of your LogicMate account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Signing out…" : "Sign out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
