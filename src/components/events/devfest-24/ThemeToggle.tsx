import { useEffect, useState } from "react"

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<string>("light")

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")

    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark")
      setTheme(isDarkNow ? "dark" : "light")
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  const handleToggle = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    try {
      localStorage.setItem("theme", nextTheme)
    } catch {
      // Ignore if localStorage unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="px-2 text-black dark:text-white cursor-pointer"
      title="Alternar tema"
      aria-label="Alternar tema claro u oscuro"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Alternar tema</title>
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
export default ThemeToggle
