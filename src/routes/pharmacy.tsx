import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, Empty, Field, Input, Modal, SectionTitle, Select, Table } from "@/components/ui-kit";
import { inr, useMedicines, type Medicine } from "@/lib/store";

export const Route = createFileRoute("/pharmacy")({
  component: Pharmacy,
  head: () => ({
    meta: [
      { title: "Pharmacy | MediCare Hospital" },
      { name: "description", content: "Track medicine stock, categories, pricing, expiry dates and low-stock alerts in the MediCare Hospital pharmacy." },
      { property: "og:title", content: "Pharmacy | MediCare Hospital" },
      { property: "og:description", content: "Medicine inventory with stock status and expiry tracking." },
    ],
  }),
});

const CATEGORIES = ["Antibiotic", "Analgesic", "Cardiac", "Diabetes", "Antihistamine", "Supplement"];
const blank: Omit<Medicine, "id"> = { name: "", category: "Antibiotic", quantity: 50, price: 10, expiry: "2027-01-01" };

const stockOf = (q: number) =>
  q === 0 ? { label: "Out of stock", tone: "danger" as const } : q < 30 ? { label: "Low stock", tone: "warn" as const } : { label: "In stock", tone: "success" as const };

function Pharmacy() {
  const { items, add, update, remove } = useMedicines();
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState<Omit<Medicine, "id">>(blank);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((m) => [m.name, m.category, m.id].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  const lowStock = items.filter((m) => m.quantity < 30).length;

  const submit = () => {
    if (!form.name.trim()) return;
    if (editing) update(editing.id, form);
    else add(form);
    setOpenForm(false);
  };

  return (
    <AppLayout>
      <SectionTitle
        title="Pharmacy"
        subtitle={`${items.length} medicines · ${lowStock} need restocking`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(blank);
              setOpenForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add medicine
          </Button>
        }
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search medicines by name or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Card>

      <Table head={["Medicine", "Category", "Quantity", "Price", "Expiry", "Stock status", "Actions"]}>
        {filtered.map((m) => {
          const s = stockOf(m.quantity);
          return (
            <tr key={m.id} className="hover:bg-secondary/50">
              <td className="px-4 py-3 font-medium">{m.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.category}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.quantity}</td>
              <td className="px-4 py-3 text-muted-foreground">{inr(m.price)}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.expiry}</td>
              <td className="px-4 py-3">
                <Badge tone={s.tone}>{s.label}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => {
                      setEditing(m);
                      const { id: _id, ...rest } = m;
                      setForm(rest);
                      setOpenForm(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete" onClick={() => remove(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7}>
              <Empty message="No medicines match your search." />
            </td>
          </tr>
        )}
      </Table>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? "Edit medicine" : "Add medicine"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Medicine name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Quantity">
            <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </Field>
          <Field label="Price">
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </Field>
          <Field label="Expiry date">
            <Input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add medicine"}</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
