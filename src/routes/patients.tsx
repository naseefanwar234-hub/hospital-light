import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, Empty, Field, Input, Modal, SectionTitle, Select, Table } from "@/components/ui-kit";
import { DEPARTMENTS, usePatients, type Patient } from "@/lib/store";

export const Route = createFileRoute("/patients")({
  component: Patients,
  head: () => ({
    meta: [
      { title: "Patients | MediCare Hospital" },
      { name: "description", content: "Search, add, edit and remove patient records with age, gender, contact and department details at MediCare Hospital." },
      { property: "og:title", content: "Patients | MediCare Hospital" },
      { property: "og:description", content: "Complete patient registry with search and record management." },
    ],
  }),
});

const blank = { name: "", age: 30, gender: "Male", phone: "", department: DEPARTMENTS[0], address: "", bloodGroup: "O+" };

function Patients() {
  const { items, add, update, remove } = usePatients();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Omit<Patient, "id">>(blank);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [details, setDetails] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((p) =>
      [p.id, p.name, p.phone, p.department, p.gender].join(" ").toLowerCase().includes(q),
    );
  }, [items, query]);

  const openAdd = () => {
    setEditing(null);
    setForm(blank);
    setOpenForm(true);
  };

  const openEdit = (p: Patient) => {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setOpenForm(true);
  };

  const submit = () => {
    if (!form.name.trim()) return;
    if (editing) update(editing.id, form);
    else add(form);
    setOpenForm(false);
  };

  return (
    <AppLayout>
      <SectionTitle
        title="Patients"
        subtitle={`${items.length} registered patients`}
        action={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add patient
          </Button>
        }
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name, ID, phone or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Card>

      <Table head={["Patient ID", "Name", "Age", "Gender", "Phone", "Department", "Actions"]}>
        {filtered.map((p) => (
          <tr key={p.id} className="hover:bg-secondary/50">
            <td className="px-4 py-3 font-medium">{p.id}</td>
            <td className="px-4 py-3">{p.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
            <td className="px-4 py-3 text-muted-foreground">{p.gender}</td>
            <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
            <td className="px-4 py-3">
              <Badge>{p.department}</Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setDetails(p)} aria-label="View">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(p.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7}>
              <Empty message="No patients match your search." />
            </td>
          </tr>
        )}
      </Table>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? "Edit patient" : "Add patient"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Age">
            <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              {["Male", "Female", "Other"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Blood group">
            <Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add patient"}</Button>
        </div>
      </Modal>

      <Modal open={!!details} onClose={() => setDetails(null)} title="Patient details">
        {details && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {details.name.slice(0, 1)}
              </div>
              <div>
                <p className="font-semibold">{details.name}</p>
                <p className="text-sm text-muted-foreground">{details.id}</p>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Age", `${details.age} years`],
                ["Gender", details.gender],
                ["Phone", details.phone],
                ["Department", details.department],
                ["Blood group", details.bloodGroup],
                ["Address", details.address || "—"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-secondary p-3">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
