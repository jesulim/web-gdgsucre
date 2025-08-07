import * as React from "react"

import CarlosAlarconImg from "@/assets/io-extended-25/speakers/Carlos-Alarcon.webp"

import { Card, CardContent } from "../../ui/card"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel"

interface Organizador {
  id: number
  name: string
  specialty: string
  image: string
  socialLinks: {
    website?: string
    linkedin?: string
    github?: string
  }
}

// Función para obtener el color de cada palabra según el área
function getWordColor(palabra: string): string {
  const texto = palabra.toLowerCase()

  if (texto.includes("marketing")) {
    return "text-red-400"
  }

  if (texto.includes("web") || texto.includes("logística") || texto.includes("logistica")) {
    return "text-blue-400"
  }

  if (texto.includes("diseño") || texto.includes("diseno")) {
    return "text-green-400"
  }

  if (texto.includes("escenografía") || texto.includes("escenografia")) {
    return "text-yellow-400"
  }

  if (texto.includes("audiovisual")) {
    return "text-red-400"
  }

  return "text-white"
}

// Componente para renderizar texto con colores sin dangerouslySetInnerHTML
function ColoredSpecialty({ specialty }: { specialty: string }) {
  const words = specialty.split(" ")

  return (
    <p className="text-sm text-center mb-4 font-bold">
      {words.map((palabra, index) => (
        <span key={`word-${palabra}-${words.length}-${index}`} className={getWordColor(palabra)}>
          {palabra}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  )
}

// Datos de ejemplo - reemplaza con los datos reales
const organizadores: Organizador[] = [
  {
    id: 1,
    name: "Jhamil Crespo",
    specialty: "Marketing",
    image: CarlosAlarconImg.src, // Asegúrate de que la imagen esté en public/
    socialLinks: {
      website: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 2,
    name: "Jhamil Crespo",
    specialty: "Web & Diseño",
    image: CarlosAlarconImg.src,
    socialLinks: {
      website: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 3,
    name: "Jhamil Crespo",
    specialty: "Logística & Escenografía",
    image: CarlosAlarconImg.src,
    socialLinks: {
      website: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 4,
    name: "Jhamil Crespo",
    specialty: "Logística & Escenografía",
    image: CarlosAlarconImg.src,
    socialLinks: {
      website: "#",
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: 5,
    name: "Aly Danner",
    specialty: "Logística & Escenografía",
    image: CarlosAlarconImg.src,
    socialLinks: {
      website: "#",
      linkedin: "#",
      github: "#",
    },
  },
]

export function OrganizadoresCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })

    // AutoPlay - avanzar cada 3 segundos
    const interval = setInterval(() => {
      if (api) {
        api.scrollNext()
      }
    }, 2000)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {organizadores.map(organizador => (
            <CarouselItem
              key={organizador.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="p-1">
                <Card className="bg-[#202124] border-0 shadow-black shadow-xs rounded-3xl overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-4 text-white">
                    {/* Imagen circular con borde */}
                    <div className="relative mb-4">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 to-green-400 p-1">
                        <img
                          src={organizador.image}
                          alt={organizador.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Nombre */}
                    <h3 className="text-lg font-semibold text-center mb-1">{organizador.name}</h3>

                    {/* Area - Usando componente seguro */}
                    <ColoredSpecialty specialty={organizador.specialty} />

                    {/* Iconos de redes sociales */}
                    <div className="flex gap-3">
                      {organizador.socialLinks.website && (
                        <a
                          href={organizador.socialLinks.website}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Sitio web"
                        >
                          <span className="sr-only">Sitio web</span>
                          <svg
                            className="w-4 h-4 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <title>Sitio web</title>
                            <path
                              fillRule="evenodd"
                              d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      )}
                      {organizador.socialLinks.linkedin && (
                        <a
                          href={organizador.socialLinks.linkedin}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                        >
                          <span className="sr-only">LinkedIn</span>
                          <svg
                            className="w-4 h-4 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <title>LinkedIn</title>
                            <path
                              fillRule="evenodd"
                              d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      )}
                      {organizador.socialLinks.github && (
                        <a
                          href={organizador.socialLinks.github}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub"
                        >
                          <span className="sr-only">GitHub</span>
                          <svg
                            className="w-4 h-4 text-gray-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <title>GitHub</title>
                            <path
                              fillRule="evenodd"
                              d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicadores de puntos */}
      <div className="flex justify-center mt-4 gap-2">
        {organizadores.slice(0, count).map((_, index) => (
          <button
            key={`carousel-dot-${organizadores[index]?.id || index}`}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index + 1 === current ? "bg-blue-500 w-6" : "bg-gray-400 hover:bg-gray-300"
            }`}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
