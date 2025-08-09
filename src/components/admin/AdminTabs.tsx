import { RegistrationsTable } from "@/components/registration/RegistrationsTable"
import { Button } from "@/components/ui/button"

export function AdminTabs() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex gap-4 mb-6">
          <a href="/admin/accreditation">
            <Button variant="outline" className="flex items-center gap-2">
              📋 Ir a Acreditación
            </Button>
          </a>
        </div>

        <h2 className="text-xl font-semibold mb-2">Registros de Participantes</h2>
        <div className="text-sm text-gray-600 mb-4">
          Gestiona los registros de participantes del evento.
        </div>
        <RegistrationsTable />
      </div>
    </div>
  )
}
