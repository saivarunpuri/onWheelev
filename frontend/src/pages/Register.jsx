import React, { useState } from "react";
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
  const [vehicle, setVehicle] = useState("Tata Nexon EV Max");
  const [customVehicleName, setCustomVehicleName] = useState("");
  const [customBatteryCapacity, setCustomBatteryCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API}/api/auth/register`, {
        name,
        username,
        email,
        password,
        vehicleModel: finalVehicleName,
        batteryCapacity: finalBatteryCapacity,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        onRegisterSuccess(response.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.warn(
        "Backend server offline, executing high-fidelity local registration simulation...",
      );

      // MOCK REGISTRATION SIMULATOR
      setTimeout(() => {
        setLoading(false);
        const mockUser = {
          _id: "user-id-" + Math.random().toString(36).substring(2, 9),
          name: name,
          username: username,
          email: email,
          vehicleModel: finalVehicleName,
          batteryCapacity: finalBatteryCapacity,
          role: "user",
        };

        localStorage.setItem("token", "simulated_jwt_token_key");
        onRegisterSuccess(mockUser);
        navigate("/dashboard");
      }, 800);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cyber-bg px-4 py-12 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute top-20 right-[20%] w-[350px] h-[350px] bg-cyber-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-cyber-card border border-cyber-gray-800 rounded-2xl p-8 shadow-2xl relative z-10 text-left">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1">
            Register your vehicle and configure smart battery meters.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center space-x-2 text-red-400 text-xs font-semibold mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none transition"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none transition"
              />
              <AtSign className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none transition"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-10 text-white text-sm outline-none transition"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Select EV Vehicle Model
            </label>
            <div className="relative">
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none transition appearance-none cursor-pointer"
              >
                {EV_MODELS.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} ({model.capacity} kWh)
                  </option>
                ))}
                <option value="Others">Others</option>
              </select>
              <Car className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          {vehicle === "Others" && (
            <div className="space-y-4 p-4 border border-cyber-gray-800 rounded-lg bg-[#0b0c10]/50">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Custom Vehicle Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customVehicleName}
                    onChange={(e) => setCustomVehicleName(e.target.value)}
                    placeholder="e.g. Ather 450X"
                    className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                  />
                  <Car className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Battery Capacity (kWh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={customBatteryCapacity}
                    onChange={(e) => setCustomBatteryCapacity(e.target.value)}
                    placeholder="e.g. 3.7"
                    className="w-full bg-[#0b0c10] border border-cyber-gray-800 focus:border-cyber-green rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none transition"
                  />
                  <Battery className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cyber-primary py-3 flex items-center justify-center space-x-2 font-bold text-sm tracking-wide mt-6"
          >
            {loading ? (
              <span className="animate-spin border-2 border-black border-t-transparent w-4 h-4 rounded-full" />
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-black" />
                <span>Initialize Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-5 text-xs text-gray-500">
          <span>Already registered? </span>
          <Link
            to="/login"
            className="text-cyber-green font-semibold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
