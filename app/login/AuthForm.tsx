"use client";

import { FormEvent, useState } from "react";
import Icon from "../components/Icon";

type Mode = "signin" | "signup" | "confirm";

async function post(url: string, body: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);

  return { ok: response.ok, data };
}

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function switchTo(target: Mode) {
    setMode(target);
    setError("");
    setInfo("");
  }

  async function signIn() {
    const result = await post("/api/auth/login", { email, password });

    if (result.ok) {
      // A full load, so the app shell renders with the new session.
      window.location.href = next;
      return true;
    }

    if (result.data?.code === "UNCONFIRMED") {
      await post("/api/auth/resend", { email });
      setMode("confirm");
      setInfo(`We sent a new verification code to ${email}.`);
      return false;
    }

    setError(result.data?.error || "Sign-in failed");
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");

    if (mode === "signin") {
      await signIn();
    }

    if (mode === "signup") {
      const result = await post("/api/auth/signup", { name, email, password });

      if (result.ok) {
        if (result.data?.confirmed) {
          await signIn();
        } else {
          setMode("confirm");
          setInfo(`We sent a 6-digit verification code to ${email}.`);
        }
      } else {
        setError(result.data?.error || "Sign-up failed");
      }
    }

    if (mode === "confirm") {
      const result = await post("/api/auth/confirm", { email, code });

      if (result.ok) {
        if (password) {
          await signIn();
        } else {
          setMode("signin");
          setInfo("Email verified. You can sign in now.");
        }
      } else {
        setError(result.data?.error || "Verification failed");
      }
    }

    setBusy(false);
  }

  async function resend() {
    setError("");
    const result = await post("/api/auth/resend", { email });

    if (result.ok) {
      setInfo(`A new code was sent to ${email}.`);
    } else {
      setError(result.data?.error || "Could not send a new code");
    }
  }

  const titles: Record<Mode, [string, string]> = {
    signin: ["Welcome back", "Sign in to continue to your study planner."],
    signup: ["Create your account", "Start planning your courses in a minute."],
    confirm: ["Verify your email", "Enter the code we emailed you."],
  };

  return (
    <div className="auth-card">
      <h2>{titles[mode][0]}</h2>
      <p>{titles[mode][1]}</p>

      {mode !== "confirm" && (
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={mode === "signin" ? "active" : undefined}
            onClick={() => switchTo("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : undefined}
            onClick={() => switchTo("signup")}
          >
            Create account
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}
        {info && <div className="notice success">{info}</div>}

        {mode === "signup" && (
          <label>
            Full name
            <input
              required
              maxLength={100}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Prayag Sharma"
            />
          </label>
        )}

        <label>
          Email
          <input
            required
            autoFocus
            type="email"
            autoComplete="email"
            value={email}
            readOnly={mode === "confirm"}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {mode !== "confirm" ? (
          <label>
            Password
            <input
              required
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
            {mode === "signup" && (
              <span className="field-hint">
                At least 8 characters with an upper-case letter, a lower-case
                letter and a number.
              </span>
            )}
          </label>
        ) : (
          <label>
            Verification code
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              value={code}
              onChange={(event) => setCode(event.target.value.trim())}
              placeholder="123456"
            />
          </label>
        )}

        <button className="primary-button" type="submit" disabled={busy}>
          <Icon name={mode === "confirm" ? "check" : "lock"} size={16} />
          {busy
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : mode === "signup"
                ? "Create account"
                : "Verify and continue"}
        </button>
      </form>

      {mode === "confirm" && (
        <p className="auth-note">
          Didn&apos;t get it?{" "}
          <button className="link-button" type="button" onClick={resend}>
            Send a new code
          </button>{" "}
          ·{" "}
          <button
            className="link-button"
            type="button"
            onClick={() => switchTo("signin")}
          >
            Back to sign in
          </button>
        </p>
      )}

      <p className="auth-note">
        Accounts are managed by Amazon Cognito. Your password is never stored
        by this application.
      </p>
    </div>
  );
}
