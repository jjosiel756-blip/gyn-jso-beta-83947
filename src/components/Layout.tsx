import { Navbar } from "./Navbar";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeSelector } from "./ThemeSelector";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Navbar />
        
        {/* Theme selector no canto superior direito */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeSelector />
        </div>
        
        <main className="pb-20 md:pb-4 md:pt-20">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}