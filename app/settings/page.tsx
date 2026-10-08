import PageHeader from "../components/PageHeader";
import SettingsForm from "./SettingsForm";
import { getSettings, SETTING_OPTIONS } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

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
