import { useState } from "react";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import notify from "../utils/notify";

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

  const handleSave = () => {
    notify.success("Profile changes saved.");
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-extrabold text-gray-900">Profile Information</h3>

      <TextInput label="Full Name" value={fullName} onChange={setFullName} placeholder="Enter your full name" />
      <TextInput label="Email Address" value={email} onChange={setEmail} type="email" placeholder="Enter your email" />
      <TextInput label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+1 234-567-8900" />
      <TextInput label="Username" value={username} onChange={setUsername} placeholder="Enter your username" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-1">
        <SaveButton onClick={handleSave} />
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

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} className="text-gray-400 hover:text-[#25D366] transition-colors">
      {show
        ? <VisibilityOffIcon style={{ fontSize: 18 }} />
        : <VisibilityIcon style={{ fontSize: 18 }} />}
    </button>
  );

  const handleSave = () => {
    if (!current) { notify.warning("Please enter your current password."); return; }
    if (newPwd.length < 6) { notify.warning("New password must be at least 6 characters."); return; }
    if (newPwd !== confirm) { notify.warning("New passwords do not match."); return; }
    notify.success("Password updated successfully.");
    setCurrent(""); setNewPwd(""); setConfirm("");
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-1">
        <SaveButton onClick={handleSave} label="Update Password" />
      </div>
    </div>
  );
};

// ── Settings Page ──────────────────────────────────────────────────────────
const tabs = [
  { id: "profile",  label: "Profile",  icon: <PersonIcon fontSize="small" /> },
  { id: "password", label: "Password", icon: <LockIcon fontSize="small" /> },
];

export default function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderTab = () => {
    switch (activeTab) {
      case "profile":  return <ProfileTab user={user} />;
      case "password": return <PasswordTab />;
      default:         return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
        <p className="text-base md:text-lg text-gray-500 mt-0.5">Manage your account settings and preferences</p>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-start">
        {/* Sidebar tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-row lg:flex-col gap-1 w-full lg:w-52 flex-shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all w-full lg:w-auto text-left whitespace-nowrap
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
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-7 min-h-64">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}