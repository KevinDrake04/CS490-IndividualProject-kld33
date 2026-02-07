import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/customerTable/data-table"
import { getData } from "@/components/customerTable/get-data"
import { getColumns } from "@/components/customerTable/columns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatDate(value) {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString()
}

export default function PaymentsPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const [rentalsOpen, setRentalsOpen] = useState(false)
  const [rentalsLoading, setRentalsLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [rentals, setRentals] = useState([])

  useEffect(() => {
    let mounted = true

    getData()
      .then((rows) => {
        if (mounted) setCustomers(rows)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const handleViewRentalDetails = (customerId, customer) => {
    setSelectedCustomer(customer)
    setRentals([])
    setRentalsLoading(true)
    setRentalsOpen(true)

    fetch(`/sql/getCustomerRentals/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        // Accept a few possible backend shapes
        const rawRows = Array.isArray(data?.rentals)
          ? data.rentals
          : Array.isArray(data?.tables)
            ? data.tables
            : Array.isArray(data?.["Customer Rentals"])
              ? data["Customer Rentals"]
              : []

        // Accept row as either object or tuple/list
        const mapped = rawRows.map((r) =>
          Array.isArray(r)
            ? {
                title: r?.[0] ?? "",
                rental_date: r?.[1] ?? null,
                return_date: r?.[2] ?? null,
              }
            : {
                title: r?.title ?? "",
                rental_date: r?.rental_date ?? null,
                return_date: r?.return_date ?? null,
              }
        )

        setRentals(mapped)
      })
      .finally(() => {
        setRentalsLoading(false)
      })
  }

  const handleEditCustomer = (customer) => {
    console.log("Edit customer:", customer)
  }

  const handleDeleteCustomer = (customerId, customer) => {
    console.log("Delete customer:", customerId, customer)
  }

  const columns = useMemo(
    () =>
      getColumns({
        onViewRentalDetails: handleViewRentalDetails,
        onEditCustomer: handleEditCustomer,
        onDeleteCustomer: handleDeleteCustomer,
      }),
    []
  )

  if (loading) return <div className="container mx-auto py-10">Loading...</div>

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={customers} />

      <Dialog open={rentalsOpen} onOpenChange={setRentalsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Rental Details
              {selectedCustomer
                ? ` — ${selectedCustomer.first_name} ${selectedCustomer.last_name} (ID: ${selectedCustomer.customer_id})`
                : ""}
            </DialogTitle>
            <DialogDescription>
              Past and present rental history for this customer.
            </DialogDescription>
          </DialogHeader>

          {rentalsLoading ? (
            <p className="py-4">Loading rentals...</p>
          ) : rentals.length === 0 ? (
            <p className="py-4">No rental records found.</p>
          ) : (
            <div className="max-h-[60vh] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Title</TableHead>
                    <TableHead className="text-left">Rental Date</TableHead>
                    <TableHead className="text-left">Return Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.map((r, idx) => (
                    <TableRow key={`${r.title ?? "title"}-${idx}`}>
                      <TableCell className="text-left">{r.title ?? "—"}</TableCell>
                      <TableCell className="text-left">
                        {formatDate(r.rental_date)}
                      </TableCell>
                      <TableCell className="text-left">
                        {formatDate(r.return_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
