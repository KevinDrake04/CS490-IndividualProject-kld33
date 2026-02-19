import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    address2: "",
    district: "",
    city: "",
    country: "",
    postal_code: "",
    phone: "",
}

export default function CustomerFormDialog({
    open,
    onOpenChange,
    mode, // "add" | "edit"
    customer,
    onSave, // (payload) => void
}) {
    const title = mode === "edit" ? "Edit Customer" : "Add Customer"
    const [form, setForm] = useState(emptyForm)

    useEffect(() => {
        if (!open) return

        if (mode === "edit" && customer) {
            const addr =
                customer && typeof customer.address === "object" && customer.address !== null
                    ? customer.address
                    : customer

            setForm({
                first_name: customer.first_name ?? "",
                last_name: customer.last_name ?? "",
                email: customer.email ?? "",
                address: addr.address ?? "",
                address2: addr.address2 ?? "",
                district: addr.district ?? "",
                city: addr.city ?? "",
                country: addr.country ?? "",
                postal_code: addr.postal_code ?? "",
                phone: addr.phone ?? "",
            })
        } else {
            setForm(emptyForm)
        }
    }, [open, mode, customer])


    function setField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        await onSave?.({
            ...form,
            customer_id: mode === "edit" ? customer?.customer_id : undefined,
        })
        onOpenChange?.(false)

    }

    const reqStar = <span className="text-destructive"> *</span>

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[900px] max-w-none">
                <DialogHeader>
                    <DialogTitle>
                        {title}
                        {mode === "edit" && customer?.customer_id
                            ? ` — ID: ${customer.customer_id}`
                            : ""}
                    </DialogTitle>
                    <DialogDescription>All fields are required.</DialogDescription>
                </DialogHeader>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* first name */}
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name{reqStar}</Label>
                            <Input
                                id="first_name"
                                required
                                value={form.first_name}
                                onChange={(e) => setField("first_name", e.target.value)}
                            />
                        </div>

                        {/* last name */}
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name{reqStar}</Label>
                            <Input
                                id="last_name"
                                required
                                value={form.last_name}
                                onChange={(e) => setField("last_name", e.target.value)}
                            />
                        </div>

                        {/* email */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="email">Email{reqStar}</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setField("email", e.target.value)}
                            />
                        </div>

                        {/* address 1 */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Address 1{reqStar}</Label>
                            <Input
                                id="address"
                                required
                                value={form.address}
                                onChange={(e) => setField("address", e.target.value)}
                            />
                        </div>

                        {/* address 2 */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address2">Address 2</Label>
                            <Input
                                id="address2"
                                value={form.address2}
                                onChange={(e) => setField("address2", e.target.value)}
                            />
                        </div>

                        {/* district */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="district">District{reqStar}</Label>
                            <Input
                                id="district"
                                required
                                value={form.district}
                                onChange={(e) => setField("district", e.target.value)}
                            />
                        </div>

                        {/* city */}
                        <div className="space-y-2">
                            <Label htmlFor="city">City{reqStar}</Label>
                            <Input
                                id="city"
                                required
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                            />
                        </div>

                        {/* country */}
                        <div className="space-y-2">
                            <Label htmlFor="country">Country{reqStar}</Label>
                            <Input
                                id="country"
                                required
                                value={form.country}
                                onChange={(e) => setField("country", e.target.value)}
                            />
                        </div>

                        {/* zip */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="postal_code">Zip Code{reqStar}</Label>
                            <Input
                                id="postal_code"
                                required
                                value={form.postal_code}
                                onChange={(e) => setField("postal_code", e.target.value)}
                            />
                        </div>

                        {/* phone */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="phone">Phone #{reqStar}</Label>
                            <Input
                                id="phone"
                                required
                                value={form.phone}
                                onChange={(e) => setField("phone", e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {mode === "edit" ? "Save Changes" : "Add Customer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
