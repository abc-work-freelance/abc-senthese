import { getAllCommands } from "@/app/actions/commands"
import { getAllProducts } from "@/app/actions/products"
import { prisma } from "@/lib/prisma"
import { CommandDialog } from "@/components/commands/CommandDialog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole, CommandStatus } from "@/app/generated/prisma/client"
import { CommandsTable } from "./CommandsTable"
import CardsSection from "./CardsSection"
import { Separator } from "@/components/ui/separator"

export default async function CommandsPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  const userId = session?.user?.id

  let commands = []
  
  if (role === UserRole.ADMIN) {
     const res = await getAllCommands()
     commands = res.commands as any
  } else if (role === UserRole.INSTRUMENTISTE && userId) {
     const res = await getAllCommands()
     commands = res.commands?.filter((c: any) => c.instrumentisteId === parseInt(userId) && c.status === CommandStatus.AFFECTEE) || []
  }

  const { products } = await getAllProducts()
  const users = await prisma.user.findMany({
      where: { role: UserRole.INSTRUMENTISTE }
  })

  const commandsStat = await prisma.command.findMany()

  console.log(commandsStat.filter(x => x.status == "VALIDEE").length)

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Statistique</h2>
          {/* <p className="text-muted-foreground">
            Manage your commands here.
          </p> */}
        </div>
      </div>
      <CardsSection
        data={{
          total: commandsStat.length,
          affectee: commandsStat.filter(x => x.status == "AFFECTEE").length,
          completee: commandsStat.filter(x => x.status == "COMPLETEE").length,
          validee: commandsStat.filter(x => x.status == "VALIDEE").length
        }}
      />
      <Separator />
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Commands</h2>
          <p className="text-muted-foreground">
            Manage your commands here.
          </p>
        </div>
        {role === UserRole.ADMIN && (
             <CommandDialog productsList={products || []} usersList={users || []} />
        )}
      </div>
      <CommandsTable 
        data={commands || []} 
        products={products || []}
        users={users || []}
        isAdmin={role === UserRole.ADMIN}
      />
    </div>
  )
}
