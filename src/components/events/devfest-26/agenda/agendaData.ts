import brianImg from "@/assets/speakers/brian-castillo.webp"
import davidImg from "@/assets/speakers/david-rios.webp"
import sergioImg from "@/assets/speakers/sergio-ochoa.webp"
import yuryImg from "@/assets/speakers/yury-camacho.webp"

import { AgendaColor, type AgendaSlot } from "./agenda"

export const DEVFEST_26_AGENDA_SLOTS: AgendaSlot[] = [
  {
    time: "08:00 - 09:00",
    title: "Acreditación",
    activity: "check-in",
    color: AgendaColor.Green,
  },
  {
    time: "09:00 - 09:15",
    title: "Inauguración",
    activity: "opening",
    color: AgendaColor.White,
  },
  {
    time: "09:15 - 10:00",
    speaker: "Sergio Ochoa",
    speakerImage: sergioImg,
    title: "AI Harnesses: Más allá del prompting, ingeniería de software con agentes de IA",
    color: AgendaColor.Yellow,
  },
  {
    time: "10:00 - 10:15",
    title: "Espacio para sponsors y dinámicas",
    activity: "sponsors",
    color: AgendaColor.Blue,
  },
  {
    time: "10:15 - 11:15",
    speaker: "Brian Castillo",
    speakerImage: brianImg,
    title: "Build Your Own Jarvis: Real-Time AI with Gemini Live API & Firebase",
    color: AgendaColor.Yellow,
  },
  {
    time: "11:15 - 11:45",
    title: "Refrigerio + Networking",
    activity: "break",
    color: AgendaColor.Blue,
  },
  {
    time: "11:45 - 12:20",
    speaker: "Yury Camacho",
    speakerImage: yuryImg,
    title:
      "There Are No Strings on Me: Autonomous Mobile Agents with Direct Silicon Control (AI On-Device)",
    color: AgendaColor.Yellow,
  },
  {
    time: "12:20 - 12:35",
    title: "Espacio para sponsors y dinámicas",
    activity: "sponsors",
    color: AgendaColor.Blue,
  },
  {
    time: "12:35 - 13:20",
    speaker: "David Rios",
    speakerImage: davidImg,
    title: 'Login sin contraseña: El fin del "olvidé mi clave"',
    color: AgendaColor.Yellow,
  },
  {
    time: "13:20 - 13:45",
    title: "Cierre del Evento",
    activity: "closing",
    color: AgendaColor.Red,
  },
]
