"use client";

import { FormEvent, useEffect, useState } from "react";
import DeleteButton from "../components/DeleteButton";
import Icon from "../components/Icon";
import { formatBytes } from "@/lib/format";

type StoredFile = {
  key: string;
  size: number;
  lastModified: string;
};

const folders = ["projects", "modules", "artifacts", "architecture", "backups"];

export default function StorageBrowser() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [folder, setFolder] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    fetch("/api/files")
      .then(async (response) => {
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load files");
        }

        return data as StoredFile[];
      })
      .then((data) => {
        if (active) {
          setFiles(data);
          setError("");
        }
      })
      .catch((reason: Error) => {
        if (active) {
          setError(reason.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

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
      setReloadKey((value) => value + 1);
    } else {
      const data = await response.json().catch(() => null);

      setError(data?.error || "Failed to upload file");
    }
  }

  const visible = files.filter(
    (file) => !folder || file.key.startsWith(`${folder}/`)
  );
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <>
      <div className="form-panel wide">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Folder
              <select name="folder" defaultValue="modules">
                {folders.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              File
              <input type="file" name="file" required />
              <span className="field-hint">Up to 10 MB.</span>
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={uploading}>
            <Icon name="upload" size={16} />
            {uploading ? "Uploading..." : "Upload to S3"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Stored Files</h2>
            <p>
              {files.length} {files.length === 1 ? "object" : "objects"} ·{" "}
              {formatBytes(totalSize)}
            </p>
          </div>

          <select
            className="select"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
          >
            <option value="">All folders</option>
            {folders.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="panel-body">
            <div className="notice error">{error}</div>
          </div>
        )}

        {!error && visible.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="file" size={22} />
            </div>
            <strong>{loading ? "Loading files..." : "No files here yet"}</strong>
            {!loading && <span>Upload a file to store it in Amazon S3.</span>}
          </div>
        )}

        {visible.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Folder</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((file) => {
                  const [fileFolder, name] = file.key.split("/");
                  const url = `/api/files/object?key=${encodeURIComponent(file.key)}`;

                  return (
                    <tr key={file.key}>
                      <td>
                        <strong>{name.replace(/^\d+-/, "")}</strong>
                      </td>
                      <td>
                        <span className="badge indigo">{fileFolder}</span>
                      </td>
                      <td>{formatBytes(file.size)}</td>
                      <td>{new Date(file.lastModified).toLocaleString()}</td>
                      <td className="actions">
                        <a className="secondary-button button-sm" href={url}>
                          <Icon name="download" size={14} />
                          Download
                        </a>
                        <DeleteButton
                          small
                          url={url}
                          confirmText={`Delete "${name.replace(/^\d+-/, "")}"?`}
                          onDeleted={() => setReloadKey((value) => value + 1)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
