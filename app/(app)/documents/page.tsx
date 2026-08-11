import { requireUser } from "@/lib/auth/current-user"
import { getAllDocuments } from "@/lib/queries/documents"
import { DocumentsTable } from "@/components/documents/documents-table"
import { Input } from "@/components/ui/input"

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const user = await requireUser()
  const { search } = await searchParams
  const documents = await getAllDocuments({ search })

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <form>
        <Input
          name="search"
          placeholder="Search by filename..."
          defaultValue={search ?? ""}
          className="w-64"
        />
      </form>
      <DocumentsTable
        documents={documents}
        currentUserId={user.id}
        isAdmin={user.role === "admin"}
      />
    </div>
  )
}
