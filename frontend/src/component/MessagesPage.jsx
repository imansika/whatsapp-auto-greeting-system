import { useState } from "react";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  DoneAll as DoneAllIcon,
  Circle as CircleIcon,
} from "@mui/icons-material";

// ── Sample data ────────────────────────────────────────────────────────────
const sampleMessages = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1 234-567-8900",
    initials: "S",
    color: "#25D366",
    time: "2 minutes ago",
    online: false,
    incoming: "Hi, I need information about your services. Can you help me?",
    autoReply: "Thank you for reaching out! We'd be happy to help you with information about our services.",
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "+1 234-567-8901",
    initials: "M",
    color: "#3b82f6",
    time: "15 minutes ago",
    online: false,
    incoming: "What are your business hours?",
    autoReply: "We are open Monday to Friday, 9 AM to 6 PM. How can we assist you?",
  },
  {
    id: 3,
    name: "Emily Davis",
    phone: "+1 234-567-8902",
    initials: "E",
    color: "#f59e0b",
    time: "1 hour ago",
    online: true,
    incoming: "Do you offer free consultations?",
    autoReply: "Yes! We offer a free 30-minute consultation. Would you like to schedule one?",
  },
  {
    id: 4,
    name: "James Wilson",
    phone: "+1 234-567-8903",
    initials: "J",
    color: "#8b5cf6",
    time: "2 hours ago",
    online: false,
    incoming: "I'd like to know more about your pricing plans.",
    autoReply: "We have flexible pricing plans starting from $29/month. I'll send you a detailed breakdown shortly.",
  },
  {
    id: 5,
    name: "Priya Patel",
    phone: "+1 234-567-8904",
    initials: "P",
    color: "#ef4444",
    time: "3 hours ago",
    online: true,
    incoming: "Can I speak to a customer support agent?",
    autoReply: "Our support team is available 24/7. A representative will get back to you within 10 minutes.",
  },
  {
    id: 6,
    name: "Carlos Rivera",
    phone: "+1 234-567-8905",
    initials: "C",
    color: "#14b8a6",
    time: "5 hours ago",
    online: false,
    incoming: "Is there a mobile app available?",
    autoReply: "Yes! Our mobile app is available on both iOS and Android. Download it from the App Store or Google Play.",
  },
];

const FILTER_OPTIONS = ["All Messages", "Auto-Replied", "Pending", "Online"];

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

  const filtered = sampleMessages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.phone.includes(search) ||
      msg.incoming.toLowerCase().includes(search.toLowerCase());

    if (filter === "Online") return matchesSearch && msg.online;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Messages</h2>
        <p className="text-lg text-gray-500 mt-0.5">
          View and manage all incoming messages and auto-replies
        </p>
      </div>

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
        <span className="font-semibold text-gray-700">{sampleMessages.length}</span> messages
      </p>

      {/* Message list */}
      <div className="flex flex-col gap-4">
        {filtered.length > 0 ? (
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