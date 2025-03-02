import { Moon, Sun, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useTheme } from "~/components/ThemeProvider";
import { cn } from "~/lib/utils";

/**
 * Theme toggle component for switching between light, dark, and system themes
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0 cursor-pointer">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-between cursor-pointer",
            theme === "light" && "font-medium"
          )}
        >
          Light
          {theme === "light" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-between cursor-pointer",
            theme === "dark" && "font-medium"
          )}
        >
          Dark
          {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-between cursor-pointer",
            theme === "system" && "font-medium"
          )}
        >
          System
          {theme === "system" && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 