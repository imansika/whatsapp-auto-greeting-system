import { useEffect, useMemo, useState } from "react";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import messageLogService from "../services/messagelogservice";

const FILTER_OPTIONS = ["All Messages", "Auto-Replied", "Pending", "Online"];
const AVATAR_COLORS = ["#25D366", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6"];

const toRelativeTime = (value) => {
  const date = new Date(value);
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} minute(s) ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hour(s) ago`;
  return `${Math.floor(diffMs / day)} day(s) ago`;
};

const colorFromPhone = (phone) => {
  const key = String(phone || "");
  const hash = key.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const normalizeWhatsAppNumber = (value) =>
  String(value || "")
    .replace(/@(c|g)\.us$/i, "")
    .replace(/@s\.whatsapp\.net$/i, "");

const displayNameFromPhone = (phone, senderName) => {
  const safeSenderName = String(senderName || "").trim();
  if (safeSenderName) {
    return safeSenderName;
  }
  return "Unknown Number";
};

const initialsFromPhone = (phone) => {
  const digits = normalizeWhatsAppNumber(phone).replace(/\D/g, "");
  return (digits.slice(-2) || "U").toUpperCase();
};

const buildMessageCards = (rows) => {
  const ordered = [...rows].sort((a, b) => {
    const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (timeDiff !== 0) return timeDiff;
    // Tiebreaker: incoming always has a lower id than the outgoing that follows
    return Number(a.id) - Number(b.id);
  });

  const pendingBySender = new Map();
  const cards = [];

  ordered.forEach((row) => {
    const sender = row.sender_number;
    if (!sender) return;

    if (row.direction === "incoming") {
      if (!pendingBySender.has(sender)) {
        pendingBySender.set(sender, []);
      }
      pendingBySender.get(sender).push(row);
      return;
    }

    if (row.direction === "outgoing") {
      const pendingQueue = pendingBySender.get(sender) || [];
      const incoming = pendingQueue.shift();

      if (incoming) {
        const cleanPhone = normalizeWhatsAppNumber(sender);
        cards.push({
          id: incoming.id,
          name: displayNameFromPhone(sender, incoming.sender_name),
          phone: cleanPhone,
          initials: initialsFromPhone(sender),
          color: colorFromPhone(sender),
          time: toRelativeTime(incoming.created_at),
          online: false,
          incoming: incoming.message_text || "",
          autoReply: row.message_text || "",
          status: "auto-replied",
          createdAt: incoming.created_at,
        });
      }
    }
  });

  pendingBySender.forEach((pendingRows, sender) => {
    pendingRows.forEach((incoming) => {
      const cleanPhone = normalizeWhatsAppNumber(sender);
      cards.push({
        id: incoming.id,
        name: displayNameFromPhone(sender, incoming.sender_name),
        phone: cleanPhone,
        initials: initialsFromPhone(sender),
        color: colorFromPhone(sender),
        time: toRelativeTime(incoming.created_at),
        online: false,
        incoming: incoming.message_text || "",
        autoReply: "Pending auto-reply",
        status: "pending",
        createdAt: incoming.created_at,
      });
    });
  });

  return cards.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

// ── Message Card ───────────────────────────────────────────────────────────
const MessageCard = ({ msg }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    {/* Header row */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow"
            style={{ backgroundColor: msg.color }}
          >
            {msg.initials}
          </div>
          {msg.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] border-2 border-white" />
          )}
        </div>

        {/* Name & phone */}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-gray-900">{msg.name}</p>
            {msg.online && (
              <span className="text-xs font-semibold text-[#25D366] bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 py-0.5 rounded-full">
                Online
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{msg.phone}</p>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1 text-sm text-gray-400 flex-shrink-0">
        <TimeIcon style={{ fontSize: 13 }} />
        <span>{msg.time}</span>
      </div>
    </div>

    {/* Incoming message */}
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
      <p className="text-base text-gray-700 leading-relaxed">{msg.incoming}</p>
    </div>

    {/* Auto reply */}
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm font-semibold text-[#16a34a]">Auto Reply</span>
        <DoneAllIcon style={{ fontSize: 14, color: "#25D366" }} />
      </div>
      <p className="text-base text-gray-700 leading-relaxed">{msg.autoReply}</p>
    </div>
  </div>
);

// ── Messages Page ──────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Messages");
  const [showFilter, setShowFilter] = useState(false);
  const [messageCards, setMessageCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      try {
        if (!mounted) return;
        setLoading(true);
        setError("");
        const rows = await messageLogService.list();
        if (!mounted) return;
        setMessageCards(buildMessageCards(rows));
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.error || "Failed to load messages.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => messageCards.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.phone.includes(search) ||
      msg.incoming.toLowerCase().includes(search.toLowerCase());

    if (filter === "Online") return matchesSearch && msg.online;
    if (filter === "Pending") return matchesSearch && msg.status === "pending";
    if (filter === "Auto-Replied") return matchesSearch && msg.status === "auto-replied";
    return matchesSearch;
  }), [messageCards, search, filter]);

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Messages</h2>
        <p className="text-lg text-gray-500 mt-0.5">
          View and manage all incoming messages and auto-replies
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-base text-red-600">
          {error}
        </div>
      )}

      {/* Search + Filter row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-[#25D366] focus-within:border-transparent transition-all">
          <SearchIcon style={{ color: "#9ca3af", fontSize: 20 }} />
          <input
            type="text"
            placeholder="Search messages, contacts, or phone numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-base text-gray-700 placeholder-gray-400 bg-transparent outline-none"
          />
        </div>

        {/* Filter icon button */}
        <button
          onClick={() => setShowFilter((v) => !v)}
          className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
        >
          <FilterIcon style={{ color: "#6b7280", fontSize: 20 }} />
        </button>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all min-w-36"
          >
            <span className="flex-1 text-left">{filter}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilter && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-40 py-1">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setFilter(opt); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-base transition-colors
                    ${filter === opt
                      ? "text-[#25D366] font-semibold bg-[#f0fdf4]"
                      : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="text-base text-gray-500">
        Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
        <span className="font-semibold text-gray-700">{messageCards.length}</span> messages
      </p>

      {/* Message list */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center text-base text-gray-500">
            Loading messages...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((msg) => <MessageCard key={msg.id} msg={msg} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <SearchIcon style={{ color: "#9ca3af", fontSize: 28 }} />
            </div>
            <p className="text-lg font-semibold text-gray-600">No messages found</p>
            <p className="text-base text-gray-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}