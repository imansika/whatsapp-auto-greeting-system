import { useState } from "react";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Public as GeneralIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";

// ── Toggle Switch ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0
      ${checked ? "bg-[#25D366]" : "bg-gray-200"}`}
  >
    <span
      className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 mt-0.5
        ${checked ? "translate-x-5" : "translate-x-0.5"}`}
    />
  </button>
);

// ── Text Input ─────────────────────────────────────────────────────────────
const TextInput = ({ label, value, onChange, type = "text", placeholder = "", hint = "", rightElement = null }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-base font-semibold text-gray-700">{label}</label>}
    <div className="relative flex items-center">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all pr-10"
      />
      {rightElement && (
        <div className="absolute right-3">{rightElement}</div>
      )}
    </div>
    {hint && <p className="text-sm text-gray-400">{hint}</p>}
  </div>
);

// ── Save Button ────────────────────────────────────────────────────────────
const SaveButton = ({ onClick, label = "Save Changes" }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-bold text-base shadow-lg shadow-[#25D366]/25 transition-all"
  >
    <SaveIcon style={{ fontSize: 16 }} />
    {label}
  </button>
);

// ── Profile Tab ────────────────────────────────────────────────────────────
const ProfileTab = ({ user }) => {
  const [fullName, setFullName] = useState(user?.name || "John Doe");
  const [email, setEmail] = useState(user?.email || "john@example.com");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "johndoe");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-extrabold text-gray-900">Profile Information</h3>

      <TextInput label="Full Name" value={fullName} onChange={setFullName} placeholder="Enter your full name" />
      <TextInput label="Email Address" value={email} onChange={setEmail} type="email" placeholder="Enter your email" />
      <TextInput label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+1 234-567-8900" />
      <TextInput label="Username" value={username} onChange={setUsername} placeholder="Enter your username" />

      <div className="flex items-center gap-4 pt-1">
        <SaveButton onClick={handleSave} />
        {saved && (
          <span className="text-base text-[#25D366] font-semibold animate-pulse">
            ✓ Changes saved!
          </span>
        )}
      </div>
    </div>
  );
};

// ── Password Tab ───────────────────────────────────────────────────────────
const PasswordTab = () => {
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} className="text-gray-400 hover:text-[#25D366] transition-colors">
      {show
        ? <VisibilityOffIcon style={{ fontSize: 18 }} />
        : <VisibilityIcon style={{ fontSize: 18 }} />}
    </button>
  );

  const handleSave = () => {
    setError("");
    if (!current) { setError("Please enter your current password."); return; }
    if (newPwd.length < 6) { setError("New password must be at least 6 characters."); return; }
    if (newPwd !== confirm) { setError("New passwords do not match."); return; }
    setSaved(true);
    setCurrent(""); setNewPwd(""); setConfirm("");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-extrabold text-gray-900">Change Password</h3>
        <p className="text-base text-gray-500 mt-0.5">Update your account password to keep it secure.</p>
      </div>

      <TextInput
        label="Current Password"
        value={current}
        onChange={setCurrent}
        type={showCurrent ? "text" : "password"}
        placeholder="Enter your current password"
        rightElement={eyeBtn(showCurrent, () => setShowCurrent((s) => !s))}
      />
      <TextInput
        label="New Password"
        value={newPwd}
        onChange={setNewPwd}
        type={showNew ? "text" : "password"}
        placeholder="Enter new password"
        hint="Password must be at least 6 characters."
        rightElement={eyeBtn(showNew, () => setShowNew((s) => !s))}
      />
      <TextInput
        label="Confirm New Password"
        value={confirm}
        onChange={setConfirm}
        type={showConfirm ? "text" : "password"}
        placeholder="Re-enter new password"
        rightElement={eyeBtn(showConfirm, () => setShowConfirm((s) => !s))}
      />

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-base text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 pt-1">
        <SaveButton onClick={handleSave} label="Update Password" />
        {saved && (
          <span className="text-base text-[#25D366] font-semibold animate-pulse">
            ✓ Password updated!
          </span>
        )}
      </div>
    </div>
  );
};

// ── General Tab ────────────────────────────────────────────────────────────
const GeneralTab = () => {
  const [autoReply, setAutoReply] = useState(true);
  const [delay, setDelay] = useState("5");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Eastern Time (US & Canada)");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all appearance-none cursor-pointer";

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-extrabold text-gray-900">General Settings</h3>

      {/* Auto-Reply toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-base font-semibold text-gray-800">Auto-Reply Enabled</p>
          <p className="text-sm text-gray-400 mt-0.5">Enable or disable automatic replies</p>
        </div>
        <Toggle checked={autoReply} onChange={setAutoReply} />
      </div>

      {/* Delay */}
      <TextInput
        label="Auto-Reply Delay (seconds)"
        value={delay}
        onChange={setDelay}
        type="number"
        placeholder="5"
        hint="Delay before sending automatic replies (0-60 seconds)"
      />

      {/* Language */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Language</label>
        <div className="relative">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            {["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Timezone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Timezone</label>
        <div className="relative">
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={selectClass}>
            {[
              "Eastern Time (US & Canada)",
              "Central Time (US & Canada)",
              "Mountain Time (US & Canada)",
              "Pacific Time (US & Canada)",
              "UTC",
              "London (GMT)",
              "Paris (CET)",
              "Dubai (GST)",
              "India (IST)",
              "Singapore (SGT)",
            ].map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <SaveButton onClick={handleSave} />
        {saved && (
          <span className="text-base text-[#25D366] font-semibold animate-pulse">
            ✓ Settings saved!
          </span>
        )}
      </div>
    </div>
  );
};

// ── Settings Page ──────────────────────────────────────────────────────────
const tabs = [
  { id: "profile",  label: "Profile",  icon: <PersonIcon fontSize="small" /> },
  { id: "password", label: "Password", icon: <LockIcon fontSize="small" /> },
  { id: "general",  label: "General",  icon: <GeneralIcon fontSize="small" /> },
];

export default function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderTab = () => {
    switch (activeTab) {
      case "profile":  return <ProfileTab user={user} />;
      case "password": return <PasswordTab />;
      case "general":  return <GeneralTab />;
      default:         return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
        <p className="text-lg text-gray-500 mt-0.5">Manage your account settings and preferences</p>
      </div>

      {/* Layout */}
      <div className="flex gap-5 items-start">
        {/* Sidebar tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col gap-1 w-52 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all w-full text-left
                ${activeTab === tab.id
                  ? "bg-[#25D366] text-white shadow-md shadow-[#25D366]/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-gray-400"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-7 min-h-64">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}