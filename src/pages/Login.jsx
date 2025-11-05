import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sendLoginOtp, verifyLoginOtp, resendLoginOtp, apiError } from "../lib/api";
import { saveToken } from "../lib/auth";
import { loadTranslations } from "../i18n";

export default function Login(){
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const nav = useNavigate();
  
  // Get language from URL or fallback to i18n default
  const urlLang = searchParams.get("lang");
  const currentLang = urlLang || i18n.language || "en";
  
  // Load initial translations
  useEffect(() => {
    const loadInitial = async () => {
      try {
        await loadTranslations(currentLang);
        setTranslationsLoaded(true);
      } catch (error) {
        console.error("Failed to load translations:", error);
        setTranslationsLoaded(true); // Show UI anyway
      }
    };
    loadInitial();
  }, []);
  
  // Sync i18n language with URL on mount and when URL changes
  useEffect(() => {
    if (urlLang && urlLang !== i18n.language && translationsLoaded) {
      loadTranslations(urlLang);
    } else if (!urlLang && i18n.language !== "en" && translationsLoaded) {
      // Set URL to match current i18n language
      setSearchParams({ lang: i18n.language });
    }
  }, [urlLang, i18n, setSearchParams, translationsLoaded]);
  
  const changeLanguage = async (lng) => {
    setSearchParams({ lang: lng });
    // Load translations from backend
    await loadTranslations(lng);
  };

  const requestOtp = async () => {
    setBusy(true); setMsg("");
    try { 
      const response = await sendLoginOtp(phone.trim(), currentLang);
      setSent(true); 
      // Show message from backend response
      setMsg(response.message || t("auth.login.otp_sent")); 
    }
    catch(e){ setMsg(apiError(e)); }
    finally{ setBusy(false); }
  };

  const verify = async () => {
    setBusy(true); setMsg("");
    try{
      const token = await verifyLoginOtp(phone.trim(), otp.trim(), currentLang);
      saveToken(token);
      nav("/profile");
    }catch(e){ setMsg(apiError(e)); }
    finally{ setBusy(false); }
  };

  if (!translationsLoaded) {
    return (
      <div className="container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 className="section-title">{t("ui.login.title")}</h1>
        <div className="field" style={{ margin: 0, minWidth: "150px" }}>
          <label className="label" style={{ marginBottom: "0.25rem" }}>{t("ui.login.select_language")}</label>
          <select 
            className="input" 
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
          <label className="label">{t("ui.login.phone_label")}</label>
          <input className="input" placeholder={t("ui.login.phone_placeholder")} value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={requestOtp} disabled={!phone || busy}>{t("ui.login.request_otp")}</button>
          {sent && <button className="btn" onClick={()=>resendLoginOtp(phone.trim(), currentLang)} disabled={busy}>{t("ui.login.resend")}</button>}
        </div>
        <div className="field">
          <label className="label">{t("ui.login.enter_otp")}</label>
          <input className="input" value={otp} onChange={e=>setOtp(e.target.value)} />
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={verify} disabled={!otp || !phone || busy}>{t("ui.login.verify_login")}</button>
          {msg && <span className="chip">{String(msg)}</span>}
        </div>
        <div className="muted">{t("ui.login.new_here")} <Link to={`/signup${currentLang !== "en" ? `?lang=${currentLang}` : ""}`}>{t("ui.login.create_account")}</Link></div>
      </div>
    </div>
  );
}
