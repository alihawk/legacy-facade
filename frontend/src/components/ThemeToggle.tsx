import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  currentTheme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  isSpooky?: boolean
}

export function ThemeToggle({ currentTheme, onThemeChange, isSpooky = false }: ThemeToggleProps) {
  const toggleTheme = () => {
    onThemeChange(currentTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`gap-2 px-3 ${isSpooky ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/50' : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'}`}
    >
      {currentTheme === 'dark' ? (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline">Spooky</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline">Light</span>
        </>
      )}
    </Button>
  )
}
