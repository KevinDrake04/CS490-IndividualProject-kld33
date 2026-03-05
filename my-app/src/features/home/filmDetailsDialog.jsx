import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function FilmDetailsDialog({ open, onOpenChange, film }) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState(null)
  const [actors, setActors] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || !film?.film_id) return

    setLoading(true)
    setError("")
    setDetails(null)
    setActors([])

    fetch(`/sql/getFilmDetails/${film.film_id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        setDetails(data.film)
        setActors(data.actors ?? [])
      })
      .catch(() => setError("Failed to load film details."))
      .finally(() => setLoading(false))
  }, [open, film?.film_id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Film Details</DialogTitle>
          <DialogDescription>
            {film?.title ? `Details for "${film.title}"` : "Select a film."}
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}

        {!loading && !error && details && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-1">
              <div className="font-semibold">{details.title}</div>
              <div className="text-sm text-muted-foreground">{details.category} • {details.rating}</div>
              <div className="text-sm text-muted-foreground">
                {details.release_year} • {details.length} min • ${details.rental_rate}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-sm font-medium mb-1">Description</div>
              <div className="text-sm text-muted-foreground">
                {details.description || "—"}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-sm font-medium mb-2">Actors</div>
              {actors.length ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {actors.map((a) => (
                    <li key={a.actor_id}>{a.name}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No actors found.</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}