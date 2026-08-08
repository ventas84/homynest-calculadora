import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EXTRAS, DEFAULT_TERMS, DEFAULT_HEADER_TEXT, DEFAULT_VALIDEZ,
  C, B, P, font, fontHeading, fmt, fmtNum, fmtDate,
} from "../data/constants";
import { HomyNestLogo } from "../components/ui";
import { storage } from "../lib/storage";

function escapeHTML(str) {
  if (typeof str !== "string") return String(str);
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function boldHeaderHTML(text) {
  let s = escapeHTML(text);
  s = s.replace(/(&quot;llave en mano&quot;|"llave en mano")/gi, '<strong>"llave en mano"</strong>');
  s = s.replace(/(\d+[,,]\d+\s*UF)/gi, "<strong>$1</strong>");
  return s;
}

function BoldHeaderText({ text }) {
  const parts = [];
  let rest = text;
  const patterns = [
    { re: /"llave en mano"/i, bold: true },
    { re: /\d+[,]\d+\s*UF/i, bold: true },
  ];
  let key = 0;
  while (rest.length > 0) {
    let earliest = null;
    let earliestIdx = rest.length;
    let matchStr = "";
    for (const p of patterns) {
      const m = rest.match(p.re);
      if (m && m.index < earliestIdx) {
        earliest = p;
        earliestIdx = m.index;
        matchStr = m[0];
      }
    }
    if (!earliest) { parts.push(rest); break; }
    if (earliestIdx > 0) parts.push(rest.slice(0, earliestIdx));
    parts.push(<strong key={key++}>{matchStr}</strong>);
    rest = rest.slice(earliestIdx + matchStr.length);
  }
  return <>{parts}</>;
}

function projectInfo(quote) {
  const items = quote.items || {};
  const isCasa = quote.quoteType === "casa" && quote.casa;
  const totalMod = quote.totalModulos || 1;
  const mt2 = quote.mt2 || 0;

  if (isCasa) {
    return {
      isCasa: true,
      title: `CASA DE ${mt2} METROS CUADRADOS`,
      dims: quote.casa.dims,
      prog: quote.casa.prog,
      precioTabla: Math.max(mt2 * C.casaUf * C.uf, quote.totals.precio),
    };
  }

  const n3x6 = (items.m3x6bc || 0) + (items.m3x6b || 0) + (items.m3x6v || 0);
  const n35x7 = (items.m35x7b || 0) + (items.m35x7v || 0);
  let dims;
  if (n3x6 > 0 && n35x7 === 0) {
    const len = n3x6 * 6 + (items.incl150 ? 1.5 : 0);
    dims = `3 x ${len % 1 === 0 ? len : String(len).replace(".", ",")} mt`;
  } else if (n35x7 > 0 && n3x6 === 0) {
    const len = n35x7 * 7;
    dims = `3,5 x ${len} mt`;
  } else {
    dims = `${mt2} m²`;
  }

  const banos = items.banos || 0;
  const prog = `${totalMod > 1 ? totalMod : 1} dormitorio${totalMod > 1 ? "s" : ""}, ${banos} baño${banos !== 1 ? "s" : ""}, living-comedor-cocina`;
  const dimsUp = dims.replace(/ x /i, "X").toUpperCase();
  const title = `${totalMod} MÓDULO${totalMod > 1 ? "S" : ""}, ${mt2} METROS CUADRADOS (${dimsUp})`;
  const precioTabla = Math.max(mt2 * C.modUf * C.uf, quote.totals.precio);

  return { isCasa: false, title, dims, prog, precioTabla };
}

function buildStandaloneHTML(quote) {
  const t = quote.totals;
  const info = projectInfo(quote);

  const termsHTML = quote.terms.map((term) => `<li>${escapeHTML(term)}</li>`).join("");

  const extrasActive = quote.extras ? Object.entries(quote.extras) : [];
  const extrasTotal = extrasActive.reduce((s, [, v]) => s + v.qty * v.price, 0);
  const extrasHTML = extrasActive.length > 0
    ? `<div class="extras-box">
        <div class="section-title">TERRAZA Y OTROS (COTIZACIÓN APARTE)</div>
        ${extrasActive.map(([id, v]) => {
          const def = EXTRAS.find((e) => e.id === id);
          return def ? `<div class="extras-row"><span>${escapeHTML(def.label)} — ${v.qty} ${escapeHTML(def.unit)}</span><span class="extras-price">${fmt(v.qty * v.price)} + IVA</span></div>` : "";
        }).join("")}
        <div class="extras-total"><span>Total terraza y otros</span><span>${fmt(extrasTotal)} + IVA</span></div>
        <div class="note">* Estos ítems se cotizan por separado del presupuesto principal.</div>
      </div>`
    : "";

  const logHTML = quote.comuna
    ? `<div class="logistics-box">
        <div class="section-title">LOGÍSTICA — ${escapeHTML(quote.comuna.nombre)}, ${escapeHTML(quote.comuna.region)}</div>
        <div class="log-row"><span>Distancia</span><span>${fmtNum(quote.comuna.km)} km</span></div>
        <div class="log-row"><span>Transporte</span><span>${fmt(quote.comuna.transporte)}</span></div>
        <div class="log-row"><span>Izaje</span><span>${fmt(quote.comuna.izaje)}</span></div>
        <div class="log-divider"></div>
        <div class="log-row total"><span>Total logística</span><span>${fmt(t.totalLog)}</span></div>
        <div class="note">* Valor de logística cotizado aparte, no incluido en el precio oferta.</div>
      </div>`
    : "";

  const notesHTML = quote.client.notes
    ? `<div class="notes-box"><div class="section-title">NOTAS DEL PROYECTO</div><div>${escapeHTML(quote.client.notes).replace(/\n/g, "<br>")}</div></div>`
    : "";

  const descLabel = info.isCasa ? "Casa" : "Módulo";

  return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cotización ${escapeHTML(quote.id)} — HomyNest</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',-apple-system,sans-serif;background:#F5F1E8;padding:24px 16px;color:#1A1A1A;line-height:1.4;min-height:100vh}
.container{max-width:820px;margin:0 auto;background:#fff;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1)}
.green-header{background:#2A4A47;color:#fff;padding:36px 44px 30px}
.brand-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.brand{display:flex;align-items:center;gap:14px;font-size:28px;font-weight:800;letter-spacing:-.02em}
.web{font-size:22px;font-weight:700}
.header-divider{height:1px;background:rgba(255,255,255,.2);margin:0 0 22px}
.header-cols{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;flex-wrap:wrap}
.header-text{flex:1 1 55%;min-width:0;font-size:13px;line-height:1.6}
.header-meta{text-align:right;font-size:13px;line-height:1.8}
.body{padding:48px 44px}
.project-row{margin-bottom:14px}
.project-label{font-size:12px;letter-spacing:.1em;color:#1A1A1A;font-weight:800}
.project-name{font-size:21px;font-weight:900;color:#1A1A1A;letter-spacing:-.01em}
.studio{font-size:14px;color:#444;line-height:1.7}
.table-sep{height:1px;background:#1A1A1A;margin:20px 0 24px}
.budget-table{margin-bottom:0}
.budget-table table{width:100%;border-collapse:collapse}
.budget-table th{padding:10px 8px;font-size:11px;letter-spacing:.1em;color:#1A1A1A;font-weight:800;text-transform:uppercase;border-bottom:2px solid #1A1A1A}
.th-desc{text-align:left}
.th-qty{text-align:center;width:100px}
.th-price{text-align:right;width:140px}
.budget-table td{padding:16px 8px}
.td-desc{line-height:1.6;color:#1A1A1A;font-size:14px}
.td-qty{text-align:center;color:#1A1A1A;font-size:14px}
.td-price{text-align:right;font-weight:400;color:#1A1A1A;font-size:14px;white-space:nowrap}
.price-section{text-align:center;margin:40px 0 40px;padding:0}
.price-line{height:3px;background:linear-gradient(90deg,#2A4A47 0%,#5AC57E 50%,#2A4A47 100%);margin-bottom:36px}
.price-text{font-size:28px;font-weight:900;color:#1A1A1A;letter-spacing:.02em;white-space:nowrap}
.price-text .neto{font-size:15px;font-weight:700;margin-left:4px;vertical-align:baseline}
.terms-sep{height:1px;background:#ccc;margin:0 0 24px}
.terms{margin-bottom:28px}
.terms-title{font-size:14px;font-weight:800;color:#1A1A1A;letter-spacing:.04em;margin-bottom:16px;text-decoration:underline}
.terms ul{padding-left:22px;list-style-type:disc}
.terms li{font-size:13px;line-height:1.7;margin-bottom:6px}
.section-title{font-size:11px;letter-spacing:.14em;color:#2A4A47;font-weight:800;text-transform:uppercase;margin-bottom:12px}
.extras-box{border:1.5px dashed #FBBF24;border-radius:12px;padding:18px 20px;background:#F5F1E8;margin-bottom:32px}
.extras-row{display:flex;justify-content:space-between;align-items:baseline;padding:7px 0;border-bottom:1px dashed #E5E5E5;font-size:13px}
.extras-price{font-weight:600;white-space:nowrap}
.extras-total{border-top:1px solid #E5E5E5;margin-top:12px;padding-top:10px;display:flex;justify-content:space-between;font-weight:700;font-size:14px}
.logistics-box{border:1.5px dashed #2A4A47;border-radius:12px;padding:18px 20px;background:#F5F1E8;margin-bottom:32px}
.log-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0}
.log-row.total{font-weight:700;font-size:14px}
.log-divider{height:1px;background:#E5E5E5;margin:8px 0}
.note{font-size:11px;color:#666;margin-top:12px;font-style:italic}
.notes-box{background:#F5F1E8;border-left:4px solid #2A4A47;padding:16px 18px;border-radius:8px;margin-bottom:28px;font-size:13px;line-height:1.6}
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:translateY(0)}
.green-header{-webkit-print-color-adjust:exact;print-color-adjust:exact}
@media print{body{background:#fff;padding:0}.container{box-shadow:none}.reveal{opacity:1!important;transform:none!important}}
@media(max-width:640px){body{padding:0}.body{padding:32px 20px}.green-header{padding:26px 20px 22px}.price-text{font-size:22px}.project-name{font-size:18px}}
</style></head>
<body>
<div class="container">
  <div class="green-header">
    <div class="brand-row">
      <div class="brand">
        <svg width="48" height="48" viewBox="0 0 42 42" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
          <path d="M6 34 L6 18 L21 8 L36 18 L36 34 Z"/><path d="M6 18 L21 26 L36 18"/><path d="M21 26 L21 34"/>
        </svg>
        <span>HomyNest</span>
      </div>
      <div class="web">www.homynest.cl</div>
    </div>
    <div class="header-divider"></div>
    <div class="header-cols">
      <div class="header-text">${boldHeaderHTML(quote.headerText)}</div>
      <div class="header-meta">
        <div><strong><em>Fecha:</em></strong> ${escapeHTML(fmtDate(quote.createdAt))}</div>
        <div><strong><em>Validez:</em></strong> ${escapeHTML(quote.validez)}</div>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="project reveal">
      <div class="project-row">
        <span class="project-label">PROYECTO:</span>
        <span class="project-name">${escapeHTML(info.title)}</span>
      </div>
      <div class="studio">Homy Nest Studio</div>
      <div class="studio">Cristóbal Letelier G</div>
      <div class="studio">Patente 3-4240</div>
    </div>
    <div class="table-sep"></div>
    <div class="budget-table reveal">
      <table>
        <thead><tr><th class="th-desc">DESCRIPCIÓN</th><th class="th-qty">CANTIDAD</th><th class="th-price">PRECIO NETO</th></tr></thead>
        <tbody><tr>
          <td class="td-desc">${descLabel} de <strong>${quote.mt2} metros cuadrados</strong> (${escapeHTML(info.dims)})<br>(${escapeHTML(info.prog)})</td>
          <td class="td-qty">1</td>
          <td class="td-price">${fmt(info.precioTabla)}</td>
        </tr></tbody>
      </table>
    </div>
    <div class="price-section reveal">
      <div class="price-line"></div>
      <div class="price-text">PRECIO OFERTA :&nbsp;&nbsp; ${fmt(t.precio)} <span class="neto">NETO</span></div>
    </div>
    <div class="terms-sep"></div>
    <div class="terms reveal">
      <div class="terms-title">TÉRMINOS Y CONDICIONES</div>
      <ul>${termsHTML}</ul>
    </div>
    ${extrasHTML}
    ${logHTML}
    ${notesHTML}
  </div>
</div>
<script>
const io=new IntersectionObserver(e=>{e.forEach(el=>{if(el.isIntersecting){el.target.classList.add('in');io.unobserve(el.target)}})},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
setTimeout(()=>{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'))},800);
</script>
</body></html>`;
}

export default function QuoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editingTerms, setEditingTerms] = useState(false);
  const [tempTerms, setTempTerms] = useState([]);
  const [editingHeader, setEditingHeader] = useState(false);
  const [tempHeader, setTempHeader] = useState("");
  const [tempValidez, setTempValidez] = useState("");

  useEffect(() => {
    const q = storage.get(id);
    if (q) {
      if (!q.terms) q.terms = [...DEFAULT_TERMS];
      if (!q.headerText) q.headerText = DEFAULT_HEADER_TEXT;
      if (!q.validez) q.validez = DEFAULT_VALIDEZ;
      setQuote(q);
      setTempTerms([...q.terms]);
      setTempHeader(q.headerText);
      setTempValidez(q.validez);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!quote) return;
    const els = document.querySelectorAll(".reveal");
    let io;
    try {
      io = new IntersectionObserver(
        (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("reveal-in"); io.unobserve(e.target); } }); },
        { threshold: 0.1 }
      );
      els.forEach((el) => io.observe(el));
    } catch {}
    const fallback = setTimeout(() => { els.forEach((el) => el.classList.add("reveal-in")); }, 600);
    return () => { clearTimeout(fallback); io?.disconnect(); };
  }, [quote]);

  const saveEdits = (updates) => {
    if (!quote) return;
    const updated = { ...quote, ...updates };
    storage.save(updated);
    setQuote(updated);
  };

  const saveTerms = () => { saveEdits({ terms: tempTerms }); setEditingTerms(false); };
  const cancelTerms = () => { setTempTerms([...quote.terms]); setEditingTerms(false); };
  const saveHeader = () => { saveEdits({ headerText: tempHeader, validez: tempValidez }); setEditingHeader(false); };
  const cancelHeader = () => { setTempHeader(quote.headerText); setTempValidez(quote.validez); setEditingHeader(false); };

  if (loading) return <div style={{ color: P.textDim, textAlign: "center", padding: 40, fontFamily: font }}>Cargando cotización...</div>;
  if (!quote) return (
    <div style={{ textAlign: "center", padding: 40, fontFamily: font }}>
      <div style={{ color: P.warn, marginBottom: 16 }}>No se encontró esta cotización</div>
      <button onClick={() => navigate("/")} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text, padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontFamily: font }}>Volver</button>
    </div>
  );

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/cotizacion/${quote.id}` : "";

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { prompt("Copia el link manualmente:", shareUrl); }
  };

  const shareWA = () => {
    const total = fmt(quote.totals.precio);
    const logLine = quote.comuna ? `\n🚚 *Logística ${quote.comuna.nombre}:* ${fmt(quote.totals.totalLog)} (aparte)` : "";
    const msg = `*Cotización HomyNest N° ${quote.id}*\n\nHola ${quote.client.name},\n\nAdjunto tu cotización:\n\n📐 *Modelo:* ${quote.modelName}\n📏 *Superficie:* ${quote.mt2} m²\n💰 *Total:* ${total} + IVA${logLine}\n\nCualquier duda me avisas.\n\nSaludos,\n*Cristóbal Letelier*\nHomyNest`;
    const phone = quote.client.phone ? quote.client.phone.replace(/[^\d]/g, "") : "";
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const downloadHTML = () => {
    const html = buildStandaloneHTML(quote);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = quote.client.name.replace(/[^\w\s]/g, "").replace(/\s+/g, "-").toLowerCase() || "cliente";
    a.download = `cotizacion-${safeName}-${quote.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const t = quote.totals;
  const info = projectInfo(quote);
  const descLabel = info.isCasa ? "Casa" : "Módulo";

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .reveal { opacity:0; transform:translateY(24px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal-in { opacity:1; transform:translateY(0); }
        .edit-hover:hover { background: rgba(255,255,255,0.08) !important; }
        @media print { .no-print { display:none !important; } body, html { background:white !important; } .quote-doc { background:white !important; box-shadow:none !important; } .reveal { opacity:1 !important; transform:none !important; } }
      `}</style>

      <div className="no-print" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
          <button onClick={() => navigate("/")} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font }}>Calculadora</button>
          <button onClick={() => navigate("/cotizaciones")} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font }}>Mis cotizaciones</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => window.print()} style={{ background: P.cardAlt, border: `1px solid ${P.border}`, color: P.text, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font, fontWeight: 600 }}>Imprimir</button>
        </div>

        <div style={{ background: P.card, padding: "10px 14px", borderRadius: 8, border: `1px solid ${P.border}`, marginBottom: 8, fontSize: 13, fontFamily: font }}>
          <span style={{ color: P.textMuted }}>Cliente:</span> <strong>{quote.client.name}</strong>
          {quote.client.phone && <span style={{ color: P.textMuted, marginLeft: 12 }}>{quote.client.phone}</span>}
          <span style={{ color: P.textDim, marginLeft: 12, fontSize: 11 }}>N° {quote.id}</span>
        </div>

        <button onClick={downloadHTML} style={{ width: "100%", background: P.accent, border: "none", color: "#FFFFFF", padding: "14px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: fontHeading, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em", boxShadow: "0 4px 16px rgba(234,88,12,.3)", transition: "all .15s ease" }}>
          Descargar pagina HTML (para enviar al cliente)
        </button>

        <button onClick={shareWA} style={{ width: "100%", background: "#25D366", border: "none", color: "#fff", padding: "12px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: font, fontWeight: 700, marginBottom: 10 }}>
          Enviar por WhatsApp{quote.client.phone ? ` — ${quote.client.phone}` : ""}
        </button>

        <div style={{ background: P.card, padding: "10px 12px", borderRadius: 8, border: `1px solid ${P.border}` }}>
          <div style={{ fontSize: 10, color: P.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontFamily: font }}>URL de esta cotización</div>
          <div style={{ display: "flex", gap: 6 }}>
            <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} onClick={(e) => e.target.select()} style={{ flex: 1, background: P.inputBg, border: `1px solid ${P.border}`, borderRadius: 6, padding: "8px 10px", color: P.text, fontSize: 12, fontFamily: font, outline: "none", minWidth: 0, boxSizing: "border-box" }} />
            <button onClick={copyLink} style={{ background: copied ? P.accent : P.cardAlt, color: copied ? "#FFFFFF" : P.primaryDark, border: `1px solid ${copied ? P.accent : P.border}`, padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 700, whiteSpace: "nowrap", transition: "all .15s" }}>
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ QUOTE DOCUMENT (replica PDF) ═══════════ */}
      <div className="quote-doc" style={{ background: "#fff", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.1)", fontFamily: font, color: "#1A1A1A" }}>

        {/* Green header */}
        <div style={{ background: B.darkGreen, padding: "36px 44px 30px", color: "#fff", animation: "fadeUp .6s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HomyNestLogo color="#fff" size={48} />
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>HomyNest</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>www.homynest.cl</div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "0 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 55%", minWidth: 0 }}>
              {editingHeader ? (
                <div>
                  <textarea value={tempHeader} onChange={(e) => setTempHeader(e.target.value)} rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: font, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  <div style={{ marginTop: 8, display: "flex", gap: 6 }} className="no-print">
                    <button onClick={saveHeader} style={{ background: B.green, color: B.ink, border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 700 }}>Guardar</button>
                    <button onClick={cancelHeader} style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: font }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditingHeader(true)} className="edit-hover" style={{ fontSize: 13, lineHeight: 1.6, cursor: "pointer", padding: "4px 6px", borderRadius: 4, marginLeft: -6, transition: "background .2s" }} title="Click para editar">
                  <BoldHeaderText text={quote.headerText} />
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", fontSize: 13, lineHeight: 1.8 }}>
              <div><strong><em>Fecha:</em></strong> {editingHeader ? <input value={tempValidez} onChange={() => {}} style={{ display: "none" }} /> : null}{fmtDate(quote.createdAt)}</div>
              <div><strong><em>Validez:</em></strong> {editingHeader ? <input value={tempValidez} onChange={(e) => setTempValidez(e.target.value)} style={{ width: 80, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 4, padding: "2px 6px", fontSize: 12, fontFamily: font, marginLeft: 4 }} /> : quote.validez}</div>
            </div>
          </div>
        </div>

        {/* Body — identical to PDF */}
        <div style={{ padding: "48px 44px" }}>

          {/* PROYECTO */}
          <div className="reveal" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 800 }}>PROYECTO: &nbsp;&nbsp;</span>
              <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.01em" }}>{info.title}</span>
            </div>
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.7 }}>
              Homy Nest Studio<br />
              Cristóbal Letelier G<br />
              Patente 3-4240
            </div>
          </div>

          {/* Horizontal line */}
          <div style={{ height: 1, background: "#1A1A1A", margin: "20px 0 24px" }} />

          {/* Table */}
          <div className="reveal">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1A1A1A" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 800 }}>DESCRIPCIÓN</th>
                  <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 800, width: 100 }}>CANTIDAD</th>
                  <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 800, width: 140 }}>PRECIO NETO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "16px 8px", fontSize: 14, lineHeight: 1.6 }}>
                    {descLabel} de <strong>{quote.mt2} metros cuadrados</strong> ({info.dims})<br />
                    ({info.prog})
                  </td>
                  <td style={{ padding: "16px 8px", textAlign: "center", fontSize: 14 }}>1</td>
                  <td style={{ padding: "16px 8px", textAlign: "right", fontSize: 14, whiteSpace: "nowrap" }}>{fmt(info.precioTabla)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Green gradient line + PRECIO OFERTA */}
          <div className="reveal" style={{ textAlign: "center", margin: "40px 0" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${B.darkGreen} 0%, ${B.green} 50%, ${B.darkGreen} 100%)`, marginBottom: 36 }} />
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
              PRECIO OFERTA :&nbsp;&nbsp; {fmt(t.precio)} <span style={{ fontSize: 15, fontWeight: 700, verticalAlign: "baseline" }}>NETO</span>
            </div>
          </div>

          {/* Horizontal line before terms */}
          <div style={{ height: 1, background: "#ccc", marginBottom: 24 }} />

          {/* Terms */}
          <div className="reveal" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.04em", textDecoration: "underline" }}>TÉRMINOS Y CONDICIONES</div>
              {!editingTerms && (
                <button onClick={() => setEditingTerms(true)} className="no-print" style={{ background: "transparent", border: `1px solid ${B.border}`, color: B.gray, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: font, fontWeight: 600 }}>Editar</button>
              )}
            </div>
            {editingTerms ? (
              <div>
                {tempTerms.map((term, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: B.gray, marginTop: 8, flexShrink: 0 }}>•</span>
                    <textarea value={term} onChange={(e) => { const updated = [...tempTerms]; updated[i] = e.target.value; setTempTerms(updated); }} rows={2} style={{ flex: 1, border: `1px solid ${B.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 12, fontFamily: font, color: "#1A1A1A", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                    <button onClick={() => setTempTerms(tempTerms.filter((_, idx) => idx !== i))} style={{ background: "transparent", border: `1px solid ${B.border}`, color: B.gray, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>×</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button onClick={() => setTempTerms([...tempTerms, ""])} style={{ background: "transparent", border: `1px dashed ${B.darkGreen}`, color: B.darkGreen, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 600 }}>+ Agregar término</button>
                  <div style={{ flex: 1 }} />
                  <button onClick={cancelTerms} style={{ background: "transparent", border: `1px solid ${B.border}`, color: B.gray, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: font }}>Cancelar</button>
                  <button onClick={saveTerms} style={{ background: B.darkGreen, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: font, fontWeight: 700 }}>Guardar</button>
                </div>
              </div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 22, listStyleType: "disc" }}>
                {quote.terms.map((term, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 6 }}>{term}</li>)}
              </ul>
            )}
          </div>

          {/* Extras (if any) */}
          {quote.extras && Object.keys(quote.extras).length > 0 && (
            <div className="reveal" style={{ marginBottom: 32, padding: "16px 18px", border: "1.5px dashed #FBBF24", borderRadius: 10, background: B.cream }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", color: B.darkGreen, fontWeight: 800, marginBottom: 12, textTransform: "uppercase" }}>Terraza y otros (cotización aparte)</div>
              {Object.entries(quote.extras).map(([eid, v]) => {
                const def = EXTRAS.find((e) => e.id === eid);
                return def ? (
                  <div key={eid} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "7px 0", borderBottom: `1px dashed ${B.border}`, fontSize: 13 }}>
                    <span>{def.label} — {v.qty} {def.unit}</span>
                    <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(v.qty * v.price)} + IVA</span>
                  </div>
                ) : null;
              })}
              {(() => {
                const extTotal = Object.entries(quote.extras).reduce((s, [, v]) => s + v.qty * v.price, 0);
                return <div style={{ borderTop: `1px solid ${B.border}`, marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}><span>Total terraza y otros</span><span>{fmt(extTotal)} + IVA</span></div>;
              })()}
              <div style={{ fontSize: 11, color: B.gray, marginTop: 10, fontStyle: "italic" }}>* Estos ítems se cotizan por separado del presupuesto principal.</div>
            </div>
          )}

          {/* Logistics (if any) */}
          {quote.comuna && (
            <div className="reveal" style={{ marginBottom: 32, padding: "16px 18px", border: `1.5px dashed ${B.darkGreen}`, borderRadius: 10, background: B.cream }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", color: B.darkGreen, fontWeight: 800, marginBottom: 10, textTransform: "uppercase" }}>Logística — {quote.comuna.nombre}, {quote.comuna.region}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Distancia</span><span>{fmtNum(quote.comuna.km)} km</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Transporte</span><span>{fmt(quote.comuna.transporte)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Izaje</span><span>{fmt(quote.comuna.izaje)}</span></div>
                <div style={{ height: 1, background: B.border, margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, padding: "4px 0" }}><span>Total logística</span><span>{fmt(t.totalLog)}</span></div>
              </div>
              <div style={{ fontSize: 11, color: B.gray, marginTop: 10, fontStyle: "italic" }}>* Valor de logística cotizado aparte, no incluido en el precio oferta.</div>
            </div>
          )}

          {/* Notes (if any) */}
          {quote.client.notes && (
            <div className="reveal" style={{ marginBottom: 24, padding: "14px 16px", background: B.cream, borderRadius: 8, borderLeft: `4px solid ${B.darkGreen}` }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", color: B.gray, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Notas del proyecto</div>
              <div style={{ fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{quote.client.notes}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
