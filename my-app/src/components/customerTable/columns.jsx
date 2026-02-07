import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const leftHeader = (label) => <div className="text-left">{label}</div>
const leftCell = (value) => <div className="text-left">{value ?? ""}</div>

export function getColumns({
  onViewRentalDetails,
  onEditCustomer,
  onDeleteCustomer,
}) {
  return [
    {
      accessorKey: "customer_id",
      header: () => leftHeader("Customer ID"),
      cell: ({ row }) => leftCell(row.getValue("customer_id")),
    },
    {
      accessorKey: "first_name",
      header: () => leftHeader("First Name"),
      cell: ({ row }) => leftCell(row.getValue("first_name")),
    },
    {
      accessorKey: "last_name",
      header: () => leftHeader("Last Name"),
      cell: ({ row }) => leftCell(row.getValue("last_name")),
    },
    {
      accessorKey: "email",
      header: () => leftHeader("Email"),
      cell: ({ row }) => leftCell(row.getValue("email")),
    },
    {
      id: "actions",
      header: () => leftHeader("Actions"),
      cell: ({ row }) => {
        const customer = row.original

        return (
          <div className="text-left">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => {
                  console.log("clicked view rental details, customer_id =", customer.customer_id)
                  onViewRentalDetails(customer.customer_id, customer)}}>
                  View customer rental details
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onEditCustomer(customer)}>
                  Edit customer details
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() =>
                    onDeleteCustomer(customer.customer_id, customer)
                  }
                  className="text-red-600 focus:text-red-600 dark:text-red-500 dark:focus:text-red-500"
                >
                  Delete customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
