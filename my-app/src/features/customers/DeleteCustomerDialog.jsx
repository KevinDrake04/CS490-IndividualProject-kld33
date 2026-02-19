import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DeleteCustomerDialog({
  pendingDelete, // null or { customerId, customer }
  onClose,       // () => void
  onDeleted,     // async () => void   (usually refreshCustomers)
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!pendingDelete) return null

  const { customerId, customer } = pendingDelete

  const handleConfirmDelete = async (e) => {
    e.preventDefault()
    if (!customerId || isDeleting) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/sql/deleteCustomer/${customerId}`, {
        method: "DELETE",
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 409) {
        alert(data?.error ?? "Cannot delete customer: active rentals exist.")
        return
      }

      if (!res.ok) {
        alert(data?.error ?? "Delete failed.")
        return
      }

      onClose?.()
      await onDeleted?.()
    } catch (err) {
      console.error(err)
      alert("Network/server error while deleting.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={!!pendingDelete}
      onOpenChange={(open) => !open && onClose?.()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete customer?</AlertDialogTitle>
          <AlertDialogDescription>
            Delete{" "}
            <span className="font-medium">
              {customer?.first_name} {customer?.last_name}
            </span>{" "}
            (ID: {customerId})? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
