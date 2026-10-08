"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function NewProjectPage() {
  const [created, setCreated] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.get("name"),
        environment: form.get("environment"),
        architecture: form.get("architecture"),
        region: form.get("region"),
      }),
    });

    if (response.ok) {
      setCreated(true);
    } else {
      alert("Failed to create project");
    }
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>CloudNativeHub</span>
        </div>

        <nav>
          <Link className="nav-link" href="/">
            Dashboard
          </Link>
          <Link className="nav-link active" href="/projects">
            Projects
          </Link>
          <Link className="nav-link" href="/modules">
            Modules
          </Link>
          <Link className="nav-link" href="/settings">
            Settings
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <span>● AWS Mumbai</span>
          <small>ap-south-1</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PROJECT MANAGEMENT</p>
            <h1>Create Project</h1>
          </div>
        </header>

        <div className="form-panel">
          {created ? (
            <div className="success-box">
              <h2>Project created successfully</h2>
              <p>Your project has been added to CloudNativeHub.</p>
              <Link href="/projects">← Back to Projects</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Project Name
                <input
                  required
                  name="name"
                  placeholder="e.g. E-Commerce Platform"
                />
              </label>

              <label>
                Environment
                <select name="environment">
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </label>

              <label>
                Architecture
                <select name="architecture">
                  <option>Microservices</option>
                  <option>Monolith</option>
                  <option>Serverless</option>
                </select>
              </label>

              <label>
                AWS Region
                <select name="region">
                  <option>Asia Pacific (Mumbai)</option>
                  <option>Asia Pacific (Singapore)</option>
                  <option>US East (N. Virginia)</option>
                </select>
              </label>

              <button className="primary-button" type="submit">
                Create Project
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}