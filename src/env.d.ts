interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
  /** Sitio que se despliega: "gdg" (default) | "wtm" */
  readonly PUBLIC_SITE?: "gdg" | "wtm"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "react-big-calendar" {
  export type SlotInfo = unknown
  export const Calendar: any
  export function momentLocalizer(moment: any): any
}
