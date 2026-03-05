import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ActorDetailsDialog({ open, onOpenChange, actor }) {
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState(null)
  const [topFilms, setTopFilms] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open || !actor?.actor_id) return

    setLoading(true)
    setError("")
    setDetails(null)
    setTopFilms([])

    Promise.all([
      fetch(`/sql/getActorDetails/${actor.actor_id}`).then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      }),
      fetch(`/sql/getActorTop5Films/${actor.actor_id}`).then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      }),
    ])
      .then(([a, films]) => {
        setDetails(a.actor)
        setTopFilms(films.tables ?? [])
      })
      .catch(() => setError("Failed to load actor details."))
      .finally(() => setLoading(false))
  }, [open, actor?.actor_id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Actor Details</DialogTitle>
          <DialogDescription>
            {actor?.name ? `Details for ${actor.name}` : "Select an actor."}
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}

        {!loading && !error && details && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-1">
              <div className="font-semibold">{details.name}</div>
              {details.last_update && (
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(details.last_update).toLocaleString()}
                </div>
              )}
            </div>

            <div className="rounded-md border p-3">
              <div className="text-sm font-medium mb-2">Top 5 Rented Films (for this actor)</div>

              {topFilms.length ? (
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  {topFilms.map((f) => (
                    <li key={f.film_id}>
                      {f.title} <span className="text-xs">({f.rented} rentals)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No rentals found for this actor.</div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}