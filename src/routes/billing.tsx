import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus, Printer, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, Empty, Field, Input, Modal, SectionTitle, Select, Table } from "@/components/ui-kit";
import { inr, todayISO, useBills, useHospitalInfo, usePatients, type Bill } from "@/lib/store";

export const Route = createFileRoute("/billing")({
  component: Billing,
  head: () => ({
    meta: [
      { title: "Billing | MediCare Hospital" },
      { name: "description", content: "Create patient invoices, record services and amounts, and track paid or pending payments at MediCare Hospital." },
      { property: "og:title", content: "Billing | MediCare Hospital" },
      { property: "og:description", content: "Invoice generation and payment tracking for hospital services." },
    ],
  }),
});

function Billing() {
  const { items, add, update, remove } = useBills();
  const { items: patients } = usePatients();
  const [info] = useHospitalInfo();
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [invoice, setInvoice] = useState<Bill | null>(null);

  const blank: Omit<Bill, "id"> = {
    patient: patients[0]?.name ?? "",
    services: "",
    amount: 1000,
    date: todayISO(),
    status: "Pending",
  };
  const [form, setForm] = useState<Omit<Bill, "id">>(blank);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((b) => [b.id, b.patient, b.services, b.status].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  const paid = items.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const pending = items.filter((b) => b.status === "Pending").reduce((s, b) => s + b.amount, 0);

  return (
    <AppLayout>
      <SectionTitle
        title="Billing"
        subtitle="Invoices and payment status"
        action={
          <Button
            onClick={() => {
              setForm(blank);
              setOpenForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> New invoice
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          ["Total billed", inr(paid + pending)],
          ["Collected", inr(paid)],
          ["Pending", inr(pending)],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search invoices by patient or service"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Card>

      <Table head={["Invoice", "Patient", "Services", "Amount", "Date", "Payment", "Actions"]}>
        {filtered.map((b) => (
          <tr key={b.id} className="hover:bg-secondary/50">
            <td className="px-4 py-3 font-medium">{b.id}</td>
            <td className="px-4 py-3">{b.patient}</td>
            <td className="px-4 py-3 text-muted-foreground">{b.services}</td>
            <td className="px-4 py-3 font-medium">{inr(b.amount)}</td>
            <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
            <td className="px-4 py-3">
              <Badge tone={b.status === "Paid" ? "success" : "warn"}>{b.status}</Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" aria-label="Invoice" onClick={() => setInvoice(b)}>
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => update(b.id, { status: b.status === "Paid" ? "Pending" : "Paid" })}
                >
                  {b.status === "Paid" ? "Mark pending" : "Mark paid"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete" onClick={() => remove(b.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7}>
              <Empty message="No invoices found." />
            </td>
          </tr>
        )}
      </Table>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Generate invoice">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient">
            <Select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              {patients.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Amount">
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Services">
              <Input
                placeholder="Consultation, Lab tests, Medication"
                value={form.services}
                onChange={(e) => setForm({ ...form, services: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Payment status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Bill["status"] })}>
              {["Pending", "Paid"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!form.patient) return;
              add(form);
              setOpenForm(false);
            }}
          >
            Generate invoice
          </Button>
        </div>
      </Modal>

      <Modal open={!!invoice} onClose={() => setInvoice(null)} title="Invoice" wide>
        {invoice && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-lg font-semibold">{info.name}</p>
                <p className="text-sm text-muted-foreground">{info.address}</p>
                <p className="text-sm text-muted-foreground">{info.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Invoice</p>
                <p className="font-semibold">{invoice.id}</p>
                <p className="text-sm text-muted-foreground">{invoice.date}</p>
              </div>
            </div>

            <div className="grid gap-4 py-5 sm:grid-cols-2">
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Billed to</p>
                <p className="mt-1 font-medium">{invoice.patient}</p>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment status</p>
                <div className="mt-1">
                  <Badge tone={invoice.status === "Paid" ? "success" : "warn"}>{invoice.status}</Badge>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-border">
                  <th className="py-2.5 text-xs uppercase tracking-wide text-muted-foreground">Description</th>
                  <th className="py-2.5 text-right text-xs uppercase tracking-wide text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3">{invoice.services || "Hospital services"}</td>
                  <td className="py-3 text-right">{inr(invoice.amount)}</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold">Total payable</td>
                  <td className="py-3 text-right text-lg font-semibold">{inr(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInvoice(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
