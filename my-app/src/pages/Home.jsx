import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [topFilms, setTopFilms] = useState(null);
  const [topActors, setTopActors] = useState(null);

  useEffect(() => {
    fetch("sql/getTop5Films")
      .then((res) => res.json())
      .then((data) => {
        setTopFilms(data.tables ?? []);
      })
  }, []);

  useEffect(() => {
    fetch("sql/getTop5Actors")
      .then((res) => res.json())
      .then((data) => setTopActors(data.tables ?? []));
  }, []);


  return (
    <div className="px-8 py-16 space-y-12">
      {/* Top 5 Rented Films */}
      <section className="space-y-6">
        <h1 className="text-center text-4xl font-extrabold">Top 5 Rented Films</h1>

        <div className="flex justify-center">
          <div className="grid w-full max-w-[1400px] grid-cols-5 gap-4">
            {topFilms ? (
              topFilms.slice(0, 5).map((film, i) => (
                <Card key={i} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-sm leading-tight">{film}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="h-[140px] w-full rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                      Film Poster Placeholder
                    </div>
                  </CardContent>

                  <CardFooter className="justify-end">
                    <Button size="sm">View Details</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>Loading films…</p>
            )}
          </div>
        </div>
      </section>

      {/* Top 5 Actors */}
      <section className="space-y-6">
        <h1 className="text-center text-4xl font-extrabold">Top 5 Actors</h1>

        <div className="flex justify-center">
          <div className="grid w-full max-w-[1400px] grid-cols-5 gap-4">
            {topActors ? (
              topActors.slice(0, 5).map((actor, i) => (
                <Card key={i} className="w-full">
                  <CardHeader>
                    <CardTitle className="text-sm leading-tight">{actor}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="h-[140px] w-full rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                      Actor Silhouette Placeholder
                    </div>
                  </CardContent>

                  <CardFooter className="justify-end">
                    <Button size="sm">View Details</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>Loading actors…</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}