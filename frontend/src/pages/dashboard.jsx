import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { createTheme, ThemeProvider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";
import MessagesPage from "../component/MessagesPage";
import GreetingMessagesPage from "../component/Greetingmessagespage";
import SettingsPage from "../component/Settingspage";
import messageLogService from "../services/messagelogservice";

import {
  Message as MessageIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  QrCode as QrCodeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  PhoneAndroid as PhoneIcon,
  Info as InfoIcon,
  LinkOff as LinkOffIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// ── MUI theme ──────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#25D366", contrastText: "#fff" },
  },
});

// ── Nav items ──────────────────────────────────────────────────────────────
const navItems = [
  {
    id: "qr",
    label: "Dashboard",
    icon: <QrCodeIcon fontSize="small" />,
  },
  { id: "messages", label: "Messages", icon: <MessageIcon fontSize="small" /> },
  {
    id: "greeting",
    label: "Greeting Messages",
    icon: <ChatIcon fontSize="small" />,
  },

  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon fontSize="small" />,
  },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, user, onLogout, open, onClose }) => (
  <>
    {open && (
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
      />
    )}

    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 sm:w-80 bg-white border-r border-gray-100 shadow-sm flex-shrink-0 transform transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto lg:min-h-screen ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-4 bg-[#25D366]">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <ChatIcon style={{ color: "#fff", fontSize: 22 }} />
        </div>
        <span className="text-white font-bold text-base tracking-wide">
          WhatsApp Greeting System
        </span>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
          <span className="text-[#25D366] font-bold text-base">
            {user.initials}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActive(item.id);
              onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
            ${
              active === item.id
                ? "bg-[#25D366] text-white shadow-md shadow-[#25D366]/25"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span
              className={active === item.id ? "text-white" : "text-gray-400"}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogoutIcon fontSize="small" />
          Logout
        </button>
      </div>
    </aside>
  </>
);

// ── Top bar ────────────────────────────────────────────────────────────────
const TopBar = ({
  connected,
  isConnecting,
  onOpenSidebar,
  onToggleNotifications,
  unreadNotifications,
}) => {
  const label = connected
    ? "Connected"
    : isConnecting
      ? "Connecting…"
      : "Disconnected";
  const dotClass = connected
    ? "bg-[#25D366] animate-pulse"
    : isConnecting
      ? "bg-yellow-400 animate-pulse"
      : "bg-gray-400";
  const textClass = connected
    ? "text-[#25D366]"
    : isConnecting
      ? "text-yellow-500"
      : "text-gray-400";

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 shadow-sm gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="inline-flex lg:hidden items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <MenuIcon style={{ fontSize: 21 }} />
        </button>
        <h1 className="text-base sm:text-xl font-bold text-gray-800 tracking-tight truncate">
          WhatsApp Auto-Reply Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`hidden sm:flex items-center gap-2 text-sm font-semibold ${textClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          {label}
        </div>

        <button
          type="button"
          onClick={onToggleNotifications}
          aria-label="Open notifications"
          className="relative inline-flex items-center justify-center p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <NotificationsIcon style={{ fontSize: 22 }} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-semibold text-center">
              {unreadNotifications > 99 ? "99+" : unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

const notificationTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }
  return date.toLocaleString();
};

const NotificationPanel = ({ open, onClose, notifications }) => {

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="fixed inset-0 bg-black/20 z-30"
        />
      )}

      <aside
        className={`fixed top-14 sm:top-16 right-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-full max-w-sm bg-white border-l border-gray-100 shadow-xl z-40 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notification panel"
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <p className="text-base font-semibold text-gray-800">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{item.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notificationTime(item.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center">
                <p className="text-base font-semibold text-gray-700">
                  No notifications yet
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  New incoming messages will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");
const WHATSAPP_API_URL = `${API_BASE_URL}/api/whatsapp/status`;
const WHATSAPP_QR_BASE_URL = API_BASE_URL;
const WHATSAPP_LOGOUT_API_URL = `${API_BASE_URL}/api/whatsapp/logout`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── QR Page ────────────────────────────────────────────────────────────────
const QRPage = ({ connected, setConnected, isConnecting, setIsConnecting }) => {
  const [qrImage, setQrImage] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [refreshingQr, setRefreshingQr] = useState(false);
  const [qrError, setQrError] = useState("");
  // const [qrUrl, setQrUrl] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const [lastConnected, setLastConnected] = useState(null);
  const [logoutNotice, setLogoutNotice] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchWhatsAppStatus = useCallback(async () => {
    try {
      const response = await axios.get(WHATSAPP_API_URL, {
        params: { t: Date.now() },
        headers: {
          ...getAuthHeaders(),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const isConnectedNow = Boolean(response.data.connected);
      const hasQrNow = Boolean(response.data.hasQr);
      const qrUrlWithBypass = response.data.qrUrl
        ? `${WHATSAPP_QR_BASE_URL}${response.data.qrUrl}${response.data.qrUrl.includes("?") ? "&" : "?"}t=${Date.now()}`
        : null;
      const nextQrImage =
        response.data.qrImage ||
        qrUrlWithBypass;

      setConnected(isConnectedNow);
      setIsConnecting(Boolean(response.data.isConnecting));
      if (isConnectedNow) {
        setQrImage(null);
      } else if (hasQrNow && nextQrImage) {
        setQrImage(nextQrImage);
      } else {
        setQrImage(null);
      }
      setWhatsappNumber(response.data.whatsappNumber || null);
      setLastConnected(response.data.lastConnected || null);
      setLogoutNotice("");
      setQrError("");
    } catch (error) {
      setConnected(false);
      setIsConnecting(false);
      setQrImage(null);
      setQrError(
        "Unable to fetch live QR code. Please ensure backend is running.",
      );
    } finally {
      setQrLoading(false);
    }
  }, [setConnected, setIsConnecting]);

  const refreshQrCode = async () => {
    if (refreshingQr) return;

    setRefreshingQr(true);
    setQrLoading(true);
    await fetchWhatsAppStatus();
    setRefreshingQr(false);
  };

  const logoutWhatsApp = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    setQrError("");
    setLogoutNotice("");

    try {
      const response = await axios.post(
        WHATSAPP_LOGOUT_API_URL,
        {},
        { headers: getAuthHeaders() },
      );
      setConnected(false);
      setIsConnecting(true);
      setQrImage(null);
      setWhatsappNumber(null);
      setLastConnected(null);
      setLogoutNotice(
        response?.data?.message ||
          "Logged out from WhatsApp. Waiting for a new QR code...",
      );
      await fetchWhatsAppStatus();
    } catch (err) {
      setLogoutNotice("");
      setQrError(
        err?.response?.data?.error ||
          "Failed to logout WhatsApp. Please try again.",
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      if (!mounted) return;
      await fetchWhatsAppStatus();
    };

    fetch();
    const interval = setInterval(fetch, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchWhatsAppStatus]);

  const steps = [
    {
      num: 1,
      icon: <PhoneIcon fontSize="small" />,
      title: "Open WhatsApp on your phone",
      desc: "Launch the WhatsApp application on your mobile device",
    },
    {
      num: 2,
      icon: <SettingsIcon fontSize="small" />,
      title: "Go to Settings",
      desc: 'Tap on the three dots (Android) or Settings (iOS) and select "Linked Devices"',
    },
    {
      num: 3,
      icon: <LinkOffIcon fontSize="small" />,
      title: "Link a Device",
      desc: 'Tap on "Link a Device" and allow camera access if prompted',
    },
    {
      num: 4,
      icon: <QrCodeIcon fontSize="small" />,
      title: "Scan QR Code",
      desc: "Point your phone at the QR code shown on this screen",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
          WhatsApp Connection
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Scan the QR code to link your WhatsApp account
        </p>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-start sm:items-center gap-3 px-4 sm:px-5 py-4 rounded-xl border ${
          connected
            ? "bg-[#f0fdf4] border-[#bbf7d0]"
            : isConnecting
              ? "bg-yellow-50 border-yellow-200"
              : "bg-gray-50 border-gray-200"
        }`}
      >
        {connected ? (
          <CheckCircleIcon style={{ color: "#25D366", fontSize: 24 }} />
        ) : isConnecting ? (
          <RefreshIcon
            style={{ color: "#ca8a04", fontSize: 24 }}
            className="animate-spin"
          />
        ) : (
          <CancelIcon style={{ color: "#9ca3af", fontSize: 24 }} />
        )}
        <div>
          <p
            className={`text-sm font-semibold ${
              connected
                ? "text-[#16a34a]"
                : isConnecting
                  ? "text-yellow-700"
                  : "text-gray-700"
            }`}
          >
            {connected
              ? "Connected"
              : isConnecting
                ? "Connecting to WhatsApp…"
                : "Not Connected"}
          </p>
          <p className="text-xs text-gray-500">
            {connected && whatsappNumber
              ? `Linked to +${whatsappNumber}${lastConnected ? ` · Last synced ${new Date(lastConnected).toLocaleString()}` : ""}`
              : connected
                ? "Your WhatsApp account is linked and active."
                : isConnecting
                  ? "Restoring your session, please wait a moment…"
                  : "Please scan the QR code below to connect your WhatsApp account."}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* QR card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-7 flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-base font-bold text-gray-800">QR Code</h3>
            <button
              type="button"
              onClick={refreshQrCode}
              disabled={refreshingQr}
              className="flex items-center gap-1.5 text-xs text-[#25D366] font-semibold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshIcon
                style={{ fontSize: 18 }}
                className={refreshingQr ? "animate-spin" : ""}
              />
              {refreshingQr ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="p-4 rounded-xl border-2 border-gray-100 bg-white shadow-inner max-w-full">
            {qrLoading && (
              <p className="text-xs text-gray-500">Loading live QR code...</p>
            )}
            {!qrLoading && qrError && (
              <p className="text-xs text-red-500">{qrError}</p>
            )}
            {!qrLoading && !qrError && qrImage && (
              <div className="flex flex-col items-center gap-3">
                <img
                  key={qrImage}
                  src={qrImage}
                  alt="WhatsApp QR"
                  className="w-56 h-56 sm:w-[320px] sm:h-[320px] max-w-full"
                />
              </div>
            )}
            {connected && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-green-600 font-semibold">
                  WhatsApp connected successfully
                </p>
                <button
                  type="button"
                  onClick={logoutWhatsApp}
                  disabled={logoutLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 transition-colors hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <LogoutIcon style={{ fontSize: 18 }} />
                  {logoutLoading ? "Logging out..." : "Logout from WhatsApp"}
                </button>
                {logoutNotice && (
                  <p className="text-[11px] text-gray-500 text-center max-w-xs">
                    {logoutNotice}
                  </p>
                )}
              </div>
            )}

            {!connected && !qrImage && !qrError && (
              <p className="text-xs text-gray-500">
                {isConnecting
                  ? "Waiting for a new WhatsApp QR code..."
                  : "WhatsApp is not connected yet. A new QR code will appear here automatically."}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Scan this live QR code with your WhatsApp mobile app
          </p>
        </div>

        {/* How to connect */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-7 flex flex-col gap-4">
          <h3 className="text-base font-bold text-gray-800">How to Connect</h3>

          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-[#25D366]/30">
                  <span className="text-white text-sm font-bold">
                    {step.num}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Important note */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-1">
            <InfoIcon
              style={{ color: "#3b82f6", fontSize: 22, marginTop: 2 }}
            />
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Important Note
              </p>
              <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                Keep your phone connected to the internet. Your messages will
                sync across all linked devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Placeholder page ───────────────────────────────────────────────────────
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-5">
      <QrCodeIcon style={{ color: "#25D366", fontSize: 32 }} />
    </div>
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-base text-gray-400 mt-2">
      This section is under construction.
    </p>
  </div>
);

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const [active, setActive] = useState("qr");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const hasNotificationBootstrap = useRef(false);
  const lastSeenIncomingIdRef = useRef(0);

  const rawUser = authService.getCurrentUser();
  const displayName = rawUser?.username || "User";
  const displayEmail = rawUser?.email || "No email";
  const displayPhone = rawUser?.phone || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U";

  const handleAppLogout = () => {
    authService.logout();
    navigate("/", { replace: true });
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadNotifications(0);
      }
      return next;
    });
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  useEffect(() => {
    let mounted = true;

    const displayNameFromPhone = (phone, senderName) => {
      const safeSenderName = String(senderName || "").trim();
      if (safeSenderName) {
        return safeSenderName;
      }
      return "Unknown Number";
    };

    const checkNewMessages = async () => {
      try {
        const rows = await messageLogService.list();
        if (!mounted || !Array.isArray(rows)) return;

        const incomingRows = rows
          .filter((row) => row?.direction === "incoming")
          .sort((a, b) => Number(a.id) - Number(b.id));

        const latestIncomingId = incomingRows.length
          ? Number(incomingRows[incomingRows.length - 1].id) || 0
          : 0;

        if (!hasNotificationBootstrap.current) {
          hasNotificationBootstrap.current = true;
          lastSeenIncomingIdRef.current = latestIncomingId;
          return;
        }

        const newIncomingRows = incomingRows.filter(
          (row) => Number(row.id) > lastSeenIncomingIdRef.current,
        );

        if (newIncomingRows.length > 0) {
          const newNotifications = newIncomingRows
            .map((row) => {
              const sender = row.sender_number || "Unknown";
              return {
                id: `incoming-${row.id}`,
                title: "New message received",
                body: `You have received a new message from ${displayNameFromPhone(sender, row.sender_name)}.`,
                createdAt: row.created_at || new Date().toISOString(),
              };
            })
            .reverse();

          setNotifications((prev) => [...newNotifications, ...prev].slice(0, 100));

          if (!isNotificationsOpen) {
            setUnreadNotifications((prev) => prev + newIncomingRows.length);
          }
        }

        lastSeenIncomingIdRef.current = latestIncomingId;
      } catch (_) {
        // Keep notification polling silent on transient API/network failures
      }
    };

    checkNewMessages();
    const interval = setInterval(checkNewMessages, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isNotificationsOpen]);

  const renderPage = () => {
    switch (active) {
      case "qr":
        return (
          <QRPage
            connected={connected}
            setConnected={setConnected}
            isConnecting={isConnecting}
            setIsConnecting={setIsConnecting}
          />
        );
      case "messages":
        return <MessagesPage />;

      case "greeting":
        return <GreetingMessagesPage />;

      case "settings":
        return (
          <SettingsPage
            user={{
              name: displayName,
              email: displayEmail,
              phone: displayPhone,
              username: displayName,
            }}
          />
        );

      default:
        return (
          <PlaceholderPage
            title={navItems.find((n) => n.id === active)?.label ?? "Page"}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <Sidebar
          active={active}
          setActive={setActive}
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleAppLogout}
          user={{
            name: displayName,
            email: displayEmail,
            initials,
          }}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            connected={connected}
            isConnecting={isConnecting}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onToggleNotifications={toggleNotifications}
            unreadNotifications={unreadNotifications}
          />
          <main className="flex-1 p-3 sm:p-6 overflow-auto">{renderPage()}</main>
        </div>

        <NotificationPanel
          open={isNotificationsOpen}
          onClose={closeNotifications}
          notifications={notifications}
        />
      </div>
    </ThemeProvider>
  );
}
