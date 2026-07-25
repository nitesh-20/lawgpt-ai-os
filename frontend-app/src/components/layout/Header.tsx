
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, User, Settings, LogOut, Wifi, WifiOff } from "lucide-react";
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
      description: "Smith v. Johnson case hearing on 10/15/2024",
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
      description: "New GDPR regulations affecting your documents",
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
    <header className="fixed top-0 right-0 left-0 bg-background/95 backdrop-blur-sm border-b border-border z-30">
      <div
        className={`flex h-20 items-center justify-between px-4 md:px-8 transition-all ${
          isMobile ? "ml-0" : "ml-64"
        }`}
      >
        <div>
          {/* Search or Breadcrumbs could go here */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Online/Offline Indicator */}
          <div className={`hidden md:flex items-center ${isOnline ? 'text-primary' : 'text-accent'} gap-1.5 text-sm`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-muted transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    className="text-xs h-auto p-1"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="py-4 px-2 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start py-2 ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {notification.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full text-center text-sm font-medium">
                  View all
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-serif">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>John Doe</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
