import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  MapPin,
  Car,
  CreditCard,
  User as UserIcon,
  Settings,
  LogOut,
  Navigation2,
  Zap,
  Leaf,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  SlidersHorizontal,
  Trash2,
  Edit3,
  Plus,
  X,
  Lock,
  ShieldCheck,
  Package,
} from "lucide-react";
import axios from "axios";
import API from "../config";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

/* ═══════════════════════════════════════════════════════════════
   TOKEN REFILL PAYMENT MODAL
   ═══════════════════════════════════════════════════════════════ */
const BUNDLES = [
  {
    id: "bronze",
    name: "Bronze Pack",
    tokens: 10,
    cost: 100,
    savings: null,
    color: "amber",
    gradient: "from-amber-900/40 to-amber-800/10",
    border: "border-amber-600/40",
    highlight: "text-amber-400",
    glow: "shadow-amber-500/10",
    badge: null,
  },
  {
    id: "silver",
    name: "Silver Power",
    tokens: 30,
    cost: 250,
    savings: 50,
    color: "slate",
    gradient: "from-slate-700/50 to-slate-600/10",
    border: "border-slate-400/50",
    highlight: "text-slate-300",
    glow: "shadow-slate-400/10",
    badge: "Most Popular",
  },
  {
    id: "gold",
    name: "Gold Elite",
    tokens: 100,
    cost: 700,
    savings: 300,
    color: "yellow",
    gradient: "from-yellow-900/40 to-yellow-700/10",
    border: "border-yellow-500/50",
    highlight: "text-yellow-400",
    glow: "shadow-yellow-400/10",
    badge: "Best Value",
  },
];

const LOAD_STEPS = [
  "Authorizing Transaction...",
  "Connecting to Secure EV Pass Ledger...",
  "Verifying Wallet Credits...",
  "Unlocking Premium Intelligence Core Tokens...",
  "Writing Telemetry Receipt to Blockchain...",
];

