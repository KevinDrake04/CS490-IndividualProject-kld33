import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function RentFilmDialog({ open, onOpenChange, film }) {
  const [customerId, setCustomerId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setCustomerId("")
      setSubmitting(false)
    }
  }, [open])

  const handleRent = async () => {
    if (!film?.film_id) return

    const cid = customerId.trim()
    if (!cid) {
      toast.error("Missing customer id", {
        description: "Please enter a customer id before renting.",
      })
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/sql/rentFilm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          film_id: film.film_id,
          customer_id: Number(cid),
        }),
      })

      const contentType = res.headers.get("content-type") || ""
      const payload = contentType.includes("application/json")
        ? await res.json()
        : await res.text()

      if (res.status === 201) {
        const rentalId =
          typeof payload === "object" && payload?.rental_id
            ? payload.rental_id
            : null

        toast.success("Rental created", {
          description: rentalId
            ? `Rented "${film.title}" to customer #${cid}. Rental ID: ${rentalId}`
            : `Rented "${film.title}" to customer #${cid}.`,
        })

        onOpenChange(false)
        return
      }

      if (res.status === 409) {
        toast.warning("No available copies", {
          description:
            typeof payload === "string"
              ? payload
              : payload?.message || "No available copies for this film.",
        })
        return
      }

      toast.error("Rent failed", {
        description:
          typeof payload === "string"
            ? payload
            : payload?.message || "Something went wrong.",
      })
    } catch (err) {
      toast.error("Network error", {
        description: err?.message || "Could not reach the server.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rent: {film?.title ?? "Film"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Enter the customer ID to rent this film.
          </div>

          <Input
            placeholder="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRent} disabled={submitting}>
              {submitting ? "Renting..." : "Rent"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}