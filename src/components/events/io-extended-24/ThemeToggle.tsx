import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const applyToggle = () => {
      const isCurrentlyDark = document.documentElement.classList.contains("dark")
      if (isCurrentlyDark) {
        document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", "light")
        setIsDark(false)
      } else {
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
        setIsDark(true)
      }
    }

    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => { ready?: Promise<void> }
    }

    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(applyToggle)
    } else {
      applyToggle()
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1.5 text-black dark:text-white hover:opacity-75 transition-opacity rounded-lg focus:outline-none"
      title="Cambiar tema"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path
          d="M16.002 2.66669L19.5153 6.18002H25.82V12.484L29.3333 15.9974L25.82 19.516V25.82H19.516L16.0026 29.3334L12.484 25.82H6.17996V19.516L2.66663 15.998L6.17996 12.4847V6.18002H12.484L16.002 2.66669Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.9999 11.3334C17.9999 16.6667 14.6666 17.3334 11.3333 17.3334C11.3333 20 15.6666 22.6667 19.3333 20C22.9999 17.3334 20.6666 11.3334 17.9999 11.3334Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
