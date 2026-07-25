import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Settings, LogOut, Wifi, WifiOff, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  isOnline?: boolean;
}

const Header = ({ isOnline = true }: HeaderProps) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New hearing scheduled",
      description: "Smith v. Johnson case hearing on 10/15/2026",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Document ready for review",
      description: "Legal brief for Williams v. Tech Corp is ready",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      title: "Compliance alert",
      description: "New regulations affecting your active documents",
      time: "3 days ago",
      read: true,
    },
  ]);

  const isMobile = useIsMobile();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="fixed top-0 right-0 left-0 bg-black/40 backdrop-blur-md border-b border-white/[0.06] z-30">
      <div
        className={`flex h-20 items-center justify-between px-6 md:px-8 transition-all ${
          isMobile ? "ml-0" : "ml-64"
        }`}
      >
        {/* Sleek Search trigger styling */}
        <div className="flex items-center">
          <button 
            onClick={() => {
              const e = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              document.dispatchEvent(e);
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:bg-white/[0.08] hover:text-white transition-all text-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Command Menu</span>
            <kbd className="inline-flex h-4 select-none items-center gap-0.5 rounded bg-white/[0.08] px-1 font-mono text-[9px] font-medium text-muted-foreground ml-2">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Online/Offline Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
            <span className="text-muted-foreground/80 font-mono text-2xs uppercase tracking-wider">
              {isOnline ? "System Sync Active" : "Offline Mode"}
            </span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-white hover:bg-white/[0.05] rounded-lg transition-all"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card/95 border-white/[0.08] text-foreground backdrop-blur-md">
              <DropdownMenuLabel className="flex items-center justify-between font-sans text-sm">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    className="text-xs h-auto p-1 text-primary hover:text-white hover:bg-transparent"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start py-2.5 px-3 focus:bg-white/[0.04] cursor-pointer ${
                      !notification.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{notification.title}</div>
                    <div className="text-2xs text-muted-foreground/90 mt-0.5 leading-relaxed">
                      {notification.description}
                    </div>
                    <div className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
                      {notification.time}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem asChild className="focus:bg-white/[0.04]">
                <Link to="/dashboard" className="w-full text-center text-xs font-semibold text-primary hover:text-white cursor-pointer py-1">
                  View all in Command Center
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-white/[0.05]"
              >
                <Avatar className="h-9 w-9 border border-white/[0.1]">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-sans text-xs">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 border-white/[0.08] text-foreground backdrop-blur-md w-48">
              <DropdownMenuLabel className="font-sans text-sm">John Doe</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem className="focus:bg-white/[0.04] cursor-pointer">
                <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/[0.04] cursor-pointer">
                <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem className="focus:bg-white/[0.04] text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2.5 h-4 w-4" />
                <span className="text-xs">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
