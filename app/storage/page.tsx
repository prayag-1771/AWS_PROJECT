import PageHeader from "../components/PageHeader";
import StorageBrowser from "./StorageBrowser";

export default function StoragePage() {
  return (
    <>
      <PageHeader
        eyebrow="Amazon S3"
        title="Materials"
        subtitle="Notes, slides, assignments and past papers, kept in a private, versioned and encrypted bucket."
      />

      <StorageBrowser />
    </>
  );
}
