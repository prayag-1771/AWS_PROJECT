"use client";

import { FormEvent, useEffect, useState } from "react";

type StoredFile = {
  key: string;
  size: number;
  lastModified: string;
};

const folders = ["projects", "modules", "artifacts", "architecture", "backups"];

export default function StoragePanel() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [message, setMessage] = useState("Loading files...");
  const [uploading, setUploading] = useState(false);

  async function loadFiles() {
    const response = await fetch("/api/files");

    if (!response.ok) {
      setMessage("Failed to load files.");
      return;
    }

    const data: StoredFile[] = await response.json();

    setFiles(data);
    setMessage(data.length === 0 ? "No files uploaded yet." : "");
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;

    setUploading(true);

    const response = await fetch("/api/files", {
      method: "POST",
      body: new FormData(formElement),
    });

    setUploading(false);

    if (response.ok) {
      formElement.reset();
      await loadFiles();
    } else {
      const data = await response.json().catch(() => null);

      alert(data?.error || "Failed to upload file");
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Module Storage</h2>
          <p>Upload project, module and architecture files to Amazon S3.</p>
        </div>
      </div>

      <form className="toolbar" onSubmit={handleSubmit}>
        <select className="select" name="folder" defaultValue="modules">
          {folders.map((folder) => (
            <option key={folder}>{folder}</option>
          ))}
        </select>

        <input className="search" type="file" name="file" required />

        <button className="primary-button" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="project-list">
        {message && (
          <div className="project-row">
            <div>
              <span>{message}</span>
            </div>
          </div>
        )}

        {files.map((file) => (
          <div className="project-row" key={file.key}>
            <div>
              <strong>{file.key}</strong>
              <span>{new Date(file.lastModified).toLocaleString()}</span>
            </div>

            <span className="status">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
