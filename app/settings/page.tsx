import Link from "next/link";

export default function SettingsPage() {
  return (
    <>
        <header className="topbar">
          <div>
            <p className="eyebrow">PLATFORM</p>
            <h1>Settings</h1>
          </div>
        </header>

        <div className="form-panel">
          <form>
            <label>
              AWS Region
              <select defaultValue="Mumbai">
                <option>Mumbai (ap-south-1)</option>
                <option>Singapore (ap-southeast-1)</option>
                <option>Virginia (us-east-1)</option>
              </select>
            </label>

            <label>
              Default Deployment Strategy
              <select defaultValue="Rolling">
                <option>Rolling Deployment</option>
                <option>Blue / Green</option>
                <option>Canary</option>
              </select>
            </label>

            <label>
              Monitoring
              <select defaultValue="Enabled">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </label>

            <label>
              Notifications
              <select defaultValue="Important events only">
                <option>All events</option>
                <option>Important events only</option>
                <option>Disabled</option>
              </select>
            </label>

            <button className="primary-button" type="button">
              Save Settings
            </button>
          </form>
        </div>
    </>
  );
}