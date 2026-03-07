import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import FilmDetailsDialog from "@/features/home/FilmDetailsDialog"
import ActorDetailsDialog from "@/features/home/ActorDetailsDialog"

import filmPlaceholder from "@/assets/placeholders/film-placeholder.png"
import actorPlaceholder from "@/assets/placeholders/actor-silhouette.png"

export default function Home() {
  const [topFilms, setTopFilms] = useState(null)
  const [topActors, setTopActors] = useState(null)

  const [filmDialogOpen, setFilmDialogOpen] = useState(false)
  const [actorDialogOpen, setActorDialogOpen] = useState(false)

  const [selectedFilm, setSelectedFilm] = useState(null)
  const [selectedActor, setSelectedActor] = useState(null)

  const [filmsError, setFilmsError] = useState("")
  const [actorsError, setActorsError] = useState("")

  useEffect(() => {
    setFilmsError("")
    fetch("/sql/getTop5Films")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => setTopFilms(data.tables ?? []))
      .catch(() => setFilmsError("Failed to load top films."))
  }, [])

  useEffect(() => {
    setActorsError("")
    fetch("/sql/getTop5Actors")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => setTopActors(data.tables ?? []))
      .catch(() => setActorsError("Failed to load top actors."))
  }, [])

  const openFilmDetails = (film) => {
    setSelectedFilm(film)
    setFilmDialogOpen(true)
  }

  const openActorDetails = (actor) => {
    setSelectedActor(actor)
    setActorDialogOpen(true)
  }

  return (
    <div className="px-8 py-16 space-y-12">
      <FilmDetailsDialog
        open={filmDialogOpen}
        onOpenChange={(open) => {
          setFilmDialogOpen(open)
          if (!open) setSelectedFilm(null)
        }}
        film={selectedFilm}
      />

      <ActorDetailsDialog
        open={actorDialogOpen}
        onOpenChange={(open) => {
          setActorDialogOpen(open)
          if (!open) setSelectedActor(null)
        }}
        actor={selectedActor}
      />

      <section className="space-y-6">
        <h1 className="text-center text-4xl font-extrabold">Top 5 Rented Films</h1>

        <div className="flex justify-center">
          <div className="grid w-full max-w-[1400px] grid-cols-5 gap-4">
            {filmsError ? (
              <p className="col-span-5 text-center text-sm text-destructive">{filmsError}</p>
            ) : topFilms ? (
              topFilms.slice(0, 5).map((film) => (
                <Card key={film.film_id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-sm leading-tight">{film.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="h-[140px] w-full rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center">
                      <img
                        src={filmPlaceholder}
                        alt="Film poster placeholder"
                        className="h-full w-full object-contain p-3"
                        draggable={false}
                      />
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      Rentals: <span className="font-medium text-foreground">{film.rented}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="justify-end">
                    <Button size="sm" onClick={() => openFilmDetails(film)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="col-span-5 text-center">Loading films…</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h1 className="text-center text-4xl font-extrabold">Top 5 Actors</h1>

        <div className="flex justify-center">
          <div className="grid w-full max-w-[1400px] grid-cols-5 gap-4">
            {actorsError ? (
              <p className="col-span-5 text-center text-sm text-destructive">{actorsError}</p>
            ) : topActors ? (
              topActors.slice(0, 5).map((actor) => (
                <Card key={actor.actor_id} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-sm leading-tight">{actor.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="h-[140px] w-full rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center">
                      <img
                        src={actorPlaceholder}
                        alt="Actor silhouette placeholder"
                        className="h-full w-full object-contain p-3"
                        draggable={false}
                      />
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      {"total_rentals" in actor && (
                        <div>
                          Total rentals:{" "}
                          <span className="font-medium text-foreground">{actor.total_rentals}</span>
                        </div>
                      )}
                      {"film_count" in actor && (
                        <div>
                          Films: <span className="font-medium text-foreground">{actor.film_count}</span>
                        </div>
                      )}
                      {"rentals_per_film" in actor && (
                        <div>
                          Rentals/film:{" "}
                          <span className="font-medium text-foreground">
                            {Number(actor.rentals_per_film).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="justify-end">
                    <Button size="sm" onClick={() => openActorDetails(actor)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="col-span-5 text-center">Loading actors…</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}