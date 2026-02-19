import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/customerTable/data-table"
import { getData } from "@/components/customerTable/get-data"
import { getColumns } from "@/components/customerTable/columns"
import DeleteCustomerDialog from "./DeleteCustomerDialog"
import RentalDetailsDialog from "./RentalDetailsDialog"

export default function PaymentsPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const [rentalsOpen, setRentalsOpen] = useState(false)
  const [rentalsLoading, setRentalsLoading] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [rentals, setRentals] = useState([])
  const [pendingDelete, setPendingDelete] = useState(null)


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
    []
  )

  if (loading) return <div className="container mx-auto py-10">Loading...</div>

  return (
    <div className="container mx-auto py-10">
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

    </div>
  )
}
