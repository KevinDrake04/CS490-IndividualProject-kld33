export async function getData() {
  const res = await fetch("/sql/getAllCustomers")
  const data = await res.json()

  // accept either backend key
  const rows = Array.isArray(data?.tables)
    ? data.tables
    : Array.isArray(data?.["All Customers"])
      ? data["All Customers"]
      : []

  return rows.map((r) =>
    Array.isArray(r)
      ? {
          customer_id: r?.[0] ?? "",
          first_name: r?.[1] ?? "",
          last_name: r?.[2] ?? "",
          email: r?.[3] ?? "",
        }
      : {
          customer_id: r?.customer_id ?? "",
          first_name: r?.first_name ?? "",
          last_name: r?.last_name ?? "",
          email: r?.email ?? "",
        }
  )
}
