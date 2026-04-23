import { useState } from "react";
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import notify, { getErrorMessage } from "../utils/notify";
import authService from "../services/authservice";

// ── Text Input ─────────────────────────────────────────────────────────────
const TextInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  hint = "",
  rightElement = null,
  readOnly = false,
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-base font-semibold text-gray-700">{label}</label>}
    <div className="relative flex items-center">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 text-base text-gray-800 placeholder-gray-400 transition-all pr-10 ${
          readOnly
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
        }`}
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
const ProfileTab = ({ user, onUserUpdated }) => {
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [username, setUsername] = useState(user?.username || "");

  const handleSave = () => {
    const cleanUsername = String(username || "").trim();
    if (!cleanUsername) {
      notify.warning("Username is required.");
      return;
    }

    const updatedUser = authService.updateCurrentUser({
      username: cleanUsername,
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
    });

    if (onUserUpdated) {
      onUserUpdated(updatedUser);
    }

    setUsername(updatedUser.username || "");
    setEmail(updatedUser.email || "");
    setPhone(updatedUser.phone || "");
    notify.success("Profile changes saved.");
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-extrabold text-gray-900">Profile Information</h3>

      <TextInput label="Username" value={username} onChange={setUsername} placeholder="Enter your username" />
      <TextInput
        label="Email Address"
        value={email}
        onChange={setEmail}
        type="email"
        placeholder="Email updates are managed by admin support"
        hint="Email is currently read-only in settings."
        readOnly
      />
      <TextInput label="Phone Number" value={phone} onChange={setPhone} type="tel" placeholder="+1 234-567-8900" />

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
  const [saving, setSaving] = useState(false);

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} className="text-gray-400 hover:text-[#25D366] transition-colors">
      {show
        ? <VisibilityOffIcon style={{ fontSize: 18 }} />
        : <VisibilityIcon style={{ fontSize: 18 }} />}
    </button>
  );

  const handleSave = async () => {
    if (!current) { notify.warning("Please enter your current password."); return; }
    if (newPwd.length < 6) { notify.warning("New password must be at least 6 characters."); return; }
    if (newPwd !== confirm) { notify.warning("New passwords do not match."); return; }

    try {
      setSaving(true);
      const response = await authService.changePassword(current, newPwd);
      notify.success(response?.message || "Password updated successfully.");
      setCurrent("");
      setNewPwd("");
      setConfirm("");
    } catch (error) {
      notify.error(getErrorMessage(error, "Failed to update password."));
    } finally {
      setSaving(false);
    }
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
        <SaveButton onClick={handleSave} label={saving ? "Updating Password..." : "Update Password"} />
      </div>
    </div>
  );
};

// ── Settings Page ──────────────────────────────────────────────────────────
const tabs = [
  { id: "profile",  label: "Profile",  icon: <PersonIcon fontSize="small" /> },
  { id: "password", label: "Password", icon: <LockIcon fontSize="small" /> },
];

export default function SettingsPage({ user, onUserUpdated }) {
  const [activeTab, setActiveTab] = useState("profile");

  const renderTab = () => {
    switch (activeTab) {
      case "profile":  return <ProfileTab user={user} onUserUpdated={onUserUpdated} />;
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