import { AgendaColor, type AgendaSlot } from "./agenda"

export const DEVFEST_26_AGENDA_SLOTS: AgendaSlot[] = [
  {
    time: "08:00 - 08:45",
    title: "Acreditación",
    color: AgendaColor.Green,
  },
  {
    time: "08:45 - 09:00",
    title: "Inauguración del Evento y palabras conmemorativas",
    color: AgendaColor.White,
  },
  {
    time: "09:00 - 09:45",
    speaker: "Sergio Ochoa",
    title: "AI Harnesses: más allá del prompting, ingeniería de software con agentes de IA",
    color: AgendaColor.Yellow,
  },
  {
    time: "09:45 - 10:00",
    title: "Dinámicas y espacio publicitario",
    color: AgendaColor.Blue,
  },
  {
    time: "10:00 - 11:15",
    speaker: "Brian Castillo",
    title: "Build Your Own Jarvis: Real-Time AI with Gemini Live API & Firebase",
    color: AgendaColor.Yellow,
  },
  {
    time: "11:15 - 11:40",
    title: "Refrigerio y Networking",
    color: AgendaColor.Blue,
  },
  {
    time: "11:40 - 12:15",
    speaker: "Yury Camacho",
    title:
      "There Are No Strings on Me: Autonomous Mobile Agents with Direct Silicon Control (AI On-Device)",
    color: AgendaColor.Yellow,
  },
  {
    time: "12:15 - 12:30",
    title: "Dinámicas y espacio publicitario",
    color: AgendaColor.Blue,
  },
  {
    time: "12:30 - 13:15",
    speaker: "David Rios",
    title: 'Login sin contraseña: el fin del "olvidé mi clave"',
    color: AgendaColor.Yellow,
  },
  {
    time: "13:15 - 13:45",
    title: "Cierre del Evento",
    color: AgendaColor.Red,
  },
  {
    time: "14:00 - 15:30",
    title: "Almuerzo",
    color: AgendaColor.Blue,
  },
]
