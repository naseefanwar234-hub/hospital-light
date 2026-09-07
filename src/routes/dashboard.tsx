import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, CalendarCheck, IndianRupee, Stethoscope, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Card, SectionTitle, Table } from "@/components/ui-kit";
import { inr, todayISO, useAppointments, useBills, useDoctors, usePatients } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard | MediCare Hospital" },
      { name: "description", content: "Live hospital overview: patients, doctors, today's appointments, bed availability and revenue at MediCare Hospital." },
      { property: "og:title", content: "Dashboard | MediCare Hospital" },
      { property: "og:description", content: "Live hospital overview with patient, appointment and revenue insights." },
    ],
  }),
});

const patientTrend = [
  { m: "Apr", patients: 210 },
  { m: "May", patients: 265 },
  { m: "Jun", patients: 240 },
  { m: "Jul", patients: 310 },
  { m: "Aug", patients: 352 },
  { m: "Sep", patients: 398 },
];

function Dashboard() {
  const { items: patients } = usePatients();
  const { items: doctors } = useDoctors();
  const { items: appointments } = useAppointments();
  const { items: bills } = useBills();

  const today = todayISO();
  const todays = appointments.filter((a) => a.date === today);
  const revenue = bills.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);
  const beds = 120 - patients.length * 3;

  const byDept = Object.entries(
    appointments.reduce<Record<string, number>>((acc, a) => {
      acc[a.department] = (acc[a.department] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([dept, count]) => ({ dept, count }));

  const stats = [
    { label: "Total Patients", value: patients.length, icon: Users, note: "Registered records" },
    { label: "Total Doctors", value: doctors.length, icon: Stethoscope, note: "Across 6 departments" },
    { label: "Today's Appointments", value: todays.length, icon: CalendarCheck, note: "Scheduled for today" },
    { label: "Available Beds", value: Math.max(beds, 0), icon: BedDouble, note: "Out of 120 beds" },
    { label: "Revenue", value: inr(revenue), icon: IndianRupee, note: "Collected payments" },
  ];

  return (
    <AppLayout>
      <SectionTitle title="Dashboard" subtitle="Snapshot of hospital activity today" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <Card key={label}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Patient visits trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="var(--color-chart-1)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Appointments by department</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="dept" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <h2 className="mb-3 mt-6 text-sm font-semibold">Recent appointments</h2>
      <Table head={["ID", "Patient", "Doctor", "Department", "Date", "Time", "Status"]}>
        {appointments.slice(0, 6).map((a) => (
          <tr key={a.id} className="hover:bg-secondary/50">
            <td className="px-4 py-3 font-medium">{a.id}</td>
            <td className="px-4 py-3">{a.patient}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.doctor}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.department}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
            <td className="px-4 py-3 text-muted-foreground">{a.time}</td>
            <td className="px-4 py-3">
              <Badge tone={a.status === "Completed" ? "success" : a.status === "Cancelled" ? "danger" : "info"}>
                {a.status}
              </Badge>
            </td>
          </tr>
        ))}
      </Table>
    </AppLayout>
  );
}
