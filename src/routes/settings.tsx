import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button, Card, Field, Input, SectionTitle } from "@/components/ui-kit";
import { logout, useHospitalInfo, type HospitalInfo } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [
      { title: "Settings | MediCare Hospital" },
      { name: "description", content: "Update MediCare Hospital contact information, manage the admin profile and sign out of the management system." },
      { property: "og:title", content: "Settings | MediCare Hospital" },
      { property: "og:description", content: "Hospital information and admin profile settings." },
    ],
  }),
});

function Settings() {
  const [info, save] = useHospitalInfo();
  const [draft, setDraft] = useState<HospitalInfo>(info);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setDraft(info), [info]);

  const commit = () => {
    save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout>
      <SectionTitle title="Settings" subtitle="Hospital information and admin profile" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Hospital information</h2>
          <div className="mt-4 space-y-4">
            <Field label="Hospital name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Address">
              <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Admin profile</h2>
          <div className="mt-4 space-y-4">
            <Field label="Full name">
              <Input value={draft.adminName} onChange={(e) => setDraft({ ...draft, adminName: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={draft.adminEmail} onChange={(e) => setDraft({ ...draft, adminEmail: e.target.value })} />
            </Field>
            <Field label="Role">
              <Input value={draft.adminRole} onChange={(e) => setDraft({ ...draft, adminRole: e.target.value })} />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button onClick={commit}>Save changes</Button>
            {saved && <span className="text-sm text-success">Settings saved</span>}
            <Button
              variant="danger"
              className="ml-auto"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
