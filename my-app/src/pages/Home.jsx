import { useState, useEffect } from "react";

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

  /*useEffect(() => {
    fetch("sql/getTop5Actors")
      .then((res) => res.json())
      .then((data) => {
        setTopActors(data);
        console.log("actors:", data);
      })
  }, []);
  */
 
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main landing area.</p>

      <h2>Top 5 Rented Films</h2>
      <p>   As a user I want to view top 5 rented films of all times</p>
      <p>   As a user I want to be able to click on any of the top 5 films and view its details</p>
      {topFilms ? (
        <><pre>{topFilms[0]}</pre>
        <pre>{topFilms[1]}</pre>
        <pre>{topFilms[2]}</pre>
        <pre>{topFilms[3]}</pre>
        <pre>{topFilms[4]}</pre></>
      ) : (
        <p>Loading films…</p>
      )}

      <h2>Top 5 Actors</h2>
      <p>   As a user I want to be able to view top 5 actors that are part of films I have in the store</p>
      <p>   As a user I want to be able to view the actor’s details and view their top 5 rented films</p>
      {topActors ? (
        <pre>{JSON.stringify(topActors, null, 2)}</pre>
      ) : (
        <p>Loading actors…</p>
      )}
    </div>
  );
}