const TokenRefillPaymentModal = ({ user, onClose, onSuccess }) => {
  const [selectedBundle, setSelectedBundle] = useState(BUNDLES[0]);
  const [payMethod, setPayMethod] = useState("wallet"); // 'wallet' | 'card' | 'upi'
  const [step, setStep] = useState("select"); // 'select' | 'checkout' | 'loading' | 'success'
  const [loadStep, setLoadStep] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [mockUpi, setMockUpi] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const loadRef = useRef(null);

  const walletBalance =
    user && user.walletBalance !== undefined ? user.walletBalance : 1000;
  const plannerCredits =
    user && user.plannerCredits !== undefined ? user.plannerCredits : 10;
  const isWalletInsufficient = walletBalance < selectedBundle.cost;

  /* ── trigger loading animation sequence ── */
  const runLoadSequence = async (finalAction) => {
    setStep("loading");
    for (let i = 0; i < LOAD_STEPS.length; i++) {
      setLoadStep(i);
      setLoadPct(Math.round(((i + 1) / LOAD_STEPS.length) * 100));
      await new Promise((r) => setTimeout(r, 700));
    }
    await finalAction();
    setStep("success");
  };

  const handlePay = async () => {
    setError("");

    if (payMethod === "card") {
      if (!cardNum || cardNum.replace(/\s/g, "").length < 16)
        return setError("Enter a valid 16-digit card number.");
      if (!cardName) return setError("Enter the cardholder name.");
      if (!cardExpiry) return setError("Enter an expiry date (MM/YY).");
      if (!cardCvv || cardCvv.length < 3)
        return setError("Enter a valid 3-digit CVV.");
    }
    if (payMethod === "upi") {
      if (!mockUpi || !mockUpi.includes("@"))
        return setError("Enter a valid UPI ID (e.g. driver@oksbi).");
    }
    if (payMethod === "wallet" && isWalletInsufficient) {
      return setError(
        `Insufficient wallet balance. Refill at least ₹${selectedBundle.cost} first.`,
      );
    }

    setProcessing(true);
    await runLoadSequence(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${API}/api/auth/profile/planner/refill`,
          {
            tokens: selectedBundle.tokens,
            cost: payMethod === "wallet" ? selectedBundle.cost : 0,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data.success) onSuccess(res.data.user);
      } catch (err) {
        /* offline fallback — simulate locally */
        onSuccess(null, selectedBundle);
      }
    });
    setProcessing(false);
  };

  /* Format card number with spaces every 4 digits */
  const formatCard = (val) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  const formatExpiry = (val) => {
    val = val.replace(/\D/g, "").slice(0, 4);
    return val.length >= 3 ? val.slice(0, 2) + "/" + val.slice(2) : val;
  };

  return (
    <div
      className="token-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(5,6,10,0.88)", backdropFilter: "blur(8px)" }}
    >
      <div className="token-modal-panel relative w-full max-w-xl bg-[#111318] border border-cyber-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-gray-800 bg-gradient-to-r from-cyber-green/5 to-transparent">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-cyber-green/15 rounded-lg">
              <Package className="w-4 h-4 text-cyber-green" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-wide">
                Premium Token Bundles
              </h2>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                ONWHEEL EV INTELLIGENCE COCKPIT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-cyber-gray-800 text-gray-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP: SELECT BUNDLE ── */}
        {step === "select" && (
          <div className="p-6 space-y-5">
            {/* Current balance strip */}
            <div className="flex items-center justify-between bg-[#0b0c10] border border-cyber-gray-900 rounded-xl px-4 py-3 text-xs">
              <span className="text-gray-500 font-mono tracking-wider">
                WALLET BALANCE
              </span>
              <span className="text-cyber-green font-extrabold font-mono">
                ₹{walletBalance.toLocaleString()}
              </span>
              <span className="text-gray-500 font-mono tracking-wider">
                CURRENT TOKENS
              </span>
              <span className="text-cyber-accent font-extrabold font-mono">
                ⚡ {plannerCredits}
              </span>
            </div>

            {/* Bundle cards */}
            <div className="grid grid-cols-3 gap-3">
              {BUNDLES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBundle(b)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 bg-gradient-to-br ${b.gradient} ${
                    selectedBundle.id === b.id
                      ? `${b.border} ring-2 ring-offset-2 ring-offset-[#111318] ${b.border.replace("border-", "ring-")} shadow-lg ${b.glow}`
                      : "border-cyber-gray-800 hover:border-cyber-gray-700"
                  }`}
                >
                  {b.badge && (
                    <span
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyber-green text-black whitespace-nowrap`}
                    >
                      {b.badge}
                    </span>
                  )}
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${b.highlight}`}
                  >
                    {b.name}
                  </p>
                  <p className="text-lg font-extrabold text-white">
                    ⚡ {b.tokens}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">tokens</p>
                  <div className="mt-3 pt-2 border-t border-white/5">
                    <p className="text-sm font-extrabold text-white">
                      ₹{b.cost}
                    </p>
                    {b.savings && (
                      <p className="text-[9px] text-cyber-green font-bold">
                        Save ₹{b.savings}!
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("checkout")}
              className="w-full btn-cyber-primary py-3 text-sm font-bold tracking-widest uppercase"
            >
              Continue to Checkout →
            </button>
          </div>
        )}

        {/* ── STEP: CHECKOUT ── */}
        {step === "checkout" && (
          <div className="p-6 space-y-5">
            {/* Order summary */}
            <div className="bg-[#0b0c10] border border-cyber-gray-900 rounded-xl p-4 space-y-2.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Order Summary
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">{selectedBundle.name}</span>
                <span className="text-white font-bold">
                  ⚡ {selectedBundle.tokens} tokens
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Unit rate</span>
                <span className="text-gray-300">
                  ₹{(selectedBundle.cost / selectedBundle.tokens).toFixed(1)} /
                  token
                </span>
              </div>
              {selectedBundle.savings && (
                <div className="flex justify-between text-xs">
                  <span className="text-cyber-green">Bundle Discount</span>
                  <span className="text-cyber-green font-bold">
                    −₹{selectedBundle.savings}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-cyber-gray-900 pt-2">
                <span className="text-white">Total</span>
                <span className="text-cyber-green">₹{selectedBundle.cost}</span>
              </div>
            </div>

            {/* Payment method tabs */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Payment Method
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: "wallet",
                    label: "CyberPass Wallet",
                    sub: `₹${walletBalance.toLocaleString()} avail.`,
                  },
                  {
                    id: "card",
                    label: "Debit / Credit",
                    sub: "Simulated checkout",
                  },
                  { id: "upi", label: "UPI", sub: "Instant mock pay" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-[10px] ${
                      payMethod === m.id
                        ? "border-cyber-green bg-cyber-green/10 text-cyber-green"
                        : "border-cyber-gray-800 text-gray-400 hover:border-cyber-gray-700"
                    }`}
                  >
                    <p className="font-bold">{m.label}</p>
                    <p className="text-gray-500 mt-0.5">{m.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet warning */}
            {payMethod === "wallet" && isWalletInsufficient && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-xs text-red-400">
                ⚠ Insufficient wallet balance for this bundle. Add ₹
                {selectedBundle.cost - walletBalance} more or choose another
                payment method.
              </div>
            )}

            {/* Simulated Card Inputs */}
            {payMethod === "card" && (
              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={19}
                  placeholder="Card Number (16 digits)"
                  value={cardNum}
                  onChange={(e) => setCardNum(formatCard(e.target.value))}
                  className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2.5 px-3 text-white text-xs outline-none font-mono tracking-widest placeholder:text-gray-600"
                />
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2.5 px-3 text-white text-xs outline-none placeholder:text-gray-600"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) =>
                      setCardExpiry(formatExpiry(e.target.value))
                    }
                    className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2.5 px-3 text-white text-xs outline-none font-mono placeholder:text-gray-600"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) =>
                      setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2.5 px-3 text-white text-xs outline-none font-mono placeholder:text-gray-600"
                  />
                </div>
                <p className="text-[9px] text-gray-600 flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Simulated secure card — no real charges</span>
                </p>
              </div>
            )}

            {/* UPI Input */}
            {payMethod === "upi" && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your UPI ID (e.g. driver@oksbi)"
                  value={mockUpi}
                  onChange={(e) => setMockUpi(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2.5 px-3 text-white text-xs outline-none placeholder:text-gray-600 font-mono"
                />
                <p className="text-[9px] text-gray-600 flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Mock UPI — simulated for testing only</span>
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-2.5 rounded-xl border border-cyber-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider hover:border-cyber-gray-700 transition"
              >
                ← Back
              </button>
              <button
                onClick={handlePay}
                disabled={processing}
                className="flex-2 flex-1 btn-cyber-primary py-2.5 text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pay ₹{selectedBundle.cost}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: LOADING ── */}
        {step === "loading" && (
          <div className="p-10 flex flex-col items-center space-y-6 text-center">
            {/* Spinning neon token core */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyber-green/20 token-spin-glow" />
              <div
                className="absolute inset-2 rounded-full border border-cyber-green/40"
                style={{ animation: "spinGlow 1.4s linear infinite reverse" }}
              />
              <Zap
                className="w-8 h-8 text-cyber-green fill-cyber-green"
                style={{ filter: "drop-shadow(0 0 8px #00E576)" }}
              />
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="h-1.5 bg-cyber-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyber-green to-cyber-accent rounded-full transition-all duration-700"
                  style={{ width: `${loadPct}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-cyber-green tracking-widest uppercase animate-pulse">
                {LOAD_STEPS[loadStep]}
              </p>
              <p className="text-[10px] text-gray-600">{loadPct}% complete</p>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === "success" && (
          <div className="p-10 flex flex-col items-center space-y-5 text-center">
            <div
              className="token-success-pop w-20 h-20 rounded-full bg-cyber-green/15 border-2 border-cyber-green flex items-center justify-center"
              style={{ boxShadow: "0 0 30px rgba(0,229,118,0.25)" }}
            >
              <CheckCircle2 className="w-10 h-10 text-cyber-green" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">
                Tokens Unlocked! 🎉
              </h3>
              <p className="text-sm text-cyber-green font-mono">
                +{selectedBundle.tokens} Premium Intelligence Tokens
              </p>
              <p className="text-xs text-gray-500">
                Your AI cockpit is now supercharged and ready.
              </p>
            </div>
            <div className="w-full bg-[#0b0c10] border border-cyber-gray-900 rounded-xl p-4 space-y-1.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Bundle purchased</span>
                <span className="text-white font-bold">
                  {selectedBundle.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tokens added</span>
                <span className="text-cyber-green font-bold">
                  +{selectedBundle.tokens} ⚡
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount charged</span>
                <span className="text-white font-bold">
                  {payMethod === "wallet"
                    ? `₹${selectedBundle.cost} from Wallet`
                    : `₹${selectedBundle.cost} via ${payMethod.toUpperCase()}`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full btn-cyber-primary py-2.5 text-sm font-bold tracking-wider uppercase"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Security footer */}
        {(step === "select" || step === "checkout") && (
          <div className="px-6 pb-4 flex items-center justify-center space-x-2 text-[9px] text-gray-600 font-mono">
            <Lock className="w-2.5 h-2.5" />
            <span>
              256-bit AES encrypted · Secured by OnWheel EV Cyber Ledger
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout, onProfileUpdate }) => {
  const [selectedModel, setSelectedModel] = useState(
    user ? user.vehicleModel : "Tata Nexon EV Max",
  );
  const [selectedCapacity, setSelectedCapacity] = useState(
    user ? user.batteryCapacity : 40.5,
  );
  const [vehicleSaving, setVehicleSaving] = useState(false);

  // New Garage and Vehicle Management States
  const [newModel, setNewModel] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newRange, setNewRange] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editModel, setEditModel] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editRange, setEditRange] = useState("");

  // Saved Location States
  const [locName, setLocName] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locSaving, setLocSaving] = useState(false);

  // Payments States
  const [refillAmount, setRefillAmount] = useState("");
  const [isRefilling, setIsRefilling] = useState(false);
  const [refillMode, setRefillMode] = useState("instant"); // 'instant' | 'manual'
  const [manualMethod, setManualMethod] = useState("upi"); // 'upi' | 'qr'
  const [manualAmount, setManualAmount] = useState("");
  const [userUpiId, setUserUpiId] = useState("");
  const [utr, setUtr] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [myRequests, setMyRequests] = useState([]);

  // Token Refill Payment Modal State
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Add saved location handler
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!locName || !locAddress) return;
    setLocSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/auth/profile/locations`,
        {
          name: locName,
          address: locAddress,
          lat: 17.4 + Math.random() * 0.1,
          lng: 78.3 + Math.random() * 0.1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success("Location saved successfully!");
        setLocName("");
        setLocAddress("");
      }
    } catch (err) {
      console.warn("Database offline, saving location locally...");
      const mockLoc = {
        _id: "loc-" + Date.now(),
        name: locName,
        address: locAddress,
        lat: 17.44,
        lng: 78.39,
      };
      const currentLocs =
        user && user.savedLocations ? [...user.savedLocations] : [];
      const updatedUser = {
        ...user,
        savedLocations: [...currentLocs, mockLoc],
      };
      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success("Location saved successfully (Local Simulation Mode)!");
      setLocName("");
      setLocAddress("");
    } finally {
      setLocSaving(false);
    }
  };

  // Delete saved location handler
  const handleDeleteLocation = async (locId) => {
    if (!window.confirm("Are you sure you want to remove this saved location?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API}/api/auth/profile/locations/${locId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success("Saved location removed.");
      }
    } catch (err) {
      console.warn("Database offline, deleting location locally...");
      const currentLocs =
        user && user.savedLocations
          ? user.savedLocations.filter((loc) => loc._id !== locId)
          : [];
      const updatedUser = {
        ...user,
        savedLocations: currentLocs,
      };
      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success("Location removed (Local Simulation Mode).");
    }
  };

  // Refill Cyber Wallet handler
  const handleRefillWallet = async (e) => {
    e.preventDefault();
    if (!refillAmount || parseFloat(refillAmount) <= 0) return;
    setIsRefilling(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/auth/profile/wallet/refill`,
        { amount: parseFloat(refillAmount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success(
          `Refilled ₹${refillAmount} EV credits to your CyberPass wallet!`,
        );
        setRefillAmount("");
      }
    } catch (err) {
      console.warn("Database offline, refilling wallet locally...");
      const amountVal = parseFloat(refillAmount);
      const currentBalance =
        user && user.walletBalance ? user.walletBalance : 1000;
      const currentTrans =
        user && user.transactions
          ? [...user.transactions]
          : [
              {
                _id: "tx1",
                amount: 500,
                description: "Signup Promotional EV Credits Credited",
                date: new Date(),
              },
              {
                _id: "tx2",
                amount: -120,
                description: "Initial DLF Cyber Charge Billing",
                date: new Date(),
              },
            ];

      const newTx = {
        _id: "tx-local-" + Date.now(),
        amount: amountVal,
        description: "Refilled virtual wallet via CyberCard (Local Simulation)",
        date: new Date(),
      };

      const updatedUser = {
        ...user,
        walletBalance: currentBalance + amountVal,
        transactions: [...currentTrans, newTx],
      };

      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success(`Refilled ₹${refillAmount} (Local Simulation Mode)!`);
      setRefillAmount("");
    } finally {
      setIsRefilling(false);
    }
  };

  const [isBuyingTokens, setIsBuyingTokens] = useState(false);

  // Buy Premium API Intelligence Planner Tokens handler
  const handleBuyPlannerTokens = async () => {
    const currentBalance =
      user && user.walletBalance ? user.walletBalance : 1000;
    if (currentBalance < 100) {
      toast.error(
        "Insufficient wallet balance to buy premium API credits. Please refill your wallet first.",
      );
      return;
    }

    setIsBuyingTokens(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/auth/profile/planner/refill`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success(
          "Successfully purchased 10 Premium Route Planner tokens!",
        );
      }
    } catch (err) {
      console.warn(
        "Database offline, processing premium token purchase locally...",
      );
      // Local fallback simulation
      const amountVal = 100;
      const currentCredits =
        user && user.plannerCredits !== undefined ? user.plannerCredits : 10;
      const currentTrans =
        user && user.transactions ? [...user.transactions] : [];

      const newTx = {
        _id: "tx-local-" + Date.now(),
        amount: -amountVal,
        description:
          "Purchased 10 Premium Route Planner Tokens (Local Simulation)",
        date: new Date(),
      };

      const updatedUser = {
        ...user,
        walletBalance: currentBalance - amountVal,
        plannerCredits: currentCredits + 10,
        transactions: [...currentTrans, newTx],
      };

      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success(
        "Successfully purchased 10 Premium tokens (Local Simulation Mode)!",
      );
    } finally {
      setIsBuyingTokens(false);
    }
  };

  // Handle direct file uploads to ImageKit.io with high-fidelity local sandbox fileReader fallbacks
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadLoading(true);
    try {
      const token = localStorage.getItem("token");
      const authRes = await axios.get(`${API}/api/payments/imagekit-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (authRes.data && authRes.data.token) {
        const { token: ikToken, expire, signature, publicKey } = authRes.data;

        // If simulated token returned, fallback immediately to local simulation reader
        if (ikToken.startsWith("simulated_imagekit_upload_token_")) {
          throw new Error("Simulation active");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append(
          "publicKey",
          publicKey || "public_simulated_key_987654321",
        );
        formData.append("signature", signature);
        formData.append("expire", expire);
        formData.append("token", ikToken);
        formData.append("folder", "/onwheelev");

        const uploadRes = await axios.post(
          "https://upload.imagekit.io/api/v1/files/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (uploadRes.data && uploadRes.data.url) {
          setScreenshotUrl(uploadRes.data.url);
          setUploadSuccess(true);
        }
      }
    } catch (err) {
      console.warn(
        "ImageKit credentials missing or network offline. Utilizing premium high-fidelity local screenshot FileReader fallback...",
      );
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result);
        setUploadSuccess(true);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadLoading(false);
    }
  };

  // Submit UPI/QR payment verifications screenshot & UTR number
  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!manualAmount || parseFloat(manualAmount) <= 0) {
      toast.error("Please enter a valid refill amount.");
      return;
    }
    if (!/^\d{12}$/.test(utr)) {
      toast.success("UTR must be exactly 12 digits (numeric characters only).");
      return;
    }
    if (!screenshotUrl) {
      toast.error("Please select and upload a payment receipt screenshot.");
      return;
    }

    setManualSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/payments/verify-submit`,
        {
          amount: parseFloat(manualAmount),
          paymentMethod: manualMethod,
          upiIdUsed: manualMethod === "upi" ? userUpiId : undefined,
          utr,
          screenshotUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        toast.error(response.data.message);
        setManualAmount("");
        setUserUpiId("");
        setUtr("");
        setScreenshotUrl("");
        setUploadSuccess(false);

        // Refresh manual verification requests
        const reqsRes = await axios.get(`${API}/api/payments/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (reqsRes.data.success) {
          setMyRequests(reqsRes.data.verifications);
        }
      }
    } catch (err) {
      console.warn("Database offline, submitting payment request locally...");

      // Local fallback simulation
      const currentReqs = JSON.parse(
        localStorage.getItem("my_payment_verifications") || "[]",
      );
      if (currentReqs.some((r) => r.utr === utr)) {
        toast.error(
          "This UTR number has already been used. Please submit a unique UTR.",
        );
        setManualSaving(false);
        return;
      }

      const mockReq = {
        _id: "req-" + Date.now(),
        userId: user ? user._id : "user-987",
        userName: user ? user.name : "Guest",
        userEmail: user ? user.email : "guest@onwheel.ev",
        amount: parseFloat(manualAmount),
        paymentMethod: manualMethod,
        upiIdUsed: manualMethod === "upi" ? userUpiId : undefined,
        utr,
        screenshotUrl,
        status: "pending",
        createdAt: new Date(),
      };

      const updatedReqs = [...currentReqs, mockReq];
      localStorage.setItem(
        "my_payment_verifications",
        JSON.stringify(updatedReqs),
      );
      setMyRequests(updatedReqs);

      toast.success(
        "Verification receipt submitted successfully (Local Simulation Mode)! Pending admin approval.",
      );
      setManualAmount("");
      setUserUpiId("");
      setUtr("");
      setScreenshotUrl("");
      setUploadSuccess(false);
    } finally {
      setManualSaving(false);
    }
  };

  const myVehicles =
    user && user.vehicles && user.vehicles.length > 0
      ? user.vehicles
      : [
          {
            _id: "default-active-ev",
            model: user ? user.vehicleModel : "Tata Nexon EV Max",
            capacity: user ? user.batteryCapacity : 40.5,
            range: user ? Math.round(user.batteryCapacity * 9.5) : 380,
          },
        ];

  const handleModelChange = (modelName) => {
    setSelectedModel(modelName);
    const defaults = {
      "Tata Nexon EV Max": 40.5,
      "Tesla Model 3": 60.0,
      "MG ZS EV": 50.3,
      "Hyundai Ioniq 5": 72.6,
    };
    if (defaults[modelName]) {
      setSelectedCapacity(defaults[modelName]);
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setVehicleSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API}/api/auth/profile`,
        {
          vehicleModel: selectedModel,
          batteryCapacity: parseFloat(selectedCapacity),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        if (onProfileUpdate) {
          onProfileUpdate(response.data.user);
        }
        toast.success("Vehicle specifications updated successfully!");
      }
    } catch (err) {
      console.warn("Database offline, caching vehicle changes locally...");
      setTimeout(() => {
        const updated = {
          ...user,
          vehicleModel: selectedModel,
          batteryCapacity: parseFloat(selectedCapacity),
        };
        if (onProfileUpdate) {
          onProfileUpdate(updated);
        }
        toast.success("Vehicle specifications updated (Simulated Local Mode)!");
      }, 500);
    } finally {
      setVehicleSaving(false);
    }
  };

  // Add a new vehicle to the garage
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newModel || !newCapacity) return;
    setVehicleSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/auth/profile/vehicles`,
        {
          model: newModel,
          capacity: parseFloat(newCapacity),
          range: newRange ? parseFloat(newRange) : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success("New vehicle configuration added successfully!");
        setNewModel("");
        setNewCapacity("");
        setNewRange("");
        setIsAdding(false);
      }
    } catch (err) {
      console.warn("Database offline, adding vehicle locally...");
      const mockId = "local-" + Date.now();
      const mockVehicle = {
        _id: mockId,
        model: newModel,
        capacity: parseFloat(newCapacity),
        range: newRange
          ? parseFloat(newRange)
          : Math.round(parseFloat(newCapacity) * 9.5),
      };

      const currentVehicles =
        user.vehicles && user.vehicles.length > 0
          ? [...user.vehicles]
          : [
              {
                _id: "default-active-ev",
                model: user.vehicleModel,
                capacity: user.batteryCapacity,
                range: Math.round(user.batteryCapacity * 9.5),
              },
            ];

      const updatedVehicles = [...currentVehicles, mockVehicle];
      const updatedUser = {
        ...user,
        vehicles: updatedVehicles,
      };
      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success("Vehicle added to garage (Local Simulation Mode)!");
      setNewModel("");
      setNewCapacity("");
      setNewRange("");
      setIsAdding(false);
    } finally {
      setVehicleSaving(false);
    }
  };

  // Set a vehicle configuration as the current active one
  const handleSelectVehicle = async (vehicleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/api/auth/profile/vehicles/${vehicleId}/select`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success(
          `Switched active EV configuration to: ${response.data.user.vehicleModel}`,
        );
      }
    } catch (err) {
      console.warn("Database offline, switching active vehicle locally...");
      const targetVehicle = myVehicles.find((v) => v._id === vehicleId);
      if (targetVehicle) {
        const updatedUser = {
          ...user,
          vehicleModel: targetVehicle.model,
          batteryCapacity: targetVehicle.capacity,
        };
        if (onProfileUpdate) onProfileUpdate(updatedUser);
        toast.success(
          `Switched active EV configuration to: ${targetVehicle.model} (Local Simulation Mode)`,
        );
      }
    }
  };

  // Edit a vehicle configuration specs
  const handleEditVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!editingVehicleId) return;
    setVehicleSaving(true);
    try {
      const token = localStorage.getItem("token");
      console.log(token);
      const response = await axios.put(
        `${API}/api/auth/profile/vehicles/${editingVehicleId}`,
        {
          model: editModel,
          capacity: parseFloat(editCapacity),
          range: editRange ? parseFloat(editRange) : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success("Vehicle configuration updated successfully!");
        setEditingVehicleId(null);
      }
    } catch (err) {
      console.warn("Database offline, updating vehicle locally...");
      const updatedVehicles = myVehicles.map((v) => {
        if (v._id === editingVehicleId) {
          return {
            ...v,
            model: editModel,
            capacity: parseFloat(editCapacity),
            range: editRange
              ? parseFloat(editRange)
              : Math.round(parseFloat(editCapacity) * 9.5),
          };
        }
        return v;
      });
      const updatedTarget = updatedVehicles.find(
        (v) => v._id === editingVehicleId,
      );
      const wasActive =
        user.vehicleModel ===
        myVehicles.find((v) => v._id === editingVehicleId)?.model;
      const updatedUser = {
        ...user,
        vehicles: updatedVehicles,
        ...(wasActive
          ? {
              vehicleModel: updatedTarget.model,
              batteryCapacity: updatedTarget.capacity,
            }
          : {}),
      };
      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success("Vehicle specs updated (Local Simulation Mode)!");
      setEditingVehicleId(null);
    } finally {
      setVehicleSaving(false);
    }
  };

  // Delete a vehicle configuration from garage
  const handleDeleteVehicle = async (vehicleId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this vehicle from your garage?",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API}/api/auth/profile/vehicles/${vehicleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        if (onProfileUpdate) onProfileUpdate(response.data.user);
        toast.success("Vehicle removed from garage successfully.");
      }
    } catch (err) {
      console.warn("Database offline, removing vehicle locally...");
      const updatedVehicles = myVehicles.filter((v) => v._id !== vehicleId);
      const deletedVehicle = myVehicles.find((v) => v._id === vehicleId);
      let extraUpdates = {};
      if (deletedVehicle && user.vehicleModel === deletedVehicle.model) {
        if (updatedVehicles.length > 0) {
          extraUpdates = {
            vehicleModel: updatedVehicles[0].model,
            batteryCapacity: updatedVehicles[0].capacity,
          };
        } else {
          extraUpdates = {
            vehicleModel: "Tata Nexon EV Max",
            batteryCapacity: 40.5,
          };
        }
      }
      const updatedUser = {
        ...user,
        vehicles: updatedVehicles,
        ...extraUpdates,
      };
      if (onProfileUpdate) onProfileUpdate(updatedUser);
      toast.success("Vehicle removed (Local Simulation Mode).");
    }
  };
  const [metrics, setMetrics] = useState({
    totalTrips: 0,
    distanceCovered: 0,
    carbonSaved: 0,
    totalSpent: 0,
  });
  const [recentTrips, setRecentTrips] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dynamic payment settings config fetched from admin settings
  const [upiId, setUpiId] = useState("varun2004.pvt@okaxis");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch user's dynamic history from active records
      const historyRes = await axios.get(`${API}/api/trips/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (historyRes.data.success) {
        const userTrips = historyRes.data.trips;
        if (userTrips && userTrips.length > 0) {
          const formatted = userTrips.map((t) => ({
            id: t._id,
            source: t.sourceName.split(",")[0],
            destination: t.destName.split(",")[0],
            date: new Date(t.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            dist: t.totalDistance,
            stops: t.suggestedStops ? t.suggestedStops.length : 0,
          }));
          setRecentTrips(formatted.slice(0, 4));

          // Compute statistics dynamically from Atlas DB
          const totalDistance = userTrips.reduce(
            (acc, t) => acc + t.totalDistance,
            0,
          );
          setMetrics({
            totalTrips: userTrips.length,
            distanceCovered: totalDistance,
            carbonSaved: Math.round(totalDistance * 0.12),
            totalSpent: Math.round(totalDistance * 1.55),
          });
        } else {
          // Zero active records in Atlas for this user
          setRecentTrips([]);
          setMetrics({
            totalTrips: 0,
            distanceCovered: 0,
            carbonSaved: 0,
            totalSpent: 0,
          });
        }
      }
      // Fetch manual payment requests
      const paymentsRes = await axios.get(`${API}/api/payments/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (paymentsRes.data.success) {
        setMyRequests(paymentsRes.data.verifications);
      }

      // Fetch global payment settings config [NEW]
      const settingsRes = await axios.get(`${API}/api/payments/settings`);
      if (settingsRes.data.success && settingsRes.data.settings) {
        setUpiId(settingsRes.data.settings.upiId);
        setQrCodeUrl(settingsRes.data.settings.qrCodeUrl);
      }
    } catch (err) {
      console.warn(
        "Database offline, reading local browser localstorage caches...",
      );
      // Load simulated manual requests
      const cachedRequests = JSON.parse(
        localStorage.getItem("my_payment_verifications") || "[]",
      );
      setMyRequests(cachedRequests);

      // Load simulated payment configurations
      setUpiId(
        localStorage.getItem("admin_configured_upi") || "varun2004.pvt@okaxis",
      );
      setQrCodeUrl(localStorage.getItem("admin_configured_qr") || "");

      const localTrips = JSON.parse(
        localStorage.getItem("saved_trips") || "[]",
      );
      if (localTrips.length > 0) {
        const formatted = localTrips.map((t) => ({
          id: t.id,
          source: t.sourceName.split(",")[0],
          destination: t.destName.split(",")[0],
          date: new Date(t.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          dist: t.totalDistance,
          stops: t.suggestedStops ? t.suggestedStops.length : 1,
        }));
        setRecentTrips(formatted.slice(0, 4));
        const totalDistance = localTrips.reduce(
          (acc, t) => acc + t.totalDistance,
          0,
        );
        setMetrics({
          totalTrips: localTrips.length,
          distanceCovered: totalDistance,
          carbonSaved: Math.round(totalDistance * 0.12),
          totalSpent: Math.round(totalDistance * 1.55),
        });
      } else {
        setRecentTrips([]);
        setMetrics({
          totalTrips: 0,
          distanceCovered: 0,
          carbonSaved: 0,
          totalSpent: 0,
        });
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "trips", name: "My Trips", icon: History, path: "/saved-trips" },
    { id: "locations", name: "Saved Locations", icon: MapPin },
    { id: "vehicles", name: "My Vehicles", icon: Car },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  const userName = user ? user.name : "Arjun";
  const vehicleName = user ? user.vehicleModel : "Tata Nexon EV Max";
  const batteryCap = user ? user.batteryCapacity : 40.5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left bg-cyber-bg">
      {/* Premium Token Refill Modal */}
      {showTokenModal && (
        <TokenRefillPaymentModal
          user={user}
          onClose={() => setShowTokenModal(false)}
          onSuccess={(updatedUser, bundle) => {
            if (updatedUser && onProfileUpdate) {
              onProfileUpdate(updatedUser);
            } else if (bundle && onProfileUpdate) {
              // Offline local simulation fallback
              const current = user || {};
              const newCredits =
                (current.plannerCredits !== undefined
                  ? current.plannerCredits
                  : 10) + bundle.tokens;
              const newBalance = (current.walletBalance || 1000) - bundle.cost;
              const newTx = {
                _id: "tx-local-" + Date.now(),
                amount: -bundle.cost,
                description: `Purchased ${bundle.tokens} Premium Route Planner Tokens (${bundle.name})`,
                date: new Date(),
              };
              onProfileUpdate({
                ...current,
                plannerCredits: newCredits,
                walletBalance: Math.max(0, newBalance),
                transactions: [...(current.transactions || []), newTx],
              });
            }
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Sidebar Panel */}
        <div className="lg:col-span-3 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="px-4 py-3 border-b border-cyber-gray-950 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
            OnWheel Operations
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return item.path ? (
              <Link
                key={item.id}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-cyber-green/10 hover:text-cyber-green transition-all"
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isTabActive
                    ? "bg-cyber-green/10 text-cyber-green border-l-2 border-cyber-green"
                    : "text-gray-300 hover:bg-cyber-hover hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all border-t border-cyber-gray-950 mt-4 pt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Right Side: Primary content dashboard grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          key={activeTab}
          className="lg:col-span-9 space-y-8"
        >
          {activeTab === "dashboard" && (
            <>
              {/* Header greetings */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-white flex items-center">
                    Welcome back, {userName}! ⚡
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Here's your electric mobility trip summary.
                  </p>
                </div>

                <Link
                  to="/planner"
                  className="btn-cyber-primary text-xs font-bold py-2 px-4"
                >
                  Plan New Route
                </Link>
              </div>

              {/* Quick summary numbers layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 md:p-6 text-left shadow-md flex flex-col justify-between min-h-[90px] md:min-h-[110px]">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider block">
                    Total Trips
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white mt-2 block">
                    {metrics.totalTrips}
                  </span>
                </div>

                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 md:p-6 text-left shadow-md flex flex-col justify-between min-h-[90px] md:min-h-[110px]">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider block">
                    Distance Covered
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-cyber-green mt-2 block break-all">
                    {metrics.distanceCovered.toLocaleString()} km
                  </span>
                </div>

                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 md:p-6 text-left shadow-md flex flex-col justify-between min-h-[90px] md:min-h-[110px]">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider block flex items-center">
                    <Leaf className="w-3.5 h-3.5 text-cyber-accent mr-1 shrink-0" />
                    CO₂ Saved
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-cyber-accent mt-2 block">
                    {metrics.carbonSaved} kg
                  </span>
                </div>

                <div className="bg-[#121212] border border-cyber-gray-800 rounded-xl p-5 md:p-6 text-left shadow-md flex flex-col justify-between min-h-[90px] md:min-h-[110px]">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider block">
                    Total Cost Saved
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white mt-2 block break-all">
                    ₹{metrics.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Splitted section details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Recent Trips lists */}
                <div className="md:col-span-7 bg-[#121212] border border-cyber-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="font-bold text-white text-base border-b border-cyber-gray-900 pb-3">
                    Recent Trips
                  </h3>

                  <div className="space-y-3">
                    {recentTrips.length > 0 ? (
                      recentTrips.map((trip) => (
                        <div
                          key={trip.id}
                          className="flex justify-between items-center bg-[#0b0c10] border border-cyber-gray-900 hover:border-cyber-green/20 p-3.5 rounded-xl transition-all"
                        >
                          <div className="text-left">
                            <p className="text-sm font-extrabold text-white flex items-center">
                              {trip.source}
                              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-cyber-green" />
                              {trip.destination}
                            </p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              {trip.date} • {trip.stops} Stops
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-white block">
                              {trip.dist} km
                            </span>
                            <span className="inline-flex items-center text-[9px] text-cyber-green font-bold mt-1 bg-cyber-green/10 px-2 py-0.5 rounded">
                              Completed
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-[#0b0c10]/40 border border-cyber-gray-950 rounded-xl">
                        <p className="text-xs text-gray-500 font-semibold">
                          No recent trips logged.
                        </p>
                        <Link
                          to="/planner"
                          className="text-[10px] text-cyber-green hover:underline font-bold mt-2 inline-block"
                        >
                          Plan Your First Route →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* My Vehicle Card HUD overlay */}
                <div className="md:col-span-5 bg-[#121212] border border-cyber-gray-800 rounded-2xl p-5 shadow-lg space-y-5 text-left">
                  <h3 className="font-bold text-white text-base border-b border-cyber-gray-900 pb-3">
                    My Vehicle
                  </h3>

                  <div className="bg-[#0b0c10] border border-cyber-gray-900 p-4 rounded-xl flex items-center space-x-3.5">
                    <Car className="w-10 h-10 text-cyber-green" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">
                        Active EV Model
                      </span>
                      <span className="text-sm font-extrabold text-white mt-0.5">
                        {vehicleName}
                      </span>
                      <span className="text-[10px] text-cyber-accent mt-0.5 font-medium">
                        Battery Pack: {batteryCap} kWh
                      </span>
                    </div>
                  </div>

                  {/* Dynamic battery remaining gauge */}
                  <div className="bg-[#0b0c10] border border-cyber-gray-900 p-4 rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-400">
                        Current Charge level
                      </span>
                      <span className="text-cyber-green font-extrabold">
                        60%
                      </span>
                    </div>

                    <div className="h-2.5 bg-cyber-gray-900 rounded-full overflow-hidden w-full border border-cyber-gray-800">
                      <div
                        className="h-full bg-cyber-green rounded-full shadow-cyber-glow"
                        style={{ width: "60%" }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Range Est: ~260 km</span>
                      <span>Health: Good</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: SAVED LOCATIONS */}
          {activeTab === "locations" && (
            <div className="space-y-6 animate-fade-in text-left">
              <h3 className="font-bold text-white text-lg border-b border-cyber-gray-800 pb-3">
                Saved Locations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user &&
                user.savedLocations &&
                user.savedLocations.length > 0 ? (
                  user.savedLocations.map((loc) => (
                    <div
                      key={loc._id}
                      className="bg-cyber-card border border-cyber-gray-800 p-4 rounded-xl flex justify-between items-center hover:border-cyber-green transition duration-300 overflow-hidden"
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {loc.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {loc.address}
                        </p>
                        <span className="text-[9px] font-mono text-gray-600 block mt-0.5">
                          GPS: {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          to="/planner"
                          state={{ initialDestination: loc.address }}
                          className="px-3 py-1 bg-[#0b0c10] text-[10px] font-bold text-cyber-green border border-cyber-green rounded hover:bg-cyber-green hover:text-black transition"
                        >
                          Plan Route
                        </Link>

                        <button
                          onClick={() => handleDeleteLocation(loc._id)}
                          className="p-1.5 bg-[#0b0c10] border border-cyber-gray-900 rounded text-red-400 hover:text-red-500 hover:border-red-500/30 transition"
                          title="Remove Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 p-8 text-center bg-[#0b0c10]/40 border border-cyber-gray-950 rounded-xl">
                    <p className="text-xs text-gray-500 font-semibold">
                      No saved locations found on your profile.
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleAddLocation}
                className="bg-[#121212] border border-cyber-gray-800 p-5 rounded-2xl space-y-4 max-w-md"
              >
                <h4 className="font-bold text-white text-sm">
                  Add New Saved Location
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Location Name (e.g. Work)"
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 rounded-lg py-2 px-3 text-white outline-none focus:border-cyber-green"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Address Coordinate or City"
                    value={locAddress}
                    onChange={(e) => setLocAddress(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 rounded-lg py-2 px-3 text-white outline-none focus:border-cyber-green"
                  />
                </div>
                <button
                  type="submit"
                  disabled={locSaving}
                  className="w-full btn-cyber-primary py-2 text-xs font-bold uppercase tracking-wider text-black"
                >
                  {locSaving
                    ? "Saving coordinates..."
                    : "Save Location Coordinates"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MY VEHICLES / GARAGE */}
          {activeTab === "vehicles" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyber-gray-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-xl">
                    My Fleet Garage
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Tweak telemetries, add custom battery capacities, and switch
                    active rides.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsAdding(!isAdding);
                    setEditingVehicleId(null);
                  }}
                  className="btn-cyber-primary text-[10px] font-bold tracking-wider uppercase flex items-center space-x-1 py-2 px-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAdding ? "Close Panel" : "Add Vehicle"}</span>
                </button>
              </div>

              {/* Add New Vehicle Form Panel */}
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-cyber-card border border-cyber-green/30 p-5 rounded-2xl space-y-4 max-w-xl shadow-cyber-glow"
                >
                  <h4 className="font-bold text-cyber-green text-sm flex items-center">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Configure New Electric Vehicle Specs
                  </h4>

                  <form
                    onSubmit={handleAddVehicle}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs text-left"
                  >
                    <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                      <label className="font-bold uppercase tracking-wider">
                        EV Model Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tesla Model Y"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2 px-3 text-white outline-none"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                      <label className="font-bold uppercase tracking-wider">
                        Battery Capacity (kWh)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="e.g. 75"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(e.target.value)}
                        className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2 px-3 text-white outline-none"
                      />
                    </div>

                    <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                      <label className="font-bold uppercase tracking-wider">
                        Estimated Range (km)
                      </label>
                      <input
                        type="number"
                        placeholder="Leave blank for auto-calc"
                        value={newRange}
                        onChange={(e) => setNewRange(e.target.value)}
                        className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2 px-3 text-white outline-none"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="bg-cyber-gray-950 border border-cyber-gray-900 text-gray-400 py-2 px-4 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-cyber-gray-900 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={vehicleSaving}
                        className="btn-cyber-primary py-2 px-4 text-[10px] text-black font-bold uppercase tracking-wider"
                      >
                        {vehicleSaving ? "Saving..." : "Deploy to Garage"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Fleet List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myVehicles.map((vehicle) => {
                  const isCurrentlyActive = user
                    ? user.vehicleModel === vehicle.model
                    : vehicle.model === "Tata Nexon EV Max";
                  const isEditingThis = editingVehicleId === vehicle._id;

                  return (
                    <div
                      key={vehicle._id || vehicle.model}
                      className={`bg-[#121212] border rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 ${
                        isCurrentlyActive
                          ? "border-cyber-green shadow-cyber-glow"
                          : "border-cyber-gray-800 hover:border-cyber-green/30"
                      }`}
                    >
                      {isCurrentlyActive && (
                        <span className="absolute top-0 right-0 px-2 py-0.5 bg-cyber-green text-black font-bold text-[8px] uppercase tracking-widest rounded-bl-lg">
                          Active Drive
                        </span>
                      )}

                      {isEditingThis ? (
                        /* Edit Vehicle Inline Form */
                        <form
                          onSubmit={handleEditVehicleSubmit}
                          className="space-y-4 text-xs text-left"
                        >
                          <h4 className="font-bold text-cyber-accent text-sm flex items-center">
                            <Edit3 className="w-4 h-4 mr-1.5" />
                            Edit Specs
                          </h4>

                          <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                            <label className="font-bold uppercase tracking-wider">
                              EV Model
                            </label>
                            <input
                              type="text"
                              required
                              value={editModel}
                              onChange={(e) => setEditModel(e.target.value)}
                              className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                              <label className="font-bold uppercase tracking-wider">
                                Capacity (kWh)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                required
                                value={editCapacity}
                                onChange={(e) =>
                                  setEditCapacity(e.target.value)
                                }
                                className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none"
                              />
                            </div>

                            <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                              <label className="font-bold uppercase tracking-wider">
                                Range (km)
                              </label>
                              <input
                                type="number"
                                required
                                value={editRange}
                                onChange={(e) => setEditRange(e.target.value)}
                                className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingVehicleId(null)}
                              className="bg-cyber-gray-950 border border-cyber-gray-900 text-gray-400 py-1.5 px-3 rounded text-[10px] font-bold uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={vehicleSaving}
                              className="bg-cyber-accent text-black py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-cyber-accent/80 transition"
                            >
                              Save Specs
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Standard Vehicle Specs Display */
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <Car
                              className={`w-8 h-8 ${isCurrentlyActive ? "text-cyber-green" : "text-gray-400"}`}
                            />
                            <div>
                              <h4 className="font-bold text-white text-base leading-tight">
                                {vehicle.model}
                              </h4>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Saved Configuration
                              </p>
                            </div>
                          </div>

                          <div className="text-xs space-y-2 border-t border-cyber-gray-900 pt-3 text-gray-400">
                            <p className="flex justify-between">
                              <span>Battery Capacity:</span>
                              <b className="text-white">
                                {vehicle.capacity} kWh
                              </b>
                            </p>
                            <p className="flex justify-between">
                              <span>Range Estimate:</span>
                              <b className="text-cyber-accent">
                                {vehicle.range ||
                                  Math.round(vehicle.capacity * 9.5)}{" "}
                                km
                              </b>
                            </p>
                            <p className="flex justify-between">
                              <span>Charging Standard:</span>
                              <b className="text-gray-400 font-mono text-[10px]">
                                CCS Type 2
                              </b>
                            </p>
                          </div>

                          <div className="flex justify-between items-center border-t border-cyber-gray-950 mt-4 pt-3">
                            <div className="flex space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingVehicleId(vehicle._id);
                                  setEditModel(vehicle.model);
                                  setEditCapacity(vehicle.capacity);
                                  setEditRange(
                                    vehicle.range ||
                                      Math.round(vehicle.capacity * 9.5),
                                  );
                                  setIsAdding(false);
                                }}
                                className="p-1.5 bg-[#0b0c10] border border-cyber-gray-900 rounded text-gray-400 hover:text-cyber-accent hover:border-cyber-accent/30 transition-all"
                                title="Edit specs"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteVehicle(vehicle._id)}
                                disabled={
                                  isCurrentlyActive || myVehicles.length <= 1
                                }
                                className={`p-1.5 bg-[#0b0c10] border border-cyber-gray-900 rounded transition-all ${
                                  isCurrentlyActive || myVehicles.length <= 1
                                    ? "text-gray-600 cursor-not-allowed opacity-40"
                                    : "text-red-400 hover:text-red-500 hover:border-red-500/30"
                                }`}
                                title="Delete configuration"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {!isCurrentlyActive && (
                              <button
                                onClick={() => handleSelectVehicle(vehicle._id)}
                                className="bg-[#0b0c10] border border-cyber-green text-cyber-green text-[9px] font-extrabold uppercase px-3 py-1 rounded hover:bg-cyber-green hover:text-black transition duration-300 flex items-center space-x-1"
                              >
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                <span>Set Active</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS LEDGER */}
          {activeTab === "payments" && (
            <div className="space-y-8 animate-fade-in text-left">
              <h3 className="font-bold text-white text-lg border-b border-cyber-gray-800 pb-3">
                Payments & CyberPass Billing
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Pass & Refill */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Visual Cyber Card */}
                  <div className="bg-gradient-to-br from-[#121212] to-[#08090C] border border-cyber-green/50 p-5 rounded-2xl h-44 flex flex-col justify-between shadow-cyber-glow relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyber-green/5 rounded-full blur-2xl group-hover:bg-cyber-green/10 transition-all duration-500" />
                    <div className="flex justify-between items-start">
                      <Zap className="w-6 h-6 text-cyber-green fill-cyber-green" />
                      <span className="text-[8px] font-mono tracking-widest text-cyber-green border border-cyber-green px-1.5 py-0.5 rounded">
                        CYBER_PASS
                      </span>
                    </div>
                    <div className="text-left font-mono">
                      <p className="text-[10px] text-gray-500 tracking-wider">
                        CREDIT BALANCE
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        ₹
                        {user && user.walletBalance !== undefined
                          ? user.walletBalance.toLocaleString()
                          : "1,000"}
                        .00
                      </h3>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 border-t border-cyber-gray-950 pt-2">
                      <span>{userName}</span>
                      <span>**** 2026</span>
                    </div>
                  </div>

                  {/* Premium AI Credits Card */}
                  <div className="bg-gradient-to-br from-[#121212] to-[#08090C] border border-cyber-accent/50 p-5 rounded-2xl h-44 flex flex-col justify-between shadow-cyber-glow relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyber-accent/5 rounded-full blur-2xl group-hover:bg-cyber-accent/10 transition-all duration-500" />
                    <div className="flex justify-between items-start">
                      <Zap className="w-6 h-6 text-cyber-accent fill-cyber-accent" />
                      <span className="text-[8px] font-mono tracking-widest text-cyber-accent border border-cyber-accent px-1.5 py-0.5 rounded">
                        PREMIUM_AI_COCKPIT
                      </span>
                    </div>
                    <div className="text-left font-mono">
                      <p className="text-[10px] text-gray-500 tracking-wider">
                        PREMIUM PLANNER TOKENS
                      </p>
                      <h3 className="text-2xl font-extrabold text-white mt-1">
                        ⚡{" "}
                        {user && user.plannerCredits !== undefined
                          ? user.plannerCredits
                          : 10}{" "}
                        Tokens
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTokenModal(true)}
                      className="w-full py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg border border-cyber-accent/40 hover:border-cyber-accent bg-cyber-accent/10 hover:bg-cyber-accent hover:text-black text-cyber-accent shadow-md shadow-cyber-accent/10 transition-all duration-200 flex items-center justify-center space-x-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Refill Token Bundles</span>
                    </button>
                  </div>

                  {/* Refill Form Panel with Instant vs UPI/QR Tabs */}
                  <div className="bg-cyber-card border border-cyber-gray-800 p-5 rounded-2xl space-y-5">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Refill Pass Wallet
                    </h4>

                    {/* Tab Selector */}
                    <div className="bg-[#0b0c10] border border-cyber-gray-900 rounded-xl p-1 flex">
                      <button
                        type="button"
                        onClick={() => setRefillMode("instant")}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition ${
                          refillMode === "instant"
                            ? "bg-cyber-green text-black font-extrabold"
                            : "text-gray-500 hover:text-white font-semibold"
                        }`}
                      >
                        Instant Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefillMode("manual")}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition ${
                          refillMode === "manual"
                            ? "bg-cyber-accent text-black font-extrabold"
                            : "text-gray-500 hover:text-white font-semibold"
                        }`}
                      >
                        UPI / QR Verification
                      </button>
                    </div>

                    {refillMode === "instant" ? (
                      /* Original Instant Simulated Card Refill */
                      <form onSubmit={handleRefillWallet} className="space-y-4">
                        <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                          <label className="font-bold uppercase tracking-wider">
                            Refill Amount (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="50"
                            placeholder="e.g. 500"
                            value={refillAmount}
                            onChange={(e) => setRefillAmount(e.target.value)}
                            className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2 px-3 text-white text-xs outline-none transition"
                          />
                        </div>

                        {/* Quick values buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          {[200, 500, 1000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setRefillAmount(amt.toString())}
                              className="py-1 bg-[#0b0c10] hover:bg-cyber-green/10 text-gray-400 hover:text-cyber-green border border-cyber-gray-900 hover:border-cyber-green/20 rounded text-[10px] font-bold transition"
                            >
                              + ₹{amt}
                            </button>
                          ))}
                        </div>

                        <button
                          type="submit"
                          disabled={isRefilling}
                          className="w-full btn-cyber-primary py-2 text-[10px] font-bold tracking-wider uppercase text-black"
                        >
                          {isRefilling
                            ? "Processing CyberCard..."
                            : "Refill Instantly"}
                        </button>
                      </form>
                    ) : (
                      /* Manual Payments Upload verified screenshot flow */
                      <form
                        onSubmit={handleManualPaymentSubmit}
                        className="space-y-4 text-xs text-left"
                      >
                        {/* Submethod Selection */}
                        <div className="flex space-x-3 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setManualMethod("upi")}
                            className={`px-3 py-1.5 rounded-lg border transition ${
                              manualMethod === "upi"
                                ? "bg-cyber-accent/10 border-cyber-accent text-cyber-accent"
                                : "bg-[#0b0c10] border-cyber-gray-900 text-gray-400"
                            }`}
                          >
                            Pay with UPI ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualMethod("qr")}
                            className={`px-3 py-1.5 rounded-lg border transition ${
                              manualMethod === "qr"
                                ? "bg-cyber-accent/10 border-cyber-accent text-cyber-accent"
                                : "bg-[#0b0c10] border-cyber-gray-900 text-gray-400"
                            }`}
                          >
                            Scan QR Code
                          </button>
                        </div>

                        {/* UPI Payment Instructions */}
                        {manualMethod === "upi" ? (
                          <div className="p-3 bg-[#0b0c10] border border-cyber-gray-900 rounded-xl space-y-1">
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold">
                              Refill UPI ID
                            </span>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white font-mono font-bold select-all">
                                {upiId}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(upiId);
                                  toast.success("UPI ID copied to clipboard!");
                                }}
                                className="text-[10px] text-cyber-accent font-bold uppercase hover:underline"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Dynamic Configured QR Code Image or retro vector SVG mockup backup */
                          <div className="p-3 bg-[#0b0c10] border border-cyber-gray-900 rounded-xl flex flex-col items-center space-y-2">
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">
                              Scan Secure QR Code
                            </span>
                            {qrCodeUrl ? (
                              <div className="w-32 h-32 bg-[#121212] border border-cyber-accent/30 rounded-lg p-1 overflow-hidden flex items-center justify-center">
                                <img
                                  src={qrCodeUrl}
                                  alt="Active Refill QR Code"
                                  className="w-full h-full object-contain rounded"
                                />
                              </div>
                            ) : (
                              <div className="w-32 h-32 bg-[#121212] border border-cyber-accent/30 rounded-lg p-2.5 flex items-center justify-center relative">
                                <svg
                                  className="w-full h-full text-cyber-accent filter drop-shadow-[0_0_2px_#1de9b6]"
                                  viewBox="0 0 100 100"
                                  fill="currentColor"
                                >
                                  <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z M45,45 h10 v10 h-10 z M45,5 h10 v10 h-10 z M5,45 h10 v10 h-10 z M65,45 h10 v10 h-10 z M45,65 h10 v10 h-10 z M65,65 h10 v10 h-10 z M75,85 h10 v10 h-10 z M85,75 h15 v10 h-15 z M85,45 h10 v10 h-10 z" />
                                </svg>
                              </div>
                            )}
                            <span className="text-[8px] font-mono text-gray-500 tracking-wider">
                              ONWHEEL CORE BILLING SYSTEM
                            </span>
                          </div>
                        )}

                        {/* Fields Form */}
                        <div className="flex flex-col space-y-1 text-[10px] text-gray-500">
                          <label className="font-bold uppercase tracking-wider">
                            Refill Amount (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="10"
                            placeholder="e.g. 500"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none"
                          />
                        </div>

                        {manualMethod === "upi" && (
                          <div className="flex flex-col space-y-1 text-[10px] text-gray-500">
                            <label className="font-bold uppercase tracking-wider">
                              Your UPI ID (Sender)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. driver@oksbi"
                              value={userUpiId}
                              onChange={(e) => setUserUpiId(e.target.value)}
                              className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white outline-none"
                            />
                          </div>
                        )}

                        <div className="flex flex-col space-y-1 text-[10px] text-gray-500">
                          <label className="font-bold uppercase tracking-wider">
                            12-Digit Transaction UTR Number
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={12}
                            minLength={12}
                            placeholder="e.g. 192837465019"
                            value={utr}
                            onChange={(e) =>
                              setUtr(e.target.value.replace(/\D/g, ""))
                            } // numeric only
                            className="bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-accent rounded-lg py-2 px-3 text-white font-mono outline-none tracking-widest"
                          />
                          <span className="text-[8px] text-gray-500 block">
                            Unique UTR is strictly validated by administrator.
                          </span>
                        </div>

                        {/* File Upload Box ImageKit */}
                        <div className="flex flex-col space-y-1.5 text-[10px] text-gray-500">
                          <label className="font-bold uppercase tracking-wider">
                            Upload Payment Screenshot Receipt
                          </label>
                          <div
                            className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center relative cursor-pointer hover:bg-[#0b0c10]/40 transition ${
                              uploadSuccess
                                ? "border-cyber-green"
                                : uploadLoading
                                  ? "border-cyber-accent animate-pulse"
                                  : "border-cyber-gray-900 hover:border-cyber-accent/50"
                            }`}
                          >
                            <input
                              type="file"
                              required
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(e.target.files[0])
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {uploadLoading ? (
                              <div className="text-center py-2">
                                <span className="animate-spin border-2 border-cyber-accent border-t-transparent w-4 h-4 rounded-full inline-block mr-2" />
                                <span className="text-cyber-accent text-[9px] font-mono tracking-widest uppercase">
                                  Uploading to ImageKit.io...
                                </span>
                              </div>
                            ) : uploadSuccess ? (
                              <div className="text-center py-1 text-cyber-green text-[9px] font-mono tracking-widest uppercase font-bold flex items-center space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Screenshot Receipt Stored!</span>
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <p className="text-gray-400 font-semibold text-[9px] uppercase tracking-wider">
                                  Choose receipt screenshot image
                                </p>
                                <span className="text-[8px] text-gray-500 block mt-0.5">
                                  Direct ImageKit.io Upload enabled
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={
                            manualSaving || uploadLoading || !uploadSuccess
                          }
                          className={`w-full py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-black transition ${
                            manualSaving || uploadLoading || !uploadSuccess
                              ? "bg-cyber-gray-800 text-gray-500 cursor-not-allowed border border-cyber-gray-950"
                              : "bg-cyber-accent border border-cyber-accent hover:bg-cyber-accent/80 hover:text-black font-extrabold shadow-md shadow-cyber-accent/5"
                          }`}
                        >
                          {manualSaving
                            ? "Submitting to Admin..."
                            : "Submit Payment Verification"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Right Side: Ledger */}
                <div className="lg:col-span-7 bg-cyber-card border border-cyber-gray-800 rounded-2xl p-5 space-y-4 shadow-lg">
                  <h4 className="font-bold text-white text-sm border-b border-cyber-gray-900 pb-3 flex justify-between items-center">
                    <span>NFC Pass Billing Transactions</span>
                    <span className="text-[9px] text-gray-500 font-normal">
                      Auto-settled via Grid Smart Contracts
                    </span>
                  </h4>

                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {user &&
                    user.transactions &&
                    user.transactions.length > 0 ? (
                      [...user.transactions].reverse().map((tx) => {
                        const isRefill = tx.amount > 0;
                        return (
                          <div
                            key={tx._id || tx.date}
                            className="flex justify-between items-center bg-[#0b0c10] border border-cyber-gray-950 p-3 rounded-xl hover:border-cyber-green/15 transition-all"
                          >
                            <div className="text-left space-y-1">
                              <p className="text-xs font-semibold text-white">
                                {tx.description}
                              </p>
                              <span className="text-[9px] text-gray-500 block">
                                {new Date(tx.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                at{" "}
                                {new Date(tx.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-xs font-extrabold font-mono ${isRefill ? "text-cyber-green" : "text-red-400"}`}
                              >
                                {isRefill ? "+" : ""}₹{tx.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center bg-[#0b0c10]/40 border border-cyber-gray-950 rounded-xl">
                        <p className="text-xs text-gray-500 font-semibold">
                          No recent transactions recorded.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manual Verification History Ledger Row */}
              <div className="bg-[#121212] border border-cyber-gray-800 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-white text-sm border-b border-cyber-gray-900 pb-3 flex justify-between items-center text-left">
                  <span>Manual Verification Submissions History</span>
                  <span className="text-[8px] font-mono text-cyber-accent">
                    ImageKit.io Screens & UTR12 Unique Ledger
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {myRequests.length > 0 ? (
                    myRequests.map((req) => (
                      <div
                        key={req._id}
                        className="bg-[#0b0c10] border border-cyber-gray-950 hover:border-cyber-accent/10 p-4 rounded-xl flex items-center justify-between gap-4 transition duration-300"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-extrabold text-white">
                              ₹{req.amount.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono tracking-wider">
                              ({req.paymentMethod.toUpperCase()})
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono">
                            UTR:{" "}
                            <b className="text-gray-200 tracking-wider">
                              {req.utr}
                            </b>
                          </p>
                          <span className="text-[8px] text-gray-600 block">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>

                          {req.adminNotes && (
                            <p className="text-[9px] text-cyber-accent bg-cyber-accent/5 px-2 py-0.5 rounded mt-1 border border-cyber-accent/15">
                              Remarks: {req.adminNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Mini Thumbnail and status pill */}
                          <a
                            href={req.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded border border-cyber-gray-900 overflow-hidden flex-shrink-0 cursor-pointer block hover:border-cyber-accent transition"
                            title="Click to view full uploaded screenshot"
                          >
                            <img
                              src={req.screenshotUrl}
                              alt="Manual Refill Screen"
                              className="object-cover w-full h-full opacity-70 hover:opacity-100 transition"
                            />
                          </a>

                          <span
                            className={`px-2 py-1 text-[9px] font-bold uppercase rounded font-mono ${
                              req.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 animate-pulse"
                                : req.status === "approved"
                                  ? "bg-cyber-green/10 text-cyber-green border border-cyber-green/25"
                                  : "bg-red-500/10 text-red-400 border border-red-500/25"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 p-8 text-center bg-[#0b0c10]/40 border border-cyber-gray-950 rounded-xl">
                      <p className="text-xs text-gray-500 font-semibold">
                        Zero manual payment verification requests logged.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EDIT PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in text-left">
              <h3 className="font-bold text-white text-lg border-b border-cyber-gray-800 pb-3">
                Edit Driver Profile
              </h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  toast.success("Profile updated successfully!");
                }}
                className="bg-cyber-card border border-cyber-gray-800 p-6 rounded-2xl space-y-6 max-w-md"
              >
                <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
                  <label className="font-bold uppercase tracking-wider">
                    Driver Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={userName}
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2.5 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
                  <label className="font-bold uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user ? user.email : "driver@onwheel.ev"}
                    className="w-full bg-[#0b0c10] border border-cyber-gray-900 focus:border-cyber-green rounded-lg py-2.5 px-3 text-white outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn-cyber-primary py-2.5 text-xs font-bold"
                >
                  Save Profile Modifications
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in text-left">
              <h3 className="font-bold text-white text-lg border-b border-cyber-gray-800 pb-3">
                Platform Preferences
              </h3>

              <div className="bg-[#121212] border border-cyber-gray-800 rounded-2xl p-5 space-y-5 max-w-md text-xs text-gray-400">
                <div className="flex justify-between items-center border-b border-cyber-gray-900 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Measuring Distance Units
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Toggle kilometers vs miles scales.
                    </p>
                  </div>
                  <select className="bg-cyber-card border border-cyber-gray-800 text-white rounded p-1">
                    <option>Metric (Kilometers)</option>
                    <option>Imperial (Miles)</option>
                  </select>
                </div>
                <div className="flex justify-between items-center border-b border-cyber-gray-900 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Auto Battery Warning Alerts
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Alert coordinates when battery falls low.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-cyber-green cursor-pointer"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Active Navigation Algorithm
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Choose route charging parameters.
                    </p>
                  </div>
                  <select className="bg-cyber-card border border-cyber-gray-800 text-white rounded p-1">
                    <option>Optimal Charge Stops</option>
                    <option>Fastest Duration</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
