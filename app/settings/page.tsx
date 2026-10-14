import PageHeader from "../components/PageHeader";
import SettingsForm from "./SettingsForm";
import { getSettings, SETTING_OPTIONS } from "@/lib/settings";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettings(user.sub);

  return (
    <>
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        subtitle="Planner defaults, stored in the database."
      />

      <SettingsForm settings={settings} options={SETTING_OPTIONS} />
    </>
  );
}
