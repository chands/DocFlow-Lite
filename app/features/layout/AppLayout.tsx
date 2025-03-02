import { Link } from "react-router";
import { ThemeProvider } from "~/components/ThemeProvider";
import { ThemeToggle } from "~/components/ThemeToggle";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout component
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/home" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              DocFlow Lite
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link 
                to="/documents" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Documents
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            DocFlow Lite &copy; {new Date().getFullYear()} - A browser-based document management application
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
} 