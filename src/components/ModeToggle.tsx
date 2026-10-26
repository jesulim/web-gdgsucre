import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

// Animation constants
const STYLE_ID = "astro-theme-toggle-temporary-styles"
const STYLE_CONTENT =
  "::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }"

interface ThemeTransition {
  ready: Promise<void>
  finished: Promise<void>
  skipTransition: () => void
}

let activeTransition: ThemeTransition | undefined

function removeTemporaryStyles() {
  const style = document.getElementById(STYLE_ID)
  style?.remove()
}

function injectTemporaryStyles() {
  removeTemporaryStyles()
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = STYLE_CONTENT
  document.head.appendChild(style)
}

async function startCircleAnimation(callback: () => void, x: number, y: number) {
  const doc = document as unknown as {
    startViewTransition?: (updateCallback: () => void) => ThemeTransition
  }

  if (
    typeof doc.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    callback()
    return
  }

  activeTransition?.skipTransition()
  injectTemporaryStyles()

  const transition = doc.startViewTransition(() => {
    callback()
  })

  activeTransition = transition
  try {
    await transition.ready
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 300,
        easing: "cubic-bezier(0.2, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  } catch {
    // A superseded or unsupported animation must not prevent the theme update.
    transition.skipTransition()
  } finally {
    await transition.finished.catch(() => {})
    if (activeTransition === transition) {
      activeTransition = undefined
      removeTemporaryStyles()
    }
  }
}

export function ModeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Initialize theme based on document class on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = (event: React.MouseEvent) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    void startCircleAnimation(
      () => {
        setIsDark(document.documentElement.classList.toggle("dark"))
      },
      event.detail === 0 ? bounds.left + bounds.width / 2 : event.clientX,
      event.detail === 0 ? bounds.top + bounds.height / 2 : event.clientY
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

// También exportamos como ThemeToggle por si acaso se requiere en el futuro
export const ThemeToggle = ModeToggle
