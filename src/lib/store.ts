import { useCallback, useEffect, useState } from "react";

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  department: string;
  address: string;
  bloodGroup: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  department: string;
  experience: number;
  availability: "Available" | "On Leave" | "In Surgery";
  phone: string;
};

export type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  department: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};

export type Medicine = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  expiry: string;
};

export type Bill = {
  id: string;
  patient: string;
  services: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending";
};

export type HospitalInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const shift = (d: number) => {
  const t = new Date();
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

export const seedPatients: Patient[] = [
  { id: "P-1001", name: "Aarav Menon", age: 34, gender: "Male", phone: "+91 98450 11223", department: "Cardiology", address: "12 Palm Grove, Kochi", bloodGroup: "O+" },
  { id: "P-1002", name: "Sara Thomas", age: 28, gender: "Female", phone: "+91 99870 45512", department: "Dermatology", address: "44 Lake Road, Kollam", bloodGroup: "A+" },
  { id: "P-1003", name: "Rohit Nair", age: 52, gender: "Male", phone: "+91 90123 88776", department: "Orthopedics", address: "7 Hill View, Thrissur", bloodGroup: "B+" },
  { id: "P-1004", name: "Meera Krishnan", age: 41, gender: "Female", phone: "+91 97456 33210", department: "Neurology", address: "89 MG Road, Kozhikode", bloodGroup: "AB+" },
  { id: "P-1005", name: "Daniel Joseph", age: 9, gender: "Male", phone: "+91 96332 77441", department: "Pediatrics", address: "23 Church St, Alappuzha", bloodGroup: "O-" },
  { id: "P-1006", name: "Fatima Rahman", age: 63, gender: "Female", phone: "+91 93871 55009", department: "Cardiology", address: "5 Beach Lane, Kannur", bloodGroup: "A-" },
];

export const seedDoctors: Doctor[] = [
  { id: "D-201", name: "Dr. Anjali Varma", specialization: "Interventional Cardiologist", department: "Cardiology", experience: 14, availability: "Available", phone: "+91 98111 20001" },
  { id: "D-202", name: "Dr. Imran Sheikh", specialization: "Orthopedic Surgeon", department: "Orthopedics", experience: 11, availability: "In Surgery", phone: "+91 98111 20002" },
  { id: "D-203", name: "Dr. Priya Raghavan", specialization: "Neurologist", department: "Neurology", experience: 9, availability: "Available", phone: "+91 98111 20003" },
  { id: "D-204", name: "Dr. Kevin Mathew", specialization: "Pediatrician", department: "Pediatrics", experience: 7, availability: "Available", phone: "+91 98111 20004" },
  { id: "D-205", name: "Dr. Leena George", specialization: "Dermatologist", department: "Dermatology", experience: 12, availability: "On Leave", phone: "+91 98111 20005" },
  { id: "D-206", name: "Dr. Suresh Pillai", specialization: "General Physician", department: "General Medicine", experience: 18, availability: "Available", phone: "+91 98111 20006" },
];

export const seedAppointments: Appointment[] = [
  { id: "A-3001", patient: "Aarav Menon", doctor: "Dr. Anjali Varma", date: today(), time: "09:30", department: "Cardiology", status: "Scheduled" },
  { id: "A-3002", patient: "Sara Thomas", doctor: "Dr. Leena George", date: today(), time: "10:15", department: "Dermatology", status: "Completed" },
  { id: "A-3003", patient: "Rohit Nair", doctor: "Dr. Imran Sheikh", date: today(), time: "11:00", department: "Orthopedics", status: "Scheduled" },
  { id: "A-3004", patient: "Meera Krishnan", doctor: "Dr. Priya Raghavan", date: shift(1), time: "14:00", department: "Neurology", status: "Scheduled" },
  { id: "A-3005", patient: "Daniel Joseph", doctor: "Dr. Kevin Mathew", date: shift(2), time: "16:30", department: "Pediatrics", status: "Cancelled" },
  { id: "A-3006", patient: "Fatima Rahman", doctor: "Dr. Anjali Varma", date: today(), time: "17:00", department: "Cardiology", status: "Scheduled" },
];

export const seedMedicines: Medicine[] = [
  { id: "M-501", name: "Amoxicillin 500mg", category: "Antibiotic", quantity: 420, price: 12.5, expiry: "2027-04-30" },
  { id: "M-502", name: "Paracetamol 650mg", category: "Analgesic", quantity: 85, price: 3.2, expiry: "2026-11-15" },
  { id: "M-503", name: "Atorvastatin 20mg", category: "Cardiac", quantity: 12, price: 18.9, expiry: "2026-10-01" },
  { id: "M-504", name: "Insulin Glargine", category: "Diabetes", quantity: 60, price: 240, expiry: "2026-09-20" },
  { id: "M-505", name: "Cetirizine 10mg", category: "Antihistamine", quantity: 0, price: 2.1, expiry: "2028-01-10" },
  { id: "M-506", name: "Ibuprofen 400mg", category: "Analgesic", quantity: 310, price: 4.6, expiry: "2027-08-05" },
];

export const seedBills: Bill[] = [
  { id: "INV-9001", patient: "Aarav Menon", services: "Cardiac consultation, ECG", amount: 4200, date: today(), status: "Paid" },
  { id: "INV-9002", patient: "Sara Thomas", services: "Skin biopsy, Medication", amount: 2650, date: today(), status: "Pending" },
  { id: "INV-9003", patient: "Rohit Nair", services: "X-Ray, Physiotherapy", amount: 5400, date: shift(-1), status: "Paid" },
  { id: "INV-9004", patient: "Meera Krishnan", services: "MRI Scan", amount: 9800, date: shift(-2), status: "Pending" },
];

export const seedInfo: HospitalInfo = {
  name: "MediCare Hospital",
  address: "18 Marine Drive, Kochi, Kerala 682031",
  phone: "+91 484 220 4500",
  email: "care@medicare-hospital.com",
  adminName: "Naseef Anvar",
  adminEmail: "admin@medicare-hospital.com",
  adminRole: "Hospital Administrator",
};

const KEYS = {
  patients: "mc_patients",
  doctors: "mc_doctors",
  appointments: "mc_appointments",
  medicines: "mc_medicines",
  bills: "mc_bills",
  info: "mc_info",
  auth: "mc_auth",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("mc-store", { detail: key }));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail === key) setValue(read(key, fallback));
    };
    window.addEventListener("mc-store", handler);
    return () => window.removeEventListener("mc-store", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return [value, save] as const;
}

