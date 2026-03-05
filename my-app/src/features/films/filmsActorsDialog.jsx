import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function FilmActorsDialog({ open, onOpenChange, film }) {
  const [loading, setLoading] = useState(false)
  const [actors, setActors] = useState([])

  useEffect(() => {
    if (!open || !film?.film_id) return

    setLoading(true)
    setActors([])

    fetch(`/sql/getFilmActors/${film.film_id}`)
      .then((res) => res.json())
      .then((data) => {
        const raw = Array.isArray(data?.actors)
          ? data.actors
          : Array.isArray(data?.tables)
            ? data.tables
            : []

        const mapped = raw.map((a) =>
          Array.isArray(a)
            ? { actor_id: a?.[0], name: a?.[1] }
            : { actor_id: a?.actor_id, name: a?.name }
        )

        setActors(mapped)
      })
      .finally(() => setLoading(false))
  }, [open, film?.film_id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actors in {film?.title ?? "Film"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : actors.length ? (
          <ul className="space-y-2">
            {actors.map((a) => (
              <li key={a.actor_id ?? a.name} className="text-sm">
                {a.name}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">No actors found.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}