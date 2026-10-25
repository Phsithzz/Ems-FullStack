import React, { useState, useEffect, useRef } from "react";
import { loginApi, verifyOtpApi, resendOtpApi } from "../services/AuthService";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";

const LoginComponent = () => {
  const [step, setStep] = useState(1); // 1 = Login credentials, 2 = 2FA OTP
  const [email, setEmail] = useState("admin@paypulse.io");
  const [password, setPassword] = useState("admin123");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const navigator = useNavigate();

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginApi(email, password);
      setLoading(false);

      if (response.data.otpRequired) {
        setStep(2);
        setTimer(60);
        setCanResend(false);
        setSuccessMessage("Verification code dispatched! Check your email (or server console).");
        // Focus first OTP slot
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 150);
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    }
  };

  // Step 2: Handle 6-digit OTP Inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1); // only take latest single char
    setOtpValues(newOtp);

    // Auto-advance focus to next slot
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are filled
    const completeCode = newOtp.join("");
    if (completeCode.length === 6 && !newOtp.includes("")) {
      verifyOtpCode(completeCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpValues(digits);
      inputRefs.current[5]?.focus();
      verifyOtpCode(pastedData);
    }
  };

  // Step 2: Verify OTP
  const verifyOtpCode = async (codeToVerify) => {
    const code = codeToVerify || otpValues.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }

    setErrorMessage("");
    try {
      setLoading(true);
      const res = await verifyOtpApi(email, code);
      setLoading(false);

      if (res.data) {
        useAuthStore.getState().setUser({
          email: res.data.email,
          name: res.data.name,
          role: res.data.role,
        });
      }

      setSuccessMessage("Authentication verified successfully! Redirecting...");
      setTimeout(() => {
        navigator("/employees");
      }, 700);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || "Invalid or expired OTP code.";
      setErrorMessage(msg);
      // Clear OTP on error
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setLoading(true);
      await resendOtpApi(email);
      setLoading(false);
      setTimer(60);
      setCanResend(false);
      setSuccessMessage("A fresh OTP code has been sent!");
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || "Failed to resend OTP.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)]">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5C35] to-[#FF844B] flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-500/20 mx-auto mb-3">
            P
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pay<span className="text-[#FF5C35]">Pulse</span> Platform
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1
              ? "Institutional Payroll & Corporate Cards Platform"
              : "Step 2: Two-Factor Security Verification"}
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: LOGIN FORM */}
        {step === 1 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Corporate Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@paypulse.io"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/20 focus:border-[#FF5C35] transition"
              />
            </div>

            {/* Default Account Hint Box */}
            <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100/70 text-[11px] text-slate-600 space-y-0.5">
              <span className="font-bold text-[#FF5C35]">Default Demo Credentials:</span>
              <p>Email: <code className="font-semibold text-slate-800">admin@paypulse.io</code></p>
              <p>Password: <code className="font-semibold text-slate-800">admin123</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF5C35] hover:bg-[#e84f28] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Continue with 2FA OTP &rarr;</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: TWO-FACTOR VERIFICATION FORM */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-xs text-slate-500">
                A 6-digit security code was sent to:
              </p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{email}</p>
            </div>

            {/* 6 Digit Input Slots */}
            <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
              {otpValues.map((val, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-extrabold rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/25 focus:border-[#FF5C35] text-slate-900 transition-all shadow-sm"
                />
              ))}
            </div>

            {/* Timer and Resend Row */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                &larr; Back to Login
              </button>

              <div>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-bold text-[#FF5C35] hover:underline"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-slate-400">
                    Resend in <span className="font-bold text-slate-600">{timer}s</span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => verifyOtpCode()}
              disabled={loading || otpValues.join("").length !== 6}
              className="w-full py-3 bg-[#FF5C35] hover:bg-[#e84f28] text-white font-bold rounded-xl shadow-md shadow-orange-500/20 text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying 2FA...</span>
                </>
              ) : (
                <span>Verify & Complete Login</span>
              )}
            </button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Protected by Redis TTL & HMAC-SHA256 Token Provider
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
