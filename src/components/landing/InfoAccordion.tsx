import { type JSX, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const items: Record<string, { trigger: string; image: JSX.Element; content: JSX.Element }> = {
  what: {
    trigger: "¿Qué encontrarás?",
    image: <div className="bg-blue-500 min-h-32 h-auto w-auto"></div>,
    content: (
      <p className="text-base">
        Accede a charlas, talleres y actividades para mantenerte al día con las últimas tendencias
        en tecnología. <br />
        Conecta con desarrolladores, estudiantes y profesionales que comparten tus intereses.
      </p>
    ),
  },
  who: {
    trigger: "¿Quién puede ser parte?",
    image: <div className="bg-green-500 min-h-32 h-auto w-auto"></div>,
    content: (
      <p className="text-base">
        GDG está abierto a cualquier persona interesada en la tecnología, no necesitas experiencia
        previa para participar.
      </p>
    ),
  },
  why: {
    trigger: "¿Por qué unirte?",
    image: <div className="bg-yellow-500 min-h-32 h-auto w-auto"></div>,
    content: (
      <p className="text-base">
        Aprender en comunidad es más efectivo, las conexiones generan oportunidades.
        <br />
        El siguiente paso en tu crecimiento profesional puede comenzar aquí.
      </p>
    ),
  },
}

export default function InfoAccordion() {
  const [section, setSection] = useState<string>("what")

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 -mx-4 border-y-2 border-off-white">
      <div className="p-4 md:p-8">{items[section].image}</div>

      <Accordion
        type="single"
        className="border-l-2 border-off-white"
        defaultValue="what"
        onValueChange={setSection}
      >
        {Object.entries(items).map(([section, item]) => (
          <AccordionItem
            key={section}
            value={section}
            className="border-b-2 px-4 last:border-b-0 border-off-white"
          >
            <AccordionTrigger className="font-medium text-base">{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
