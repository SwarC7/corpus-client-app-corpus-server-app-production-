import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupSendOtp, signupVerifyOtp, signupResendOtp, apiError } from "../lib/api";
import { saveToken } from "../lib/auth";

export default function Signup(){
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

  const requestOtp = async () => {
    setBusy(true); setMsg("");
    try { await signupSendOtp(phone.trim()); setSent(true); setMsg("OTP sent!"); }
    catch(err){ setMsg(apiError(err)); }
    finally{ setBusy(false); }
  };

  const verify = async () => {
    setBusy(true); setMsg("");
    try{
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
        has_given_consent: consent
      });
      saveToken(token);
      nav("/profile");
    }catch(err){ setMsg(apiError(err)); }
    finally{ setBusy(false); }
  };

  const canSubmit =
    phone && otp && name && password && confirmPassword &&
    gender && dob && place && consent && !busy;

  return (
    <div className="container">
      <h1 className="section-title">Sign Up</h1>
      <div className="card stack">
        <div className="field"><label className="label">Full name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="field"><label className="label">Email (optional)</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="field"><label className="label">Phone number</label><input className="input" placeholder="+91917..." value={phone} onChange={e=>setPhone(e.target.value)} /></div>
        <div className="field"><label className="label">Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <div className="field"><label className="label">Confirm Password</label><input className="input" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} /></div>
        <div className="row">
          <div className="field" style={{minWidth:180}}>
            <label className="label">Gender</label>
            <select className="select" value={gender} onChange={e=>setGender(e.target.value)}>
              {["male","female","other"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="field" style={{minWidth:200}}>
            <label className="label">Date of Birth</label>
            <input className="input" type="date" value={dob} onChange={e=>setDob(e.target.value)} />
          </div>
          <div className="field" style={{minWidth:220, flex:1}}>
            <label className="label">Place</label>
            <input className="input" value={place} onChange={e=>setPlace(e.target.value)} />
          </div>
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={requestOtp} disabled={!phone || busy}>Request OTP</button>
          {sent && <button className="btn" onClick={()=>signupResendOtp(phone.trim())} disabled={busy}>Resend</button>}
        </div>
        <div className="field"><label className="label">Enter OTP</label><input className="input" value={otp} onChange={e=>setOtp(e.target.value)} /></div>
        <label className="row" style={{cursor:'pointer'}}>
          <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
          <span className="muted">I give consent to process my data for this project.</span>
        </label>
        <div className="row">
          <button className="btn btn-primary" onClick={verify} disabled={!canSubmit}>Verify & Create Account</button>
          {msg && <span className="chip">{String(msg)}</span>}
        </div>
        <div className="muted">Already have an account? <Link to="/login">Log in</Link></div>
      </div>
    </div>
  );
}
