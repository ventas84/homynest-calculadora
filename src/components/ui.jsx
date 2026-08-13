import { useState, useEffect, useRef, useMemo } from "react";
import { P, font, fontHeading, fmtNum, PRESETS } from "../data/constants";
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
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, color: P.primaryDark, marginBottom: 6, fontFamily: font, fontWeight: 600 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, color: P.textMuted, fontFamily: font, fontWeight: 600 }}>$</span>
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
            boxShadow: "inset 0 1px 2px rgba(15,23,42,.05)", transition: "border-color .15s",
          }}
        />
        {suffix && <span style={{ fontSize: 12, color: P.textMuted, fontFamily: font, whiteSpace: "nowrap", maxWidth: 120 }}>{suffix}</span>}
      </div>
      {note && <span style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 4, display: "block" }}>{note}</span>}
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, note }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: P.primaryDark, marginBottom: 6, fontFamily: font, fontWeight: 600 }}>{label}</label>}
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: font, fontWeight: 500,
          color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
          outline: "none", boxSizing: "border-box",
          boxShadow: "inset 0 1px 2px rgba(15,23,42,.05)", transition: "border-color .15s",
        }}
      />
      {note && <span style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 4, display: "block" }}>{note}</span>}
    </div>
  );
}

export function NumInput({ label, value, onChange, suffix, min = 0, max, step = 1, note }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, color: P.primaryDark, marginBottom: 6, fontFamily: font, fontWeight: 600 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1, padding: "10px 12px", fontSize: 15, fontFamily: font, fontWeight: 600,
            color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
            outline: "none", width: "100%", boxSizing: "border-box",
            boxShadow: "inset 0 1px 2px rgba(15,23,42,.05)", transition: "border-color .15s",
          }}
        />
        {suffix && <span style={{ fontSize: 12, color: P.textMuted, fontFamily: font, whiteSpace: "nowrap", maxWidth: 140 }}>{suffix}</span>}
      </div>
      {note && <span style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 4, display: "block" }}>{note}</span>}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 0", cursor: "pointer", borderBottom: `1px solid ${P.border}`,
      }}
    >
      <span style={{ fontSize: 14, color: P.text, fontFamily: font, flex: 1, marginRight: 12, fontWeight: 500 }}>{label}</span>
      <div style={{
        width: 44, height: 24, borderRadius: 12, position: "relative", flexShrink: 0, transition: "background .2s",
        background: checked ? P.accent : P.border,
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#FFFFFF", position: "absolute", top: 3,
          left: checked ? 23 : 3, transition: "left .2s",
          boxShadow: "0 1px 3px rgba(74,63,53,.18)",
        }} />
      </div>
    </div>
  );
}

