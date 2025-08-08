import { AccreditationTable } from "@/components/accreditation/AccreditationTable"
import { RegistrationsTable } from "@/components/registration/RegistrationsTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-fit grid-cols-2 h-10">
          <TabsTrigger value="registrations" className="px-6 py-2">
            Registros
          </TabsTrigger>
          <TabsTrigger value="accreditation" className="px-6 py-2">
            Acreditación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="mt-6 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Gestiona los registros de participantes del evento.
          </div>
          <RegistrationsTable />
        </TabsContent>

        <TabsContent value="accreditation" className="mt-6 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Controla el check-in y entrega de paquetes a los participantes.
          </div>
          <AccreditationTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
