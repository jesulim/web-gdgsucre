import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

// Animation constants
const STYLE_ID = 'astro-theme-toggle-temporary-styles'
const STYLE_CONTENT =
  '::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }'

function removeTemporaryStyles() {
  const style = document.getElementById(STYLE_ID)
  style?.remove()
}

function injectTemporaryStyles() {
  removeTemporaryStyles()
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = STYLE_CONTENT
  document.head.appendChild(style)
}

async function startCircleAnimation(
  callback: () => void,
  x: number,
  y: number,
) {
  const doc = document as unknown as {
    startViewTransition?: (updateCallback?: () => unknown) => {
      ready?: Promise<void>
      finished?: Promise<void>
    }
  }

  if (typeof doc.startViewTransition !== 'function') {
    callback()
    return
  }

  injectTemporaryStyles()

  const transition = doc.startViewTransition(() => {
    callback()
  })

  await transition?.ready
  void transition?.finished?.then(removeTemporaryStyles)

  const gradientOffset = 0.7
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><defs><radialGradient id="toggle-theme-gradient"><stop offset="${gradientOffset}"/><stop offset="1" stop-opacity="0"/></radialGradient></defs><circle cx="4" cy="4" r="4" fill="url(#toggle-theme-gradient)"/></svg>`
  const maskUrl = `data:image/svg+xml;base64,${window.btoa(maskSvg)}`

  const w = window.innerWidth
  const h = window.innerHeight

  const maxRadius = Math.ceil(
    Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) / gradientOffset,
  )

  document.documentElement.animate(
    {
      maskImage: [`url('${maskUrl}')`, `url('${maskUrl}')`],
      maskRepeat: ['no-repeat', 'no-repeat'],
      maskPosition: [`${x}px ${y}px`, `${x - maxRadius}px ${y - maxRadius}px`],
      maskSize: ['0', `${2 * maxRadius}px`],
    },
    {
      duration: 500,
      easing: 'ease-in',
      pseudoElement: '::view-transition-new(root)',
    },
  )
}

// Export with the name ModeToggle to match what Astro is expecting
export function ModeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Initialize theme based on document class on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  // Update document class when theme changes
  useEffect(() => {
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
  }, [isDark])

  const toggleTheme = (event: React.MouseEvent) => {
    startCircleAnimation(() => {
      setIsDark(prevDark => !prevDark)
    }, event.clientX, event.clientY)
  }

  return (
    <Button 
      variant="outline" 
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
export const ThemeToggle = ModeToggle;