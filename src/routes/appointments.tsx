import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Pencil, Search, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, Empty, Field, Input, Modal, SectionTitle, Select, Table } from "@/components/ui-kit";
import {
  DEFAULT_DEPT,
  DEPARTMENTS,
  todayISO,
  useAppointments,
  useDoctors,
  usePatients,
  type Appointment,
} from "@/lib/store";

export const Route = createFileRoute("/appointments")({
  component: Appointments,
  head: () => ({
    meta: [
      { title: "Appointments | MediCare Hospital" },
      { name: "description", content: "Book, reschedule and cancel patient appointments with MediCare Hospital doctors by date, time and department." },
      { property: "og:title", content: "Appointments | MediCare Hospital" },
      { property: "og:description", content: "Appointment scheduling for patients and doctors." },
    ],
  }),
});

function Appointments() {
  const { items, add, update, remove } = useAppointments();
  const { items: patients } = usePatients();
  const { items: doctors } = useDoctors();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const blank: Omit<Appointment, "id"> = {
    patient: patients[0]?.name ?? "",
    doctor: doctors[0]?.name ?? "",
    date: todayISO(),
    time: "10:00",
    department: DEFAULT_DEPT,
    status: "Scheduled",
  };
  const [form, setForm] = useState<Omit<Appointment, "id">>(blank);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter(
      (a) =>
        (status === "All" || a.status === status) &&
        (!q || [a.id, a.patient, a.doctor, a.department, a.date].join(" ").toLowerCase().includes(q)),
    );
  }, [items, query, status]);

  const submit = () => {
    if (!form.patient || !form.doctor) return;
    if (editing) update(editing.id, form);
    else add(form);
    setOpenForm(false);
  };

  return (
    <AppLayout>
      <SectionTitle
        title="Appointments"
        subtitle={`${items.filter((a) => a.status === "Scheduled").length} upcoming appointments`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(blank);
              setOpenForm(true);
            }}
          >
            <CalendarPlus className="h-4 w-4" /> Book appointment
          </Button>
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by patient, doctor or date"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select className="sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", "Scheduled", "Completed", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Table head={["ID", "Patient", "Doctor", "Date", "Time", "Department", "Status", "Actions"]}>
        {filtered.map((a) => (
          <tr key={a.id} className="hover:bg-secondary/50">
            <td className="px-4 py-3 font-medium">{a.id}</td>
            <td className="px-4 py-3">{a.patient}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.doctor}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.time}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.department}</td>
            <td className="px-4 py-3">
              <Badge tone={a.status === "Completed" ? "success" : a.status === "Cancelled" ? "danger" : "info"}>
                {a.status}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Edit"
                  onClick={() => {
                    setEditing(a);
                    const { id: _id, ...rest } = a;
                    setForm(rest);
                    setOpenForm(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label="Cancel"
                  disabled={a.status === "Cancelled"}
                  onClick={() => update(a.id, { status: "Cancelled" })}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" aria-label="Delete" onClick={() => remove(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={8}>
              <Empty message="No appointments found." />
            </td>
          </tr>
        )}
      </Table>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? "Edit appointment" : "Book appointment"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient">
            <Select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              {patients.map((p) => (
                <option key={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Doctor">
            <Select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
              {doctors.map((d) => (
                <option key={d.id}>{d.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Department">
            <Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Appointment["status"] })}
            >
              {["Scheduled", "Completed", "Cancelled"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenForm(false)}>
            Close
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Book appointment"}</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
