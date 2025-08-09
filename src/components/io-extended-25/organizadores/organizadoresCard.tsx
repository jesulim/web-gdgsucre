import { Card, CardContent } from "@/components/ui/card"
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useEffect, useState } from "react"

interface Organizador {
  id: number
  first_name: string
  last_name: string
  image: string
}

export function OrganizadoresCarousel({ organizers }: { organizers: Organizador[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
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
    }, 3000)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="w-full h-full max-w-6xl mx-auto ">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {organizers.map(organizador => (
            <CarouselItem
              key={organizador.id}
              className="max-w-64 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <Card className="bg-black rounded-3xl overflow-hidden p-4">
                <CardContent className="flex flex-col items-center justify-center p-4 text-white">
                  {/* Imagen circular con borde */}
                  <div className="relative mb-4">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-r from-blue-500 to-green-500 p-1">
                      <img
                        src={organizador.image}
                        alt={organizador.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <p className="text-lg text-nowrap font-medium text-center mt-1">
                    {organizador.first_name}
                    <br />
                    {organizador.last_name}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicadores de puntos */}
      <div className="flex flex-wrap justify-center mt-4 gap-2">
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
