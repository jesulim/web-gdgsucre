import { RegistrationsTable } from "@/components/admin/RegistrationsTable"

export function AdminTabs() {
  return (
    <div className="w-full p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Registros de Participantes</h2>
        <div className="text-sm text-gray-600 mb-4">
          Gestiona los registros de participantes del evento.
        </div>
        <RegistrationsTable />
      </div>
    </div>
  )
}
