import { useEffect, useState } from "react";
import {
  Chat as ChatIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import greetingService from "../services/greetingservice";
import notify, { getErrorMessage } from "../utils/notify";

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

// ── Keyword Tag ────────────────────────────────────────────────────────────
const KeywordTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-sm font-semibold px-2.5 py-1 rounded-full">
    {label}
    {onRemove && (
      <button type="button" onClick={onRemove} className="hover:text-red-500 transition-colors">
        <CloseIcon style={{ fontSize: 12 }} />
      </button>
    )}
  </span>
);

// ── Modal (Add / Edit) ─────────────────────────────────────────────────────
const GreetingModal = ({ greeting, onSave, onClose, saving, error }) => {
  const [title, setTitle] = useState(greeting?.title || "");
  const [message, setMessage] = useState(greeting?.message || "");
  const [keywords, setKeywords] = useState(greeting?.keywords || []);
  const [kwInput, setKwInput] = useState("");

  const addKeyword = () => {
    const kw = kwInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
    }
    setKwInput("");
  };

  const handleKwKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSave = () => {
    if (!title.trim() || !message.trim()) return;
    onSave({ title: title.trim(), message: message.trim(), keywords });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col gap-5 p-4 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900">
            {greeting ? "Edit Greeting" : "Add New Greeting"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <CloseIcon style={{ fontSize: 20, color: "#6b7280" }} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Default Greeting"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-gray-700">Auto-Reply Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your automated reply message..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Keywords */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-semibold text-gray-700">
            Trigger Keywords
            <span className="text-gray-400 font-normal ml-1 text-sm">(press Enter or comma to add)</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={handleKwKeyDown}
              placeholder="Add keyword..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-base font-bold transition-all"
            >
              Add
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {keywords.map((kw) => (
                <KeywordTag
                  key={kw}
                  label={kw}
                  onRemove={() => setKeywords((prev) => prev.filter((k) => k !== kw))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-base font-bold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !message.trim() || saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-40 disabled:cursor-not-allowed text-white text-base font-bold shadow-lg shadow-[#25D366]/25 transition-all"
          >
            <SaveIcon style={{ fontSize: 16 }} />
            {saving
              ? (greeting ? "Saving..." : "Adding...")
              : (greeting ? "Save Changes" : "Add Greeting")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Greeting Card ──────────────────────────────────────────────────────────
const GreetingCard = ({ greeting, onToggle, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
    <div className="px-6 py-5 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
            <ChatIcon style={{ color: "#25D366", fontSize: 18 }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{greeting.title}</h3>
        </div>
        <Toggle checked={greeting.enabled} onChange={() => onToggle(greeting.id)} />
      </div>

      {/* Message */}
      <p className="text-base text-gray-600 leading-relaxed pl-11">
        {greeting.message}
      </p>

      {/* Keywords */}
      {greeting.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-11">
          {greeting.keywords.map((kw) => (
            <KeywordTag key={kw} label={kw} />
          ))}
        </div>
      )}
    </div>

    {/* Divider + actions */}
    <div className="border-t border-gray-100 px-6 py-3 flex items-center gap-4">
      <button
        onClick={() => onEdit(greeting)}
        className="flex items-center gap-1.5 text-base font-semibold text-gray-500 hover:text-[#25D366] transition-colors"
      >
        <EditIcon style={{ fontSize: 16 }} />
        Edit
      </button>
      <button
        onClick={() => onDelete(greeting.id)}
        className="flex items-center gap-1.5 text-base font-semibold text-gray-500 hover:text-red-500 transition-colors"
      >
        <DeleteIcon style={{ fontSize: 16 }} />
        Delete
      </button>
    </div>
  </div>
);

// ── Greeting Messages Page ─────────────────────────────────────────────────
export default function GreetingMessagesPage() {
  const [greetings, setGreetings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const loadGreetings = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await greetingService.list();
        setGreetings(data);
      } catch (err) {
        setError(
          err?.response?.data?.error || "Failed to load greeting messages.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadGreetings();
  }, []);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); setModalError(""); };
  const openEdit = (g) => { setEditTarget(g); setModalOpen(true); setModalError(""); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setModalError(""); };

  const handleSave = async (data) => {
    try {
      setSaving(true);
      setModalError("");
      setError("");

      if (editTarget) {
        const updatedGreeting = await greetingService.update(editTarget.id, {
          ...data,
          enabled: editTarget.enabled,
        });
        setGreetings((prev) =>
          prev.map((g) => (g.id === editTarget.id ? updatedGreeting : g)),
        );
        notify.success("Greeting updated successfully.");
      } else {
        const createdGreeting = await greetingService.create({
          ...data,
          enabled: true,
        });
        setGreetings((prev) => [createdGreeting, ...prev]);
        notify.success("Greeting created successfully.");
      }

      closeModal();
    } catch (err) {
      const errorMsg = getErrorMessage(err, "Failed to save greeting message.");
      setModalError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    const currentGreeting = greetings.find((g) => g.id === id);
    if (!currentGreeting) return;

    try {
      setError("");
      const updatedGreeting = await greetingService.updateStatus(
        id,
        !currentGreeting.enabled,
      );
      setGreetings((prev) =>
        prev.map((g) => (g.id === id ? updatedGreeting : g)),
      );
      notify.info(
        updatedGreeting.enabled ? "Greeting enabled." : "Greeting disabled.",
      );
    } catch (err) {
      const message = getErrorMessage(err, "Failed to update greeting status.");
      setError(message);
      notify.error(message);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await greetingService.remove(id);
      setGreetings((prev) => prev.filter((g) => g.id !== id));
      notify.warning("Greeting deleted.");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to delete greeting message.");
      setError(message);
      notify.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Heading row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Greeting Messages
          </h2>
          <p className="text-base md:text-lg text-gray-500 mt-0.5">
            Create and manage your automated greeting messages
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-bold text-base shadow-lg shadow-[#25D366]/25 transition-all flex-shrink-0 w-full sm:w-auto"
        >
          <AddIcon style={{ fontSize: 18 }} />
          Add New
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-base text-red-600">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center text-base text-gray-500">
            Loading greeting messages...
          </div>
        ) : greetings.length > 0 ? (
          greetings.map((g) => (
            <GreetingCard
              key={g.id}
              greeting={g}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-4">
              <ChatIcon style={{ color: "#25D366", fontSize: 28 }} />
            </div>
            <p className="text-lg font-semibold text-gray-700">No greeting messages yet</p>
            <p className="text-base text-gray-400 mt-1 mb-5">
              Click "Add New" to create your first automated greeting.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-base shadow-lg shadow-[#25D366]/25 transition-all"
            >
              <AddIcon style={{ fontSize: 18 }} />
              Add New
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <GreetingModal
          greeting={editTarget}
          onSave={handleSave}
          onClose={closeModal}
          saving={saving}
          error={modalError}
        />
      )}
    </div>
  );
}