import { useState, useEffect } from "react";

export default function Customers() {
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    fetch("/sql/getAllCustomers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.tables ?? []);
      })
  }, []);


  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h1>Customers Page</h1>
      <p>Customer list or dashboard goes here.</p>
      <p>Customer Page (7):</p>
      <p>   As a user I want to view a list of all customers (using pagination)</p>
      {customers ? (
        <pre>{customers}</pre>
      ) : (
        <p>Loading Customers…</p>
      )}
      <p>   As a user I want the ability to filter/search customers by their customer id, first name or last name.</p>
      <p>   As a user I want to be able to add a new customer</p>
      <p>   As a user I want to be able to edit a customer’s details</p>
      <p>   As a user I want to be able to delete a customer if they no longer wish to patron at store</p>
      <p>   As a user I want to be able to view customer details and see their past and present rental history</p>
      <p>   As a user I want to be able to indicate that a customer has returned a rented movie</p>
    </div>
  );
}