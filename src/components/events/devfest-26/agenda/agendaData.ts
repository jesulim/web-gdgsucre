import { AgendaColor, type AgendaSlot } from "./agenda"

export const DEVFEST_26_AGENDA_SLOTS: AgendaSlot[] = [
  {
    time: "08:00 - 09:00",
    title: "Acreditación",
    color: AgendaColor.Green,
  },
  {
    time: "09:00 - 09:15",
    title: "Inauguración",
    color: AgendaColor.White,
  },
  {
    time: "09:15 - 10:00",
    speaker: "Sergio Ochoa",
    title: "AI Harnesses: Más allá del prompting, ingeniería de software con agentes de IA",
    color: AgendaColor.Yellow,
  },
  {
    time: "10:00 - 10:15",
    title: "Dinámicas",
    color: AgendaColor.Blue,
  },
  {
    time: "10:15 - 11:15",
    speaker: "Brian Castillo",
    title: "Build Your Own Jarvis: Real-Time AI with Gemini Live API & Firebase",
    color: AgendaColor.Yellow,
  },
  {
    time: "11:15 - 11:45",
    title: "Refrigerio + Networking",
    color: AgendaColor.Blue,
  },
  {
    time: "11:45 - 12:20",
    speaker: "Yury Camacho",
    title:
      "There Are No Strings on Me: Autonomous Mobile Agents with Direct Silicon Control (AI On-Device)",
    color: AgendaColor.Yellow,
  },
  {
    time: "12:20 - 12:35",
    title: "Dinámicas",
    color: AgendaColor.Blue,
  },
  {
    time: "12:35 - 13:20",
    speaker: "David Rios",
    title: 'Login sin contraseña: El fin del "olvidé mi clave"',
    color: AgendaColor.Yellow,
  },
  {
    time: "13:20 - 13:45",
    title: "Cierre del Evento",
    color: AgendaColor.Red,
  },
]
