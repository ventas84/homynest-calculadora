import { useState, useEffect, useRef, useMemo } from "react";
import { P, font, fmtNum, PRESETS } from "../data/constants";
import { COMUNAS } from "../data/comunas";

export function MoneyInput({ label, value, onChange, suffix, note }) {
  const [raw, setRaw] = useState(fmtNum(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setRaw(fmtNum(value));
  }, [value, focused]);
  const handleChange = (e) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, "");
    setRaw(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) onChange(num);
    else if (cleaned === "") onChange(0);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: P.textMuted, marginBottom: 5, fontFamily: font }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, color: P.textDim, fontFamily: font }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={focused ? raw : fmtNum(value)}
          onChange={handleChange}
          onFocus={(e) => { setFocused(true); setRaw(String(value)); e.target.select(); }}
          onBlur={() => { setFocused(false); setRaw(fmtNum(value)); }}
          style={{
            flex: 1, padding: "10px 12px", fontSize: 15, fontFamily: font, fontWeight: 600,
            color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
            outline: "none", width: "100%", boxSizing: "border-box", textAlign: "right",
          }}
        />
        {suffix && <span style={{ fontSize: 12, color: P.textDim, fontFamily: font, whiteSpace: "nowrap", maxWidth: 120 }}>{suffix}</span>}
      </div>
      {note && <span style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 3, display: "block" }}>{note}</span>}
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, note }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: P.textMuted, marginBottom: 5, fontFamily: font }}>{label}</label>}
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: font, fontWeight: 500,
          color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
          outline: "none", boxSizing: "border-box",
        }}
      />
      {note && <span style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 3, display: "block" }}>{note}</span>}
    </div>
  );
}

export function NumInput({ label, value, onChange, suffix, min = 0, max, step = 1, note }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: P.textMuted, marginBottom: 5, fontFamily: font }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1, padding: "10px 12px", fontSize: 15, fontFamily: font, fontWeight: 600,
            color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
            outline: "none", width: "100%", boxSizing: "border-box",
          }}
        />
        {suffix && <span style={{ fontSize: 12, color: P.textDim, fontFamily: font, whiteSpace: "nowrap", maxWidth: 140 }}>{suffix}</span>}
      </div>
      {note && <span style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 3, display: "block" }}>{note}</span>}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 0", cursor: "pointer", borderBottom: `1px solid ${P.border}`,
      }}
    >
      <span style={{ fontSize: 14, color: P.text, fontFamily: font, flex: 1, marginRight: 12 }}>{label}</span>
      <div style={{ width: 42, height: 24, borderRadius: 12, background: checked ? P.accent : P.cardAlt, position: "relative", flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: checked ? P.bg : P.textDim, position: "absolute", top: 3, left: checked ? 21 : 3, transition: "left .2s" }} />
      </div>
    </div>
  );
}

export function Line({ label, value, bold, accent, warn: isWarn, dim, big }) {
  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL");
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0" }}>
      <span style={{ fontSize: big ? 15 : 13, color: dim ? P.textDim : bold ? P.text : P.textMuted, fontWeight: bold ? 600 : 400, fontFamily: font }}>{label}</span>
      <span
        style={{
          fontSize: big ? 20 : bold ? 16 : 14, fontWeight: big || bold ? 700 : 500, fontFamily: font,
          color: accent ? P.accent : isWarn ? P.warn : dim ? P.textDim : P.text, letterSpacing: "-0.02em", whiteSpace: "nowrap",
        }}
      >
        {typeof value === "number" ? fmt(value) : value}
      </span>
    </div>
  );
}

export function Section({ title, children, borderColor }) {
  return (
    <div style={{ background: P.card, borderRadius: 12, padding: "16px 18px", marginBottom: 14, border: `1px solid ${borderColor || P.border}` }}>
      {title && (
        <h3 style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: borderColor || P.accent, fontFamily: font }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function SubHead({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: P.textDim, fontFamily: font, marginTop: 6, marginBottom: 8 }}>
      {children}
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: P.border, margin: "6px 0" }} />;
}

