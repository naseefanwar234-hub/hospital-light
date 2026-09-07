import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, Empty, Field, Input, Modal, SectionTitle, Select } from "@/components/ui-kit";
import { DEPARTMENTS, useDoctors, type Doctor } from "@/lib/store";

export const Route = createFileRoute("/doctors")({
  component: Doctors,
  head: () => ({
    meta: [
      { title: "Doctors | MediCare Hospital" },
      { name: "description", content: "Browse MediCare Hospital doctors by specialization, department, experience and availability, and manage their profiles." },
      { property: "og:title", content: "Doctors | MediCare Hospital" },
      { property: "og:description", content: "Doctor directory with specialization, experience and availability." },
    ],
  }),
});

const blank: Omit<Doctor, "id"> = {
  name: "",
  specialization: "",
  department: DEPARTMENTS[0],
  experience: 5,
  availability: "Available",
  phone: "",
};

function Doctors() {
  const { items, add, update, remove } = useDoctors();
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Omit<Doctor, "id">>(blank);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((d) => [d.name, d.specialization, d.department].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  const submit = () => {
    if (!form.name.trim()) return;
    if (editing) update(editing.id, form);
    else add(form);
    setOpenForm(false);
  };

  return (
    <AppLayout>
      <SectionTitle
        title="Doctors"
        subtitle={`${items.length} medical practitioners`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(blank);
              setOpenForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add doctor
          </Button>
        }
      />

      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search doctors by name, specialization or department"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => (
          <Card key={d.id}>
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                {d.name.replace("Dr. ", "").slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{d.name}</p>
                <p className="truncate text-sm text-muted-foreground">{d.specialization}</p>
              </div>
              <div className="ml-auto">
                <Badge tone={d.availability === "Available" ? "success" : d.availability === "On Leave" ? "danger" : "warn"}>
                  {d.availability}
                </Badge>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-secondary p-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Department</dt>
                <dd className="mt-1 font-medium">{d.department}</dd>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Experience</dt>
                <dd className="mt-1 font-medium">{d.experience} years</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {d.phone || "—"}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="soft"
                  onClick={() => {
                    setEditing(d);
                    const { id: _id, ...rest } = d;
                    setForm(rest);
                    setOpenForm(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(d.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <Card><Empty message="No doctors match your search." /></Card>}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? "Edit doctor" : "Add doctor"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Specialization">
            <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          </Field>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Experience (years)">
            <Input
              type="number"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
            />
          </Field>
          <Field label="Availability">
            <Select
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value as Doctor["availability"] })}
            >
              {["Available", "In Surgery", "On Leave"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenForm(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Add doctor"}</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
