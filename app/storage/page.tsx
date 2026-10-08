import PageHeader from "../components/PageHeader";
import StorageBrowser from "./StorageBrowser";

export default function StoragePage() {
  return (
    <>
      <PageHeader
        eyebrow="Amazon S3"
        title="Storage"
        subtitle="Design files, build artifacts and backups, kept in a private, versioned and encrypted bucket."
      />

      <StorageBrowser />
    </>
  );
}
