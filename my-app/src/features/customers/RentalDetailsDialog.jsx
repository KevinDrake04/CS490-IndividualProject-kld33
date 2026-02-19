import { useEffect, useState } from "react"

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

export default function RentalDetailsDialog({ open, onOpenChange, customer }) {
  const [rentalsLoading, setRentalsLoading] = useState(false)
  const [rentals, setRentals] = useState([])
  const [customerDates, setCustomerDates] = useState(null)

  useEffect(() => {
    if (!open) return
    if (!customer?.customer_id) return

    fetch(`/sql/getCustomerDetails/${customer.customer_id}`)
      .then((res) => res.json())
      .then((data) => setCustomerDates(data?.customer ?? null))
      .catch((err) => console.error(err))
  }, [open, customer?.customer_id])


  useEffect(() => {
    if (!open) return
    if (!customer?.customer_id) return

    let cancelled = false

    setRentals([])
    setRentalsLoading(true)

    fetch(`/sql/getCustomerRentals/${customer.customer_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return

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
      .catch((err) => {
        if (!cancelled) console.error(err)
      })
      .finally(() => {
        if (!cancelled) setRentalsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, customer?.customer_id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Customer Details
            {customer
              ? ` — ${customer.first_name ?? ""} ${customer.last_name ?? ""} (ID: ${customer.customer_id})`
              : ""}
          </DialogTitle>
          <DialogDescription>
            Past and present rental history for this customer.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created Date</p>
              <p className="text-sm">{formatDate(customerDates?.create_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated Date</p>
              <p className="text-sm">{formatDate(customerDates?.last_update)}</p>
            </div>
          </div>
        </div>

        {rentalsLoading ? (
          <p className="py-4">Loading rentals...</p>
        ) : rentals.length === 0 ? (
          <p className="py-4">No rental records found.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <p className="py-4">Rental Details</p>
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
  )
}
