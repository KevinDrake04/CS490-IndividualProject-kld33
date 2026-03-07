import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/filmsTable/data-table"
import { getData } from "@/components/filmsTable/get-data"
import { getColumns } from "@/components/filmsTable/columns"

import FilmActorsDialog from "./filmsActorsDialog"
import FilmDetailsDialog from "./filmsDetailsDialog"
import RentFilmDialog from "./rentFilmDialog"

export default function FilmsTable() {
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)

  const [actorsOpen, setActorsOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [rentOpen, setRentOpen] = useState(false)

  const [selectedFilm, setSelectedFilm] = useState(null)

  const refreshFilms = () => {
    setLoading(true)
    getData()
      .then((rows) => setFilms(rows))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshFilms()
  }, [])

  const handleViewActors = (film) => {
    setSelectedFilm(film)
    setActorsOpen(true)
  }

  const handleViewDetails = (film) => {
    setSelectedFilm(film)
    setDetailsOpen(true)
  }

  const handleRentFilm = (film) => {
    setSelectedFilm(film)
    setRentOpen(true)
  }

  const columns = useMemo(
    () =>
      getColumns({
        onViewActors: handleViewActors,
        onViewDetails: handleViewDetails,
        onRentFilm: handleRentFilm,
      }),
    []
  )

  if (loading) return <div className="container mx-auto py-10">Loading...</div>

  return (
    <div className="container mx-auto py-10 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Films</h1>
      </div>

      <DataTable columns={columns} data={films} />

      <FilmActorsDialog
        open={actorsOpen}
        onOpenChange={setActorsOpen}
        film={selectedFilm}
      />

      <FilmDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        film={selectedFilm}
      />

      <RentFilmDialog
        open={rentOpen}
        onOpenChange={setRentOpen}
        film={selectedFilm}
      />
    </div>
  )
}