import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendLoginOtp, verifyLoginOtp, resendLoginOtp, apiError } from "../lib/api";
import { saveToken } from "../lib/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const requestOtp = async () => {
    setBusy(true);
    setMsg("");
    try { 
      const response = await sendLoginOtp(phone.trim());
      setSent(true);
      setMsg(response.message || "OTP has been sent to your phone");
    }
    catch(e){ setMsg(apiError(e)); }
    finally{ setBusy(false); }
  };

  const verify = async () => {
    setBusy(true);
    setMsg("");
    try {
      const token = await verifyLoginOtp(phone.trim(), otp.trim());
      saveToken(token);
      nav("/profile");
    }catch(e){ setMsg(apiError(e)); }
    finally{ setBusy(false); }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: "1rem" }}>
        <h1 className="section-title">Login</h1>
      </div>
      <div className="card stack">
        <div className="field">
          <label className="label">Phone Number</label>
          <input 
            className="input" 
            placeholder="Enter your phone number" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
        </div>
        <div className="row">
          <button 
            className="btn btn-primary" 
            onClick={requestOtp} 
            disabled={!phone || busy}
          >
            Request OTP
          </button>
          {sent && (
            <button 
              className="btn" 
              onClick={() => resendLoginOtp(phone.trim())} 
              disabled={busy}
            >
              Resend OTP
            </button>
          )}
        </div>
        {sent && (
          <div className="field">
            <label className="label">Enter OTP</label>
            <input 
              className="input" 
              placeholder="Enter OTP"
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
            />
          </div>
        )}
        <div className="row">
          <button 
            className="btn btn-primary" 
            onClick={verify} 
            disabled={!otp || !phone || busy}
          >
            Verify &amp; Login
          </button>
          {msg && <span className="chip">{String(msg)}</span>}
        </div>
        <div className="muted">
          New here? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
