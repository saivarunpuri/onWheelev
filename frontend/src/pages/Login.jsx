import React, { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import API from "../config";
import toast from "react-hot-toast";

const Login = ({ onLoginSuccess }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password"); // 'password' or 'otp'
  const [otpStep, setOtpStep] = useState("request"); // 'request' or 'verify'
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = otp.split("");
    // Handle paste
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) {
          newOtp[index + i] = pasted[i];
        }
      }
      setOtp(newOtp.join(""));
      const nextIndex = Math.min(index + pasted.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp.join(""));

    // Move to next input if there is a value
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (loginMethod === "otp" && otpStep === "request") {
        const response = await axios.post(`${API}/api/auth/send-otp`, {
          email: emailOrUsername,
          intent: "login",
        });
        if (response.data.success) {
          setOtpStep("verify");
          toast.success("OTP sent to your email! (Check console for mock)");
          setLoading(false);
          return;
        }
      } else if (loginMethod === "otp" && otpStep === "verify") {
        const response = await axios.post(`${API}/api/auth/login-otp`, {
          email: emailOrUsername,
          otp,
        });
        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("tokenExpiry", Date.now() + 20 * 60 * 60 * 1000);
          onLoginSuccess(response.data.user);
          const redirect = searchParams.get("redirect") || "/dashboard";
          navigate(redirect);
        }
      } else {
        // Password login
        const response = await axios.post(`${API}/api/auth/login`, {
          emailOrUsername,
          password,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("tokenExpiry", Date.now() + 20 * 60 * 60 * 1000);
          onLoginSuccess(response.data.user);
          const redirect = searchParams.get("redirect") || "/dashboard";
          navigate(redirect);
        }
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Server is offline. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg px-4 py-12 relative overflow-hidden">
      {/* Background aesthetic glow blobs */}
      <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-cyber-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-[10%] w-[400px] h-[400px] bg-cyber-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Split screen outer container */}
      <div className="max-w-6xl w-full mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        {/* Left Hand: Interactive Holographic SVG telemetry dashboard */}
        <div className="flex-1 hidden lg:flex flex-col text-left max-w-xl pr-6 select-none">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-xs font-bold tracking-wider uppercase mb-6 w-fit font-cyber">
            <LogIn className="w-3.5 h-3.5 text-cyber-green animate-pulse" />
            <span>AUTHENTICATION GATEWAY</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
            Interface with <br />
            OnWheel{" "}
            <span className="text-cyber-green drop-shadow-[0_0_15px_rgba(0,245,212,0.35)]">
              EV Grid
            </span>
          </h1>

          <p className="mt-6 text-cyber-muted text-sm leading-relaxed max-w-md">
            Enter your credentials or secure verification tokens to synchronise
            your vehicle metrics, configure active charging coordinates, and
            access our high-speed highway rescue grids.
          </p>

          {/* Interactive animated SVG battery telemetry */}
          <div className="mt-10 relative w-full max-w-[420px] h-[190px] bg-slate-100/50 dark:bg-cyber-surface/60 border border-slate-200 dark:border-cyber-gray-800 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-inner backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyber-green/5 to-transparent h-1/3 w-full animate-pulse pointer-events-none" />
            <div className="flex justify-between items-center text-[10px] text-cyber-muted font-cyber border-b border-slate-200 dark:border-cyber-gray-800 pb-2.5">
              <span>SECURITY_CORE: STATUS_READY</span>
              <span className="text-cyber-green font-bold animate-ping">●</span>
            </div>

            <div className="flex-grow flex items-center justify-center space-x-6 my-2">
              <svg
                className="w-40 h-20 text-cyber-green drop-shadow-[0_0_10px_rgba(0,245,212,0.3)]"
                viewBox="0 0 100 40"
                fill="none"
              >
                {/* Telemetry wave line animation */}
                <path
                  d="M0 20 Q 15 5, 30 20 T 60 20 T 90 20"
                  stroke="#00F5D4"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="route-dash-flow"
                />
                <path
                  d="M0 20 Q 15 35, 30 20 T 60 20 T 90 20"
                  stroke="#016A6A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="text-left font-cyber space-y-1 pr-2">
                <div className="text-[8px] text-cyber-muted uppercase tracking-wider">
                  SYS_GRID_SYNC
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">
                  ACTIVE 98.4%
                </div>
                <div className="text-[8px] text-cyber-muted uppercase tracking-wider">
                  TEMP: 24.5°C
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[9px] border-t border-slate-200 dark:border-cyber-gray-800 pt-2 font-cyber text-cyber-muted">
              <span>LATENCY: 12ms</span>
              <span className="border-x border-slate-200 dark:border-cyber-gray-800">NODES: 42</span>
              <span>CIPHER: AES-256</span>
            </div>
          </div>
        </div>

        {/* Right Hand: Elegant glassmorphic login form card */}
        <div className="w-full max-w-md bg-white/85 dark:bg-cyber-card/85 border border-slate-200 dark:border-cyber-gray-800 rounded-3xl p-8 shadow-2xl relative z-10 text-left backdrop-blur-md hover:border-cyber-green/20 transition-all duration-500">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white font-display">
              Sign In to OnWheel EV
            </h2>
            <p className="text-xs text-cyber-muted mt-1.5">
              Secure authentication for advanced EV co-piloting.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center space-x-2.5 text-red-400 text-xs font-semibold mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                {loginMethod === "otp" ? "Email Address" : "Email or Username"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder={
                    loginMethod === "otp"
                      ? "Enter your email (e.g. varun2004.pvt@gmail.com)"
                      : "Enter email or username (e.g. varun2004.pvt@gmail.com)"
                  }
                  disabled={otpStep === "verify"}
                  autoComplete="off"
                  className="w-full bg-slate-50 dark:bg-cyber-surface/60 border border-slate-200 dark:border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2.5 pl-10 pr-4 text-slate-800 dark:text-white text-sm outline-none transition disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-gray-600"
                />
                <User className="w-4 h-4 text-cyber-muted absolute left-3 top-3.5" />
              </div>
            </div>

            {loginMethod === "password" && (
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.error("Use Correct Credentials.");
                    }}
                    className="text-[9px] text-cyber-green font-bold hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. admin123)"
                    autoComplete="new-password"
                    className="w-full bg-slate-50 dark:bg-cyber-surface/60 border border-slate-200 dark:border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2.5 pl-10 pr-10 text-slate-800 dark:text-white text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-600"
                  />
                  <Lock className="w-4 h-4 text-cyber-muted absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-cyber-muted hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {loginMethod === "otp" && otpStep === "verify" && (
              <div className="flex flex-col space-y-3.5 animate-fade-in">
                <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider block text-center mb-1">
                  Verification Code
                </label>
                <div className="flex justify-between space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      required
                      value={otp[index] || ""}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      maxLength={6}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      className="w-12 h-12 bg-slate-50 dark:bg-cyber-surface border border-slate-200 dark:border-cyber-gray-800 focus:border-cyber-green rounded-xl text-slate-850 dark:text-cyber-text text-lg font-bold outline-none transition text-center focus:bg-slate-100 dark:focus:bg-cyber-surface/80 shadow-inner font-cyber"
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber-primary py-3.5 flex items-center justify-center space-x-2 font-bold text-sm tracking-wide mt-2"
            >
              {loading ? (
                <span className="animate-spin border-2 border-black border-t-transparent w-4 h-4 rounded-full" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-black" />
                  <span>
                    {loginMethod === "otp" && otpStep === "request"
                      ? "Request OTP Code"
                      : "Verify Credentials"}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-cyber-gray-900 flex justify-center">
            <button
              onClick={() => {
                setLoginMethod(loginMethod === "password" ? "otp" : "password");
                setOtpStep("request");
                setError("");
              }}
              className="text-xs text-cyber-green font-bold hover:underline"
            >
              {loginMethod === "password"
                ? "Sign in with OTP Code instead"
                : "Sign in with Password instead"}
            </button>
          </div>

          <div className="text-center mt-6 text-xs text-cyber-muted">
            <span>New driver? </span>
            <Link
              to="/register"
              className="text-cyber-green font-bold hover:underline"
            >
              Register Vehicle
            </Link>
          </div>

          {/* Sandbox telemetry guidance */}
          {/* <div className="mt-6 p-4 bg-cyber-surface border border-cyber-gray-800 rounded-xl text-[10px] text-cyber-muted font-mono leading-relaxed">
            <span className="text-cyber-green font-bold uppercase tracking-wider block mb-1 font-cyber">Sandbox Telemetry Hub</span>
            • Admin: <span className="text-white">varun2004.pvt@gmail.com</span> / Password: <span className="text-white">admin123</span><br />
            • brevo OTP Intent: use <span className="text-white">123456</span> to complete sandbox verification.
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
