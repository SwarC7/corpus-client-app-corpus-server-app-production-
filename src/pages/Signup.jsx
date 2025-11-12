import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupSendOtp, signupVerifyOtp, signupResendOtp, apiError } from "../lib/api";
import { saveToken } from "../lib/auth";

export default function Signup() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("other");
  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [place, setPlace] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigate();
  
  // Language state
  const [currentLang, setCurrentLang] = useState("en");

  const requestOtp = async () => {
    setBusy(true);
    setMsg("");
    try {
      await signupSendOtp(phone.trim());
      setSent(true);
      setMsg("OTP has been sent to your phone");
    } catch (err) {
      setMsg(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setMsg("");
    try {
      const token = await signupVerifyOtp({
        phone: phone.trim(),
        otp_code: otp.trim(),
        name: name.trim(),
        email: email.trim() || null,
        password,
        confirm_password: confirmPassword,
        gender,
        date_of_birth: dob,
        place,
        has_given_consent: consent,
        preferred_language: currentLang
      });
      saveToken(token);
      nav("/profile");
    } catch (err) {
      setMsg(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    phone && otp && name && password && confirmPassword &&
    gender && dob && place && consent && !busy;

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: "1rem" }}>
        <h1 className="section-title">Sign Up</h1>
      </div>

      <div className="card stack">
        <div className="field">
          <label className="label">Full Name *</label>
          <input 
            className="input" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="field">
          <label className="label">Email (optional)</label>
          <input 
            className="input" 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="your.email@example.com"
          />
        </div>
        
        <div className="field">
          <label className="label">Phone Number *</label>
          <input 
            className="input" 
            type="tel"
            placeholder="+91917..." 
            value={phone} 
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
            required
          />
        </div>
        
        <div className="field">
          <label className="label">Password *</label>
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Create a password"
            required
            minLength={6}
          />
        </div>
        
        <div className="field">
          <label className="label">Confirm Password *</label>
          <input 
            className="input" 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <div className="row">
          <div className="field" style={{minWidth: 180}}>
            <label className="label">Gender *</label>
            <select 
              className="select" 
              value={gender} 
              onChange={e => setGender(e.target.value)}
              required
            >
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="field" style={{minWidth: 200}}>
            <label className="label">Date of Birth *</label>
            <input 
              className="input" 
              type="date" 
              value={dob} 
              onChange={e => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="field" style={{minWidth: 220, flex: 1}}>
            <label className="label">Place *</label>
            <input 
              className="input" 
              value={place} 
              onChange={e => setPlace(e.target.value)} 
              placeholder="Enter your city/town"
              required
            />
          </div>
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
              onClick={() => signupResendOtp(phone.trim())} 
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
              placeholder="Enter 6-digit OTP"
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
              required
            />
          </div>
        )}
        
        <div className="field" style={{ marginTop: "1rem" }}>
          <label className="row" style={{ alignItems: "center", gap: "0.5rem" }}>
            <input 
              type="checkbox" 
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              required
            />
            <span>I agree to the terms and conditions</span>
          </label>
        </div>
        
        <div className="row">
          <button 
            className="btn btn-primary" 
            onClick={verify} 
            disabled={!canSubmit}
          >
            Create Account
          </button>
          
          {msg && <span className="chip">{msg}</span>}
        </div>
        
        <div className="muted">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