export type Entity = { id: string };

export function useCollection<T extends Entity>(key: string, fallback: T[], prefix: string) {
  const [items, save] = useStored<T[]>(key, fallback);

  const add = useCallback(
    (item: Omit<T, "id">) => {
      const id = `${prefix}-${Math.floor(1000 + Math.random() * 8999)}`;
      save([{ ...(item as T), id }, ...items]);
    },
    [items, save, prefix],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => save(items.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [items, save],
  );

  const remove = useCallback((id: string) => save(items.filter((i) => i.id !== id)), [items, save]);

  return { items, add, update, remove, save };
}

export const usePatients = () => useCollection<Patient>(KEYS.patients, seedPatients, "P");
export const useDoctors = () => useCollection<Doctor>(KEYS.doctors, seedDoctors, "D");
export const useAppointments = () => useCollection<Appointment>(KEYS.appointments, seedAppointments, "A");
export const useMedicines = () => useCollection<Medicine>(KEYS.medicines, seedMedicines, "M");
export const useBills = () => useCollection<Bill>(KEYS.bills, seedBills, "INV");
export const useHospitalInfo = () => useStored<HospitalInfo>(KEYS.info, seedInfo);

export const DEPARTMENTS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "General Medicine",
];

export function login(email: string) {
  window.localStorage.setItem(KEYS.auth, JSON.stringify({ email, at: Date.now() }));
  window.dispatchEvent(new CustomEvent("mc-store", { detail: KEYS.auth }));
}

export function logout() {
  window.localStorage.removeItem(KEYS.auth);
  window.dispatchEvent(new CustomEvent("mc-store", { detail: KEYS.auth }));
}

export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(KEYS.auth);
}

export const todayISO = today;
export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
