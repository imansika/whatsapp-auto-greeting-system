import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  Phone,
  AccountCircle,
} from "@mui/icons-material";
import bg from "../assets/image.svg";
import authService from "../services/authservice";

// ── WhatsApp green MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#25D366",
      dark: "#1ebe5d",
      contrastText: "#ffffff",
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiTextField: {
      defaultProps: { fullWidth: true, size: "small" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#f9fafb",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#25D366",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#25D366",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#25D366",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.875rem",
          padding: "10px 0",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#25D366",
          "&.Mui-checked": { color: "#25D366" },
        },
      },
    },
  },
});

// ── Password field with show/hide toggle 
const PasswordField = ({ label, value, onChange, disabled = false }) => {
  const [show, setShow] = useState(false);
  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Lock sx={{ color: "#9ca3af", fontSize: 18 }} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShow((s) => !s)} edge="end" size="small" disabled={disabled}>
              {show
                ? <VisibilityOff sx={{ fontSize: 18, color: "#9ca3af" }} />
                : <Visibility sx={{ fontSize: 18, color: "#9ca3af" }} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

// ── Left decorative panel ──────────────────────────────────────────────────
const LeftPanel = ({ imageSrc }) => (
  <Box
    sx={{
      display: { xs: "none", lg: "flex" },
      width: "44%",
      flexShrink: 0,
      backgroundColor: "#efecea",
      position: "relative",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    

    {imageSrc && (
      <Box
        component="img"
        src={imageSrc}
        alt="Side visual"
        sx={{
          position: "relative",
          zIndex: 2,
          maxWidth: "80%",
          maxHeight: "80%",
          objectFit: "contain",
          opacity: 1,
        }}
      />
    )}
  </Box>
);

// ── Login Page ─────────────────────────────────────────────────────────────
const LoginPage = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [requestingToken, setRequestingToken] = useState(false);
  const [tokenRequested, setTokenRequested] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.login(username, password);
      setSuccess("Login successful! Redirecting...");
      // Clear form
      setUsername("");
      setPassword("");
      // You can redirect to dashboard here
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError(err.error || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setForgotOpen(true);
    setForgotError("");
    setForgotSuccess("");
  };

  const closeForgotPassword = () => {
    if (forgotLoading) return;
    setForgotOpen(false);
    setForgotError("");
    setForgotSuccess("");
    setForgotEmail("");
    setForgotToken("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setRequestingToken(false);
    setTokenRequested(false);
  };

  const handleRequestResetToken = async () => {
    if (!forgotEmail) {
      setForgotError("Please provide your email");
      return;
    }

    setRequestingToken(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      await authService.requestPasswordReset(forgotEmail);

      setTokenRequested(true);
      setForgotToken("");
      setForgotSuccess("If your email exists, a reset token has been sent. Check your inbox.");
    } catch (err) {
      setForgotError(err.error || err.message || "Failed to generate reset token");
    } finally {
      setRequestingToken(false);
    }
  };

  const handleResetWithToken = async () => {
    if (!forgotToken || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError("Please enter token and new password fields");
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError("New password must be at least 6 characters");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const response = await authService.resetPasswordWithToken(
        forgotToken,
        forgotNewPassword,
      );
      setForgotSuccess(response?.message || "Password reset successful. You can sign in now.");
      setTimeout(() => {
        closeForgotPassword();
      }, 1200);
    } catch (err) {
      setForgotError(err.error || err.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      <Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.5px">
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Sign in to your WhatsApp Auto-Reply account
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person sx={{ color: "#9ca3af", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        <PasswordField label="Password" value={password} onChange={setPassword} disabled={loading} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <FormControlLabel
          control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" disabled={loading} />}
          label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
        />
        <Link
          component="button"
          type="button"
          onClick={openForgotPassword}
          underline="hover"
          sx={{ color: "#25D366", fontSize: "0.875rem", fontWeight: 600, border: 0, background: "transparent", p: 0, cursor: "pointer" }}
        >
          Forgot password?
        </Link>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleLogin}
        disabled={loading}
        sx={{
          bgcolor: "#25D366",
          "&:hover": { bgcolor: "#1ebe5d" },
          "&:disabled": { bgcolor: "#9ca3af" },
          boxShadow: "0 8px 24px rgba(37,211,102,0.30)",
        }}
      >
        {loading ? "Signing In..." : "Sign In"}
      </Button>

      <Divider>
        <Typography variant="caption" color="text.disabled">
          Don't have an account?
        </Typography>
      </Divider>

      <Button
        variant="outlined"
        fullWidth
        onClick={onSwitch}
        disabled={loading}
        sx={{
          borderColor: "#25D366",
          color: "#25D366",
          borderWidth: 2,
          "&:hover": { borderWidth: 2, borderColor: "#1ebe5d", bgcolor: "rgba(37,211,102,0.05)" },
        }}
      >
        Create New Account
      </Button>

      <Dialog open={forgotOpen} onClose={closeForgotPassword} fullWidth maxWidth="xs">
        <DialogTitle fontWeight={700}>Reset Password</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.8, pt: "8px !important" }}>
          {forgotError && <Alert severity="error">{forgotError}</Alert>}
          {forgotSuccess && <Alert severity="success">{forgotSuccess}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            disabled={requestingToken || forgotLoading || tokenRequested}
          />

          {!tokenRequested ? (
            <Button onClick={handleRequestResetToken} disabled={requestingToken} variant="outlined">
              {requestingToken ? "Sending token..." : "Send Reset Token"}
            </Button>
          ) : (
            <>
              <TextField
                label="Reset Token"
                value={forgotToken}
                onChange={(e) => setForgotToken(e.target.value)}
                disabled={forgotLoading}
              />
              <PasswordField
                label="New Password"
                value={forgotNewPassword}
                onChange={setForgotNewPassword}
                disabled={forgotLoading}
              />
              <PasswordField
                label="Confirm New Password"
                value={forgotConfirmPassword}
                onChange={setForgotConfirmPassword}
                disabled={forgotLoading}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeForgotPassword} disabled={requestingToken || forgotLoading} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleResetWithToken}
            disabled={!tokenRequested || forgotLoading}
            variant="contained"
          >
            {forgotLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Register Page ──────────────────────────────────────────────────────────
const RegisterPage = ({ onSwitch }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    // Validation
    if (!username || !email || !phone || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!agreed) {
      setError("Please agree to Terms and Conditions");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authService.register(username, email, phone, password);
      setSuccess("Account created successfully! Redirecting to dashboard...");
      // Clear form
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirm("");
      setAgreed(false);
      // Redirect to dashboard after a delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError(err.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
      <Box>
        <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.5px">
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Join WhatsApp Auto-Reply System today
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle sx={{ color: "#9ca3af", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: "#9ca3af", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone sx={{ color: "#9ca3af", fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
        <PasswordField label="Password" value={password} onChange={setPassword} disabled={loading} />
        <PasswordField label="Confirm Password" value={confirm} onChange={setConfirm} disabled={loading} />
      </Box>

      <FormControlLabel
        control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} size="small" disabled={loading} />}
        label={
          <Typography variant="body2" color="text.secondary">
            I agree to the{" "}
            <Link href="#" underline="hover" sx={{ color: "#25D366", fontWeight: 600 }}>
              Terms and Conditions
            </Link>
            {" "}and{" "}
            <Link href="#" underline="hover" sx={{ color: "#25D366", fontWeight: 600 }}>
              Privacy Policy
            </Link>
          </Typography>
        }
        sx={{ alignItems: "flex-start", "& .MuiCheckbox-root": { pt: 0.3 } }}
      />

      <Button
        variant="contained"
        fullWidth
        onClick={handleRegister}
        disabled={loading}
        sx={{
          bgcolor: "#25D366",
          "&:hover": { bgcolor: "#1ebe5d" },
          "&:disabled": { bgcolor: "#9ca3af" },
          boxShadow: "0 8px 24px rgba(37,211,102,0.30)",
        }}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <Divider>
        <Typography variant="caption" color="text.disabled">
          Already have an account?
        </Typography>
      </Divider>

      <Button
        variant="outlined"
        fullWidth
        onClick={onSwitch}
        disabled={loading}
        sx={{
          borderColor: "#25D366",
          color: "#25D366",
          borderWidth: 2,
          "&:hover": { borderWidth: 2, borderColor: "#1ebe5d", bgcolor: "rgba(37,211,102,0.05)" },
        }}
      >
        Sign In Instead
      </Button>

    </Box>
  );
};

// ── Root App 
export default function App() {
  const [page, setPage] = useState("login");

  const MY_IMAGE_SRC = bg;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 900,
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: "0 0 30px rgba(37,211,102,0.15)",
            display: "flex",
            overflow: "hidden",
            minHeight: 600,
          }}
        >
          {/* ── Left green panel ── */}
          <LeftPanel imageSrc={MY_IMAGE_SRC} />

          {/* ── Right form panel ── */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: { xs: 3, lg: 6 },
              overflowY: "auto",
              backgroundColor: "white",
            }}
          >
            <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "100%" }}>
                {page === "login"
                  ? <LoginPage onSwitch={() => setPage("register")} />
                  : <RegisterPage onSwitch={() => setPage("login")} />}
              </Box>
            </Box>

            <Divider sx={{ mt: 3 }} />
            <Typography variant="caption" color="text.disabled" textAlign="center" display="block" mt={1.5}>
              © 2026 WhatsApp Auto-Reply System. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}