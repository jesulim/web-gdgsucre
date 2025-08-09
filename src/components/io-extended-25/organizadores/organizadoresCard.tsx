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
  first_name: string
  last_name: string
  image: string
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

export function OrganizadoresCarousel({ organizers }: { organizers: Organizador[] }) {
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
    <div className="w-full h-full max-w-6xl mx-auto px-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {organizers.map(organizador => (
            <CarouselItem
              key={organizador.id}
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Card className="bg-black border-0  rounded-3xl overflow-hidden p-4">
                <CardContent className="flex flex-col items-center justify-center p-4 text-white">
                  {/* Imagen circular con borde */}
                  <div className="relative mb-4">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-r from-blue-500 to-green-400 p-1">
                      <img
                        src={organizador.image}
                        alt={organizador.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-center mb-1">
                    {organizador.first_name}
                  </h3>
                  <h3 className="text-base font-semibold text-center mb-1">
                    {organizador.last_name}
                  </h3>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicadores de puntos */}
      <div className="flex justify-center mt-4 gap-2">
        {organizers.slice(0, count).map((_, index) => (
          <button
            key={`carousel-dot-${organizers[index]?.id || index}`}
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
