"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { commandSchema, CommandFormValues } from "./schema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { createCommand, updateCommand } from "@/app/actions/commands"
import { ProthesisType, ProthesisSubType, PaymentMode, Product, User, Command } from "@/app/generated/prisma/browser"

// Define the shape of the command with its relations as expected by the dialog
type CommandWithRelations = Command & {
  commandProducts: {
    productId: number
    quantity: number
    product?: Product // Optional because we might just have the ID in some contexts, but usually we need it for display? 
                      // actually for the form default values we just need productId and quantity.
  }[]
  instrumentiste?: any // Relaxed type as we don't use this relation in the dialog, and it varies (list vs detail)
}

interface CommandDialogProps {
  command?: CommandWithRelations
  trigger?: React.ReactNode
  productsList: Product[]
  usersList: User[] // Pass users to select instrumentiste
}

export function CommandDialog({ command, trigger, productsList, usersList }: CommandDialogProps) {
  const [open, setOpen] = useState(false)
  const isEditing = !!command

  const form = useForm<CommandFormValues>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      reference: command?.reference || "",
      type: command?.type || ProthesisType.KNEE,
      subType: command?.subType || ProthesisSubType.PTG_ZIMED,
      dateIntervention: command?.dateIntervention ? new Date(command.dateIntervention) : new Date(),
      dateLivraison: command?.dateLivraison ? new Date(command.dateLivraison) : new Date(),
      lienIntervention: command?.lienIntervention || "",
      ville: command?.ville || "",
      address: command?.address || "",
      clinique: command?.clinique || "",
      doctorName: command?.doctorName || "",
      modePaiement: command?.modePaiement || PaymentMode.CASH,
      commentaire: command?.commentaire || "",
      instrumentisteId: command?.instrumentisteId?.toString() || undefined,
      products: command?.commandProducts?.map((cp) => ({
        productId: cp.productId,
        quantity: cp.quantity
      })) || []
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  })

  const onSubmit = async (data: CommandFormValues) => {
    try {
      if (isEditing && command) {
        await updateCommand(command.id, data)
      } else {
        await createCommand(data)
      }
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Command
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Command" : "Create Command"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update command details."
              : "Create a new command."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                        <Input placeholder="REF-001" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ville</FormLabel>
                    <FormControl>
                        <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                        <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="clinique"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Clinique</FormLabel>
                    <FormControl>
                        <Input placeholder="Clinique" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="doctorName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Doctor name" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {Object.values(ProthesisType).map((type) => (
                            <SelectItem key={type} value={type}>
                            {type}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="subType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Sub Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select sub type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {Object.values(ProthesisSubType).map((type) => (
                            <SelectItem key={type} value={type}>
                            {type}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="dateIntervention"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date Intervention</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="dateLivraison"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date Livraison</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            
            <FormField
                control={form.control}
                name="modePaiement"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {Object.values(PaymentMode).map((mode) => (
                            <SelectItem key={mode} value={mode}>
                            {mode}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="instrumentisteId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Instrumentiste</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select instrumentiste" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {usersList.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

             <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <FormLabel>Products</FormLabel>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ productId: productsList[0]?.id || 0, quantity: 1 })}
                    >
                        Add Product
                    </Button>
                </div>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                         <FormField
                            control={form.control}
                            name={`products.${index}.productId`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Product</FormLabel>
                                <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))} 
                                    defaultValue={field.value.toString()}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {productsList.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.name} ({product.code})
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`products.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="w-24">
                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        min="1"
                                        {...field} 
                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 mb-2"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <FormField
              control={form.control}
              name="commentaire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaire</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional comment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save Command</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