export function Line({ label, value, bold, accent, warn: isWarn, dim, big }) {
  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL");
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
      <span style={{ fontSize: big ? 15 : 13, color: dim ? P.textDim : bold ? P.text : P.textMuted, fontWeight: bold ? 600 : 400, fontFamily: font }}>{label}</span>
      <span
        style={{
          fontSize: big ? 22 : bold ? 16 : 14, fontWeight: big || bold ? 700 : 500, fontFamily: big ? fontHeading : font,
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
    <div style={{
      background: P.card, borderRadius: 12, padding: "18px 20px", marginBottom: 16,
      border: `1px solid ${P.border}`, boxShadow: P.shadow,
    }}>
      {title && (
        <h3 style={{
          margin: "0 0 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: borderColor || P.accent, fontFamily: fontHeading,
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function SubHead({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: P.textMuted, fontFamily: fontHeading, marginTop: 8, marginBottom: 8 }}>
      {children}
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: P.border, margin: "8px 0" }} />;
}

export function Tabs({ active, onChange, items }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, background: P.cardAlt, borderRadius: 10, padding: 4 }}>
      {items.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1, padding: "10px 4px", fontSize: 13, fontWeight: active === t.key ? 700 : 500, fontFamily: fontHeading,
            color: active === t.key ? "#FFFFFF" : P.textMuted, background: active === t.key ? P.accent : "transparent",
            border: "none", borderRadius: 8, cursor: "pointer", transition: "all .15s ease",
            boxShadow: active === t.key ? "0 2px 6px rgba(74,63,53,.18)" : "none",
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {PRESETS.map((p) => {
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                padding: "12px 14px",
                background: isActive ? P.accent : P.card,
                color: isActive ? "#FFFFFF" : P.text,
                border: `1.5px solid ${isActive ? P.accent : P.border}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: font,
                transition: "all .15s ease",
                boxShadow: isActive ? "0 3px 10px rgba(74,63,53,.15)" : P.shadow,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: fontHeading }}>{p.label}</div>
              <div style={{ fontSize: 12, color: isActive ? "rgba(255,255,255,.8)" : P.textMuted, marginTop: 3 }}>{p.sub}</div>
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
    <div ref={ref} style={{ position: "relative", marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, color: P.primaryDark, marginBottom: 6, fontFamily: font, fontWeight: 600 }}>Comuna de destino</label>
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
          boxShadow: "inset 0 1px 2px rgba(15,23,42,.05)", transition: "border-color .15s",
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, maxHeight: 240, overflowY: "auto",
            background: P.card, border: `1px solid ${P.border}`, borderRadius: 10, marginTop: 4,
            boxShadow: P.shadowLg,
          }}
        >
          {filtered.map((c) => (
            <div
              key={c.nombre}
              onClick={() => { onSelect(c); setQuery(c.nombre); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${P.border}`,
                fontSize: 13, fontFamily: font, color: P.text, display: "flex", justifyContent: "space-between",
                transition: "background .1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = P.cardAlt)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 500 }}>{c.nombre}</span>
              <span style={{ color: P.textMuted, fontSize: 12 }}>{fmtNum(c.km)} km · {c.region}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HomyNestLogo({ color = "#A67C52", size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1024 816" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M237.639,690C237.633,668.003,237.537,646.505,237.707,625.01C237.737,621.146,236.469,619.396,232.755,618.428C202.483,610.537,175.248,596.397,151.247,576.543C123.323,553.444,102.507,524.746,88.651,491.245C83.57,478.959,80.421,466.008,77.803,452.907C74.688,437.326,73.998,421.659,73.927,405.865C73.906,401.068,75.492,399.622,80.29,399.638C130.449,399.807,180.609,399.769,230.768,399.774C237.608,399.774,237.627,399.738,237.627,392.939C237.625,292.453,237.614,191.967,237.631,91.481C237.632,89.02,237.217,86.502,238.276,83.693C245.198,83.816,251.895,85.786,258.654,87.024C296.424,93.941,334.166,101.016,371.896,108.149C417.965,116.859,464.001,125.736,510.072,134.433C552.714,142.483,595.383,150.383,638.038,158.364C688.541,167.812,739.041,177.282,789.546,186.728C797.117,188.144,797.143,188.106,797.144,196.066C797.145,261.557,797.136,327.048,797.136,392.538C797.137,399.744,797.156,399.756,804.2,399.756C853.859,399.756,903.519,399.748,953.179,399.748C960.219,399.747,960.058,399.766,960.286,406.936C961.195,435.618,955.904,463.267,945.48,489.82C933.318,520.798,914.543,547.331,890.057,570.01C868.798,589.701,843.931,603.055,817.317,613.597C812.391,615.548,807.166,616.819,801.994,618.047C798.235,618.938,797.051,620.882,797.066,624.705C797.2,657.7,797.144,690.696,797.148,723.691C797.149,731.345,797.155,731.346,789.432,731.349C783.766,731.351,778.1,731.36,772.434,731.345C765.917,731.328,765.875,731.284,765.874,724.533C765.87,692.204,765.874,659.875,765.869,627.546C765.868,620.266,765.856,620.25,758.383,620.25C597.239,620.244,436.095,620.241,274.951,620.241C268.345,620.241,268.318,620.258,268.314,626.792C268.299,659.288,268.304,691.783,268.29,724.279C268.287,731.33,268.265,731.336,261.047,731.345C254.882,731.352,248.711,731.203,242.552,731.395C238.907,731.508,237.532,730.187,237.58,726.485C237.734,714.492,237.639,702.495,237.639,690ZM747.499,399.764C751.832,399.761,756.179,399.543,760.494,399.816C764.646,400.079,765.941,398.5,765.934,394.376C765.83,335.877,765.825,277.377,765.945,218.878C765.953,214.854,764.369,213.243,760.717,212.565C731.783,207.192,702.862,201.746,673.937,196.329C638.306,189.655,602.668,183.016,567.044,176.307C533.548,169.998,500.069,163.597,466.575,157.275C430.146,150.398,393.707,143.577,357.276,136.709C330.313,131.626,303.38,126.372,276.382,121.483C268.449,120.047,268.303,118.105,268.304,128.281C268.31,216.447,268.31,304.613,268.313,392.779C268.314,399.777,268.319,399.781,275.503,399.781C432.502,399.775,589.501,399.769,747.499,399.764ZM765.883,560.5C765.891,519.502,765.906,478.504,765.899,437.506C765.898,431.212,765.609,430.928,759.511,430.928C598.018,430.917,436.525,430.913,275.032,430.915C268.323,430.915,268.292,430.953,268.292,437.531C268.292,486.362,268.3,535.193,268.338,584.025C268.339,585.621,267.809,587.371,269.422,589.118C270.622,589.118,272.104,589.117,273.585,589.118C349.572,589.121,425.559,589.127,501.546,589.128C571.043,589.128,640.54,589.127,710.037,589.118C726.203,589.116,742.368,589.086,758.534,589.057C765.847,589.045,765.857,589.032,765.874,581.499C765.89,574.833,765.88,568.166,765.883,560.5ZM237.633,522.5C237.634,495.844,237.638,469.187,237.634,442.531C237.632,430.895,237.625,430.915,226.298,430.916C188.479,430.921,150.66,430.897,112.841,430.934C110.603,430.937,108.179,430.281,105.833,432.208C110.402,472.588,126.282,508.199,154.085,537.744C176.736,561.814,204.513,578.522,237.632,588.308C237.632,565.982,237.632,544.741,237.633,522.5ZM797.13,566.5C797.13,573.394,797.13,580.288,797.13,586.567C799.205,587.702,800.154,587.263,801.087,586.958C835.099,575.825,864.238,557.029,887.206,529.642C909.486,503.074,922.941,472.193,927.803,437.721C928.76,430.943,928.791,430.929,921.739,430.927C882.605,430.919,843.472,430.919,804.339,430.921C797.133,430.921,797.102,430.932,797.102,438.109C797.103,480.572,797.119,523.036,797.13,566.5Z"/>
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
        position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 100,
        display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: P.card, borderRadius: "16px 16px 0 0", padding: "24px 20px", width: "100%", maxWidth: 480,
          maxHeight: "92vh", overflow: "auto", boxShadow: P.shadowLg,
        }}
      >
        <div style={{ width: 36, height: 4, background: P.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: P.text, fontFamily: fontHeading, margin: "0 0 4px" }}>Nueva cotizacion</h2>
        <p style={{ fontSize: 13, color: P.textMuted, fontFamily: font, marginBottom: 20 }}>Guarda esta configuracion para el cliente</p>
        <TextInput label="Nombre del cliente" value={name} onChange={setName} placeholder="Ej: Juan Perez" />
        <TextInput label="Telefono / WhatsApp (opcional)" value={phone} onChange={setPhone} placeholder="+56 9 ..." />
        <TextInput label="Email (opcional)" value={email} onChange={setEmail} placeholder="cliente@ejemplo.cl" />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: P.primaryDark, marginBottom: 6, fontFamily: font, fontWeight: 600 }}>Notas (opcional)</label>
          <textarea
            value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Detalles del proyecto, plazos, requisitos..."
            style={{
              width: "100%", padding: "10px 12px", fontSize: 13, fontFamily: font,
              color: P.text, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 8,
              outline: "none", boxSizing: "border-box", resize: "vertical",
              boxShadow: "inset 0 1px 2px rgba(15,23,42,.05)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 18px", background: P.cardAlt, color: P.primaryDark,
              border: `1px solid ${P.border}`, borderRadius: 8, cursor: "pointer",
              fontFamily: font, fontSize: 14, fontWeight: 600, transition: "all .15s",
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
                color: !canSave || saving ? P.textDim : "#FFFFFF",
                border: "none", borderRadius: 8, fontFamily: font,
                fontSize: 14, fontWeight: 700, cursor: !canSave || saving ? "not-allowed" : "pointer",
                boxShadow: canSave && !saving ? "0 2px 8px rgba(74,63,53,.18)" : "none",
                transition: "all .15s ease",
              }}
            >
              {saving ? "Guardando..." : "Guardar cotizacion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
