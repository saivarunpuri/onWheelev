import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Car,
  Battery,
  AlertCircle,
  AtSign,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
import API from "../config";

const EV_MODELS = [
  { name: "Tata Nexon EV Max", capacity: 40.5 },
  { name: "Tesla Model 3", capacity: 60 },
  { name: "MG ZS EV", capacity: 50.3 },
  { name: "Hyundai Ioniq 5", capacity: 72.6 },
];

const Register = ({ onRegisterSuccess }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [vehicle, setVehicle] = useState("");
  const [customVehicleName, setCustomVehicleName] = useState("");
  const [customBatteryCapacity, setCustomBatteryCapacity] = useState("");
  const [registerStep, setRegisterStep] = useState("details"); // 'details' or 'verify'
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!vehicle) {
      setError("Please select an EV vehicle model.");
      setLoading(false);
      return;
    }

    let finalVehicleName = vehicle;
    let finalBatteryCapacity = 0;

    if (vehicle === "Others") {
      if (!customVehicleName || !customBatteryCapacity) {
        setError("Please provide custom vehicle details.");
        setLoading(false);
        return;
      }
      finalVehicleName = customVehicleName;
      finalBatteryCapacity = parseFloat(customBatteryCapacity);
    } else {
      const activeModel =
        EV_MODELS.find((m) => m.name === vehicle) || EV_MODELS[0];
      finalBatteryCapacity = activeModel.capacity;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      );
      setLoading(false);
      return;
    }

    try {
      if (registerStep === "details") {
        const response = await axios.post(`${API}/api/auth/send-otp`, {
          email,
          intent: "register",
        });
        if (response.data.success) {
          setRegisterStep("verify");
          toast.success(
            "Verification code sent to your email! (Check console for mock)",
          );
          setLoading(false);
          return;
        }
      }

      // If registerStep === 'verify', proceed to register
      const response = await axios.post(`${API}/api/auth/register`, {
        name,
        username,
        email,
        password,
        vehicleModel: finalVehicleName,
        batteryCapacity: finalBatteryCapacity,
        otp,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("tokenExpiry", Date.now() + 20 * 60 * 60 * 1000);
        onRegisterSuccess(response.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        console.warn(
          "Backend server offline, executing high-fidelity local registration simulation...",
        );

        // MOCK REGISTRATION SIMULATOR
        if (registerStep === "details") {
          setRegisterStep("verify");
          toast.success("Simulated verification code sent to your email!");
          return;
        }

        if (registerStep === "verify" && otp !== "123456") {
          setError("Invalid OTP code. Use 123456 for testing.");
          return;
        }

        setTimeout(() => {
          const mockUser = {
            _id: "new-user-" + Date.now(),
            name,
            email,
            username,
            vehicleModel: finalVehicleName,
            batteryCapacity: finalBatteryCapacity,
            role: "user",
          };

          localStorage.setItem("token", "simulated_jwt_token_key");
          localStorage.setItem("tokenExpiry", Date.now() + 20 * 60 * 60 * 1000);
          onRegisterSuccess(mockUser);
          navigate("/dashboard");
        }, 800);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg px-4 py-12 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-cyber-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[10%] w-[400px] h-[400px] bg-cyber-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Split screen outer container */}
      <div className="max-w-6xl w-full mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
        {/* Left Hand: Interactive Holographic SVG telemetry dashboard */}
        <div className="flex-1 hidden lg:flex flex-col text-left max-w-xl pr-6 select-none">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-xs font-bold tracking-wider uppercase mb-6 w-fit font-cyber">
            <UserPlus className="w-3.5 h-3.5 text-cyber-green animate-pulse" />
            <span>CORE REGISTRATION GATEWAY</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
            Register Your <br />
            EV on the{" "}
            <span className="text-cyber-green drop-shadow-[0_0_15px_rgba(0,245,212,0.35)]">
              Grid Network
            </span>
          </h1>

          <p className="mt-6 text-cyber-muted text-sm leading-relaxed max-w-md">
            Connect your electric vehicle to OnWheel EV, enable smart dashboard
            analytics, predict travel range dynamically, and link to India's
            fastest emergency charging network.
          </p>

          {/* Interactive animated SVG battery telemetry */}
          <div className="mt-10 relative w-full max-w-[420px] h-[190px] bg-cyber-surface/60 border border-cyber-gray-800 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-inner backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyber-green/5 to-transparent h-1/3 w-full animate-pulse pointer-events-none" />
            <div className="flex justify-between items-center text-[10px] text-cyber-muted font-cyber border-b border-cyber-gray-800 pb-2.5">
              <span>SYS_METRIC_SCAN: CONFIGURE_NEW</span>
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
                  d="M0 20 Q 15 35, 30 20 T 60 20 T 90 20"
                  stroke="#00F5D4"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="route-dash-flow"
                />
                <path
                  d="M0 20 Q 15 5, 30 20 T 60 20 T 90 20"
                  stroke="#016A6A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                />
              </svg>

              <div className="text-left font-cyber space-y-1 pr-2">
                <div className="text-[8px] text-cyber-muted uppercase tracking-wider">
                  VEHICLE_CLASS
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[120px]">
                  {vehicle || "NOT SELECTED"}
                </div>
                <div className="text-[8px] text-cyber-muted uppercase tracking-wider">
                  STATUS: SYNC_READY
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[9px] border-t border-cyber-gray-800 pt-2 font-cyber text-cyber-muted">
              <span>ACTIVE: 100%</span>
              <span className="border-x border-cyber-gray-800">NODES: OLA</span>
              <span>GRID: EV-SECURE</span>
            </div>
          </div>
        </div>

        {/* Right Hand: Elegant glassmorphic register form card */}
        <div className="w-full max-w-md bg-cyber-card/85 border border-cyber-gray-800 rounded-3xl p-8 shadow-2xl relative z-10 text-left backdrop-blur-md hover:border-cyber-green/20 transition-all duration-500">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-white font-display">
              Create Account
            </h2>
            <p className="text-xs text-cyber-muted mt-1.5">
              Register your vehicle & configure smart battery meters.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center space-x-2.5 text-red-400 text-xs font-semibold mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {registerStep === "details" && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Full Name"
                      autoComplete="off"
                      className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                    />
                    <User className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter Username"
                      autoComplete="off"
                      className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                    />
                    <AtSign className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      autoComplete="off"
                      className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                    />
                    <Mail className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      autoComplete="new-password"
                      className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-10 text-white text-sm outline-none transition"
                    />
                    <Lock className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-cyber-muted hover:text-white focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                    Select EV Vehicle Model
                  </label>
                  <div className="relative">
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select your vehicle model
                      </option>
                      {EV_MODELS.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name} ({model.capacity} kWh)
                        </option>
                      ))}
                      <option value="Others">Others</option>
                    </select>
                    <Car className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                  </div>
                </div>

                {vehicle === "Others" && (
                  <div className="space-y-4 p-4 border border-cyber-gray-800 rounded-xl bg-cyber-surface/40">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                        Custom Vehicle Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={customVehicleName}
                          onChange={(e) => setCustomVehicleName(e.target.value)}
                          placeholder="e.g. Ather 450X"
                          className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                        />
                        <Car className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider">
                        Battery Capacity (kWh)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="0.1"
                          value={customBatteryCapacity}
                          onChange={(e) =>
                            setCustomBatteryCapacity(e.target.value)
                          }
                          placeholder="e.g. 3.7"
                          className="w-full bg-cyber-surface/60 border border-cyber-gray-800 focus:border-cyber-green rounded-xl py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                        />
                        <Battery className="w-4 h-4 text-cyber-muted absolute left-3 top-3" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {registerStep === "verify" && (
              <div className="flex flex-col space-y-3.5 animate-fade-in">
                <label className="text-[9px] font-bold text-cyber-muted uppercase tracking-wider text-center block mb-1">
                  We sent a verification code to{" "}
                  <span className="text-cyber-green font-bold">{email}</span>
                </label>
                <div className="flex justify-between space-x-2 mt-2">
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
                      className="w-12 h-12 bg-cyber-surface border border-cyber-gray-800 focus:border-cyber-green rounded-xl text-cyber-text text-lg font-bold outline-none transition text-center focus:bg-cyber-surface/80 shadow-inner font-cyber"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setRegisterStep("details")}
                  className="text-[10px] text-cyber-muted hover:text-white mt-4 text-center w-full"
                >
                  ← Back to edit details
                </button>
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
                  <UserPlus className="w-4 h-4 text-black" />
                  <span>
                    {registerStep === "details"
                      ? "Initialize Account"
                      : "Verify & Complete Registration"}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-cyber-muted">
            <span>Already registered? </span>
            <Link
              to="/login"
              className="text-cyber-green font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>

          {/* Sandbox telemetry guidance */}
          <div className="mt-6 p-4 bg-cyber-surface border border-cyber-gray-800 rounded-xl text-[10px] text-cyber-muted font-mono leading-relaxed">
            <span className="text-cyber-green font-bold uppercase tracking-wider block mb-1 font-cyber">
              Sandbox Telemetry Hub
            </span>
            • Enter registration email to trigger a simulated secure Brevo OTP
            request.
            <br />• OTP code: use <span className="text-white">123456</span> to
            complete sandbox vehicle database sync.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
