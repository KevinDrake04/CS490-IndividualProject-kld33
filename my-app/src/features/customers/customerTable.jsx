import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/customerTable/data-table"
import { getData } from "@/components/customerTable/get-data"
import { getColumns } from "@/components/customerTable/columns"

import { Button } from "@/components/ui/button"

import DeleteCustomerDialog from "./deleteCustomerDialog"
import RentalDetailsDialog from "./rentalDetailsDialog"
import CustomerFormDialog from "./customerFormDialog"

export default function PaymentsPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const [rentalsOpen, setRentalsOpen] = useState(false)
  const [rentalsLoading, setRentalsLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [rentals, setRentals] = useState([])
  const [pendingDelete, setPendingDelete] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState("add") // "add" | "edit"
  const [editingCustomer, setEditingCustomer] = useState(null)

  const refreshCustomers = () => {
    setLoading(true)
    getData()
      .then((rows) => setCustomers(rows))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshCustomers()
  }, [])

  const handleViewRentalDetails = (customerId, customer) => {
    setSelectedCustomer(customer)
    setRentals([])
    setRentalsLoading(true)
    setRentalsOpen(true)

    fetch(`/sql/getCustomerRentals/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        const rawRows = Array.isArray(data?.rentals)
          ? data.rentals
          : Array.isArray(data?.tables)
            ? data.tables
            : Array.isArray(data?.["Customer Rentals"])
              ? data["Customer Rentals"]
              : []

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

  const handleAddCustomer = () => {
    setFormMode("add")
    setEditingCustomer(null)
    setFormOpen(true)
  }

  const handleEditCustomer = async (customerId, customer) => {
    setFormMode("edit")

    const res = await fetch(`/sql/getCustomerDetails/${customerId}`)
    const data = await res.json()

    setEditingCustomer(data.customer)
    setFormOpen(true)
  }

  const handleSaveCustomer = async (payload) => {
    if (formMode === "add") {
      await fetch("/sql/addCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`/sql/updateCustomer/${payload.customer_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    refreshCustomers()
  }


  const handleDeleteCustomer = (customerId, customer) => {
    console.log("Delete customer clicked:", customerId, customer)
    setPendingDelete({ customerId, customer })
  }

  const columns = useMemo(
    () =>
      getColumns({
        onViewRentalDetails: handleViewRentalDetails,
        onEditCustomer: handleEditCustomer,
        onDeleteCustomer: handleDeleteCustomer,
      }),
    [handleViewRentalDetails, handleEditCustomer, handleDeleteCustomer]
  )

  if (loading) return <div className="container mx-auto py-10">Loading...</div>

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddCustomer}>Add Customer</Button>
      </div>

      <DataTable columns={columns} data={customers} />

      <RentalDetailsDialog
        open={rentalsOpen}
        onOpenChange={setRentalsOpen}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        pendingDelete={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={refreshCustomers}
      />

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  )
}