export function Tabs({ active, onChange, items }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: P.card, borderRadius: 10, padding: 4 }}>
      {items.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1, padding: "10px 4px", fontSize: 12, fontWeight: active === t.key ? 700 : 500, fontFamily: font,
            color: active === t.key ? P.bg : P.textMuted, background: active === t.key ? P.accent : "transparent",
            border: "none", borderRadius: 8, cursor: "pointer",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function PresetChips({ active, onSelect }) {
  return (
    <Section title="Modelo preseteado">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PRESETS.map((p) => {
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                padding: "10px 12px", background: isActive ? P.accent : P.cardAlt,
                color: isActive ? P.bg : P.text, border: `1px solid ${isActive ? P.accent : P.border}`,
                borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all .15s",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>{p.label}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{p.sub}</div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

export function ComunaSearch({ selected, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = useMemo(() => {
    if (!query.trim()) return COMUNAS.slice(0, 15);
    const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return COMUNAS.filter((c) =>
      c.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q)
    ).slice(0, 20);
  }, [query]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: P.textMuted, marginBottom: 5, fontFamily: font }}>Comuna de destino</label>
      <input
        type="text"
        placeholder="Buscar comuna..."
        value={open ? query : selected ? selected.nombre : query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        style={{
          width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: font, fontWeight: 500,
          color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
          outline: "none", boxSizing: "border-box",
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, maxHeight: 220, overflowY: "auto",
            background: P.card, border: `1px solid ${P.border}`, borderRadius: 8, marginTop: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,.5)",
          }}
        >
          {filtered.map((c) => (
            <div
              key={c.nombre}
              onClick={() => { onSelect(c); setQuery(c.nombre); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${P.border}`,
                fontSize: 13, fontFamily: font, color: P.text, display: "flex", justifyContent: "space-between",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = P.cardAlt)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>{c.nombre}</span>
              <span style={{ color: P.textDim, fontSize: 12 }}>{fmtNum(c.km)} km · {c.region}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HomyNestLogo({ color = "#FFFFFF", size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M6 34 L6 18 L21 8 L36 18 L36 34 Z" />
      <path d="M6 18 L21 26 L36 18" />
      <path d="M21 26 L21 34" />
    </svg>
  );
}

export function SaveQuoteModal({ open, onClose, onSave, saving }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  if (!open) return null;
  const canSave = name.trim().length > 0;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 100,
        display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: P.bg, borderRadius: "16px 16px 0 0", padding: "24px 20px", width: "100%", maxWidth: 480,
          maxHeight: "92vh", overflow: "auto", border: `1px solid ${P.border}`,
        }}
      >
        <div style={{ width: 36, height: 4, background: P.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, color: P.text, fontFamily: font, margin: "0 0 4px" }}>Nueva cotización</h2>
        <p style={{ fontSize: 12, color: P.textDim, fontFamily: font, marginBottom: 20 }}>Guarda esta configuración para el cliente</p>
        <TextInput label="Nombre del cliente" value={name} onChange={setName} placeholder="Ej: Juan Pérez" />
        <TextInput label="Teléfono / WhatsApp (opcional)" value={phone} onChange={setPhone} placeholder="+56 9 ..." />
        <TextInput label="Email (opcional)" value={email} onChange={setEmail} placeholder="cliente@ejemplo.cl" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: P.textMuted, marginBottom: 5, fontFamily: font }}>Notas (opcional)</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Detalles del proyecto, plazos, requisitos..."
            style={{
              width: "100%", padding: "10px 12px", fontSize: 13, fontFamily: font,
              color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
              outline: "none", boxSizing: "border-box", resize: "vertical",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 18px", background: P.cardAlt, color: P.text, border: `1px solid ${P.cardAlt}`,
              borderRadius: 8, cursor: "pointer", fontFamily: font, fontSize: 14, fontWeight: 700,
            }}
          >
            Cancelar
          </button>
          <div style={{ flex: 1 }}>
            <button
              disabled={!canSave || saving}
              onClick={() => onSave({ name, phone, email, notes })}
              style={{
                width: "100%", padding: "12px 18px",
                background: !canSave || saving ? P.cardAlt : P.accent,
                color: !canSave || saving ? P.textDim : P.bg,
                border: "none", borderRadius: 8, fontFamily: font,
                fontSize: 14, fontWeight: 700, cursor: !canSave || saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Guardar cotización"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
