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
import { toast } from "sonner"

export default function ReturnRentalDialog({
  open,
  onOpenChange,
  rental,      // { rental_id, film_id, title }
  customer,    // { customer_id, first_name, last_name }
  onSuccess,   // callback to refresh rentals
}) {
  const handleConfirm = async () => {
    if (!rental?.rental_id) return

    try {
      const res = await fetch("/sql/returnRental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rental_id: rental.rental_id }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error("Failed to mark film as returned.")
        return
      }

      toast.success(
        `Marked "${rental.title}" as returned (Film ID: ${rental.film_id}, Client ID: ${customer?.customer_id}).`
      )

      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      console.error(e)
      toast.error("Failed to mark film as returned.")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark film as returned?</AlertDialogTitle>
          <AlertDialogDescription>
            Mark <span className="font-medium">{rental?.title ?? "—"}</span> as
            returned by{" "}
            <span className="font-medium">
              {customer?.first_name ?? ""} {customer?.last_name ?? ""}
            </span>
            <div className="mt-3 space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Film ID:</span>{" "}
                <span className="font-medium">{rental?.film_id ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Client ID:</span>{" "}
                <span className="font-medium">{customer?.customer_id ?? "—"}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}