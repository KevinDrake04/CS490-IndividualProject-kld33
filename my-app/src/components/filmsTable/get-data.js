// src/components/filmsTable/get-data.js
export async function getData() {
  const res = await fetch("/sql/getFilms")
  if (!res.ok) throw new Error("Failed to fetch films")

  const data = await res.json()
  const rows = Array.isArray(data?.tables) ? data.tables : Array.isArray(data) ? data : []

  // Supports either object rows OR tuple rows
  return rows.map((r) =>
    Array.isArray(r)
      ? {
          film_id: r?.[0],
          title: r?.[1],
          category: r?.[2],
          rating: r?.[3],
          length: r?.[4],
          release_year: r?.[5],
          rental_rate: r?.[6],
          actor_names: r?.[7] ?? "",
        }
      : r
  )
}