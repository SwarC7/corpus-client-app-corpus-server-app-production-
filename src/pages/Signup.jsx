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

  if (!translationsLoaded) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading translations...</p>
        </div>
      </div>
    );
  }

  const genderOptions = [
    { value: "male", label: t("ui.signup.gender_options.male") },
    { value: "female", label: t("ui.signup.gender_options.female") },
    { value: "other", label: t("ui.signup.gender_options.other") }
  ];

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 className="section-title">{t("ui.signup.title")}</h1>
        <div className="field" style={{ margin: 0, minWidth: "150px" }}>
          <label className="label" style={{ marginBottom: "0.25rem" }}>{t("ui.login.select_language")}</label>
          <select
            className="select"
            value={currentLang}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ padding: "0.5rem" }}
          >
            <option value="en">{t("ui.common.english")}</option>
            <option value="hi">{t("ui.common.hindi")}</option>
          </select>
        </div>
      </div>

      <div className="card stack">
        <div className="field">
          <label className="label">{t("ui.signup.full_name")}</label>
          <input 
            className="input" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder={t("ui.signup.full_name")}
          />
        </div>
        
        <div className="field">
          <label className="label">{t("ui.signup.email_optional")}</label>
          <input 
            className="input" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder={t("ui.signup.email_optional")}
          />
        </div>
        
        <div className="field">
          <label className="label">{t("ui.signup.phone_number")}</label>
          <input 
            className="input" 
            placeholder="+91917..." 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
        </div>
        
        <div className="field">
          <label className="label">{t("ui.signup.password")}</label>
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder={t("ui.signup.password")}
          />
        </div>
        
        <div className="field">
          <label className="label">{t("ui.signup.confirm_password")}</label>
          <input 
            className="input" 
            type="password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            placeholder={t("ui.signup.confirm_password")}
          />
        </div>
        
        <div className="row">
          <div className="field" style={{minWidth: 180}}>
            <label className="label">{t("ui.signup.gender")}</label>
            <select 
              className="select" 
              value={gender} 
              onChange={e => setGender(e.target.value)}
            >
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="field" style={{minWidth: 200}}>
            <label className="label">{t("ui.signup.date_of_birth")}</label>
            <input 
              className="input" 
              type="date" 
              value={dob} 
              onChange={e => setDob(e.target.value)} 
            />
          </div>
          
          <div className="field" style={{minWidth: 220, flex: 1}}>
            <label className="label">{t("ui.signup.place")}</label>
            <input 
              className="input" 
              value={place} 
              onChange={e => setPlace(e.target.value)} 
              placeholder={t("ui.signup.place")}
            />
          </div>
        </div>
        
        <div className="row">
          <button 
            className="btn btn-primary" 
            onClick={requestOtp} 
            disabled={!phone || busy}
          >
            {t("ui.signup.request_otp")}
          </button>
          
          {sent && (
            <button 
              className="btn" 
              onClick={() => {
                signupResendOtp(phone.trim(), currentLang);
                setMsg(t("auth.signup.otp_resent"));
              }} 
              disabled={busy}
            >
              {t("ui.signup.resend_otp")}
            </button>
          )}
        </div>
        
        <div className="field">
          <label className="label">{t("ui.signup.enter_otp")}</label>
          <input 
            className="input" 
            value={otp} 
            onChange={e => setOtp(e.target.value)} 
            placeholder={t("ui.signup.enter_otp")}
          />
        </div>
        
        <label className="row" style={{cursor: 'pointer'}}>
          <input 
            type="checkbox" 
            checked={consent} 
            onChange={e => setConsent(e.target.checked)} 
          />
          <span className="muted">{t("ui.signup.consent_text")}</span>
        </label>
        
        <div className="row">
          <button 
            className="btn btn-primary" 
            onClick={verify} 
            disabled={!canSubmit}
          >
            {t("ui.signup.verify_create_account")}
          </button>
          
          {msg && <span className="chip">{String(msg)}</span>}
        </div>
        
        <div className="muted">
          {t("ui.signup.already_have_account")}{" "}
          <Link to={`/login${currentLang !== "en" ? `?lang=${currentLang}` : ""}`}>
            {t("ui.signup.login_here")}
          </Link>
        </div>
      </div>
    </div>
  );
}
