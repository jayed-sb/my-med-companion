import { NavLink } from "react-router-dom";
import { Home, MessageCircle, FileText, Pill, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/app", icon: Home, label: "Home" },
  { to: "/app/chat", icon: MessageCircle, label: "Chat" },
  { to: "/app/records", icon: FileText, label: "Records" },
  { to: "/app/medicine", icon: Pill, label: "Medicine" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export const Navigation = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all duration-300",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-accent/50"
              )
            }
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-accent/50"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Sign Out</span>
        </Button>
      </div>
    </nav>
  );
};