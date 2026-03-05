import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function FilmDetailsDialog({ open, onOpenChange, film }) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState(null)

  useEffect(() => {
    if (!open || !film?.film_id) return

    setLoading(true)
    setDetails(null)

    fetch(`/sql/getFilmDetails/${film.film_id}`)
      .then((res) => res.json())
      .then((data) => {
        setDetails(data?.film ?? data ?? null)
      })
      .finally(() => setLoading(false))
  }, [open, film?.film_id])

  const d = details ?? film ?? {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{d.title ?? "Film Details"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            {d.description ? (
              <p className="text-sm leading-relaxed">{d.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description.</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Film ID:</span> {d.film_id ?? "—"}</div>
              <div><span className="font-medium">Genre:</span> {d.category ?? "—"}</div>
              <div><span className="font-medium">Rating:</span> {d.rating ?? "—"}</div>
              <div><span className="font-medium">Year:</span> {d.release_year ?? "—"}</div>
              <div><span className="font-medium">Length:</span> {d.length ? `${d.length} min` : "—"}</div>
              <div><span className="font-medium">Rental Rate:</span> {d.rental_rate != null ? `$${Number(d.rental_rate).toFixed(2)}` : "—"}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}