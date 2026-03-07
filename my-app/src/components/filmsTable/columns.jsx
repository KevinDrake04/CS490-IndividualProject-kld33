import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function getColumns({ onViewDetails, onViewActors, onRentFilm } = {}) {
  return [
    { accessorKey: "film_id", header: "Film ID" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "category", header: "Genre" },
    { accessorKey: "rating", header: "Rating" },
    {
      accessorKey: "length",
      header: "Length",
      cell: ({ row }) => (row.original.length ? `${row.original.length} min` : "—"),
    },
    { accessorKey: "release_year", header: "Year" },

    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const film = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails?.(film)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewActors?.(film)}>
                View actors
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRentFilm?.(film)}>
                Rent film
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}