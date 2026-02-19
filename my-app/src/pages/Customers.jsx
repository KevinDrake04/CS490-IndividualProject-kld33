import CustomerTable from "../features/customers/customerTable"; 

export default function Customers() {
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
      <h1>Customers Page</h1>
      <p>Customer list or dashboard goes here.</p>
      <p>Customer Page (3):</p>
      <p>As a user I want to be able to add a new customer</p>
      <p>As a user I want to be able to edit a customer’s details</p>
      <p>As a user I want to be able to indicate that a customer has returned a rented movie</p>

      <div style={{ marginTop: "2rem", textAlign: "left" }}>
        <CustomerTable />
      </div>
    </div>
  );
}
