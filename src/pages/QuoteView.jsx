import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  EXTRAS, DEFAULT_TERMS, DEFAULT_HEADER_TEXT, DEFAULT_VALIDEZ,
  C, B, P, font, fontHeading, fmt, fmtNum, fmtDate,
} from "../data/constants";
import { HomyNestLogo } from "../components/ui";
import { storage } from "../lib/storage";
import FloorPlan36 from "../components/FloorPlan36";
import GaleriaSection from "../components/GaleriaSection";
import CinematicScroll from "../components/CinematicScroll";
import { useUf } from "../lib/uf";

function escapeHTML(str) {
  if (typeof str !== "string") return String(str);
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function boldHeaderHTML(text) {
  let s = escapeHTML(text);
  s = s.replace(/(&quot;llave en mano&quot;|"llave en mano")/gi, '<strong>"llave en mano"</strong>');
  s = s.replace(/(\d+[,,]?\d*\s*UF)/gi, "<strong>$1</strong>");
  return s;
}

function BoldHeaderText({ text }) {
  const parts = [];
  let rest = text;
  const patterns = [
    { re: /"llave en mano"/i, bold: true },
    { re: /\d+[,]?\d*\s*UF/i, bold: true },
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

function projectInfo(quote, liveUf) {
  const ufVal = liveUf || C.uf;
  const items = quote.items || {};
  const isCasa = quote.quoteType === "casa" && quote.casa;
  const totalMod = quote.totalModulos || 1;
  const mt2 = quote.mt2 || 0;

  if (isCasa) {
    const precioTabla = mt2 * C.casaUf * ufVal;
    return {
      isCasa: true,
      title: `CASA DE ${mt2} METROS CUADRADOS`,
      dims: quote.casa.dims,
      prog: quote.casa.prog,
      precioTabla: Math.max(precioTabla, quote.totals.precio),
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
  const precioTabla = mt2 * C.modUf * ufVal;

  return { isCasa: false, title, dims, prog, precioTabla: Math.max(precioTabla, quote.totals.precio) };
}

function buildStandaloneHTML(quote, liveUf) {
  const t = quote.totals;
  const ufVal = liveUf || C.uf;
  const info = projectInfo(quote, ufVal);
  const headerLine = `Valor establecido "llave en mano" de ${C.modUf} UF por metro cuadrado. UF al día: ${fmt(ufVal)}`;
  const clientLoc = quote.comuna ? `${escapeHTML(quote.comuna.nombre)}, ${escapeHTML(quote.comuna.region)}` : "";

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
.header-cols{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
.header-text{flex:1 1 auto;font-size:13px;line-height:1.6}
.header-meta{flex-shrink:0;text-align:right;font-size:13px;line-height:1.8}
.body{padding:48px 44px}
.project-row{margin-bottom:14px}
.project-label{font-size:12px;letter-spacing:.1em;color:#1A1A1A;font-weight:800}
.project-name{font-size:21px;font-weight:900;color:#1A1A1A;letter-spacing:-.01em}
.project-details{font-size:14px;color:#444;line-height:1.9}
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
        <svg width="48" height="48" viewBox="0 0 1024 816" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M237.639,690C237.633,668.003,237.537,646.505,237.707,625.01C237.737,621.146,236.469,619.396,232.755,618.428C202.483,610.537,175.248,596.397,151.247,576.543C123.323,553.444,102.507,524.746,88.651,491.245C83.57,478.959,80.421,466.008,77.803,452.907C74.688,437.326,73.998,421.659,73.927,405.865C73.906,401.068,75.492,399.622,80.29,399.638C130.449,399.807,180.609,399.769,230.768,399.774C237.608,399.774,237.627,399.738,237.627,392.939C237.625,292.453,237.614,191.967,237.631,91.481C237.632,89.02,237.217,86.502,238.276,83.693C245.198,83.816,251.895,85.786,258.654,87.024C296.424,93.941,334.166,101.016,371.896,108.149C417.965,116.859,464.001,125.736,510.072,134.433C552.714,142.483,595.383,150.383,638.038,158.364C688.541,167.812,739.041,177.282,789.546,186.728C797.117,188.144,797.143,188.106,797.144,196.066C797.145,261.557,797.136,327.048,797.136,392.538C797.137,399.744,797.156,399.756,804.2,399.756C853.859,399.756,903.519,399.748,953.179,399.748C960.219,399.747,960.058,399.766,960.286,406.936C961.195,435.618,955.904,463.267,945.48,489.82C933.318,520.798,914.543,547.331,890.057,570.01C868.798,589.701,843.931,603.055,817.317,613.597C812.391,615.548,807.166,616.819,801.994,618.047C798.235,618.938,797.051,620.882,797.066,624.705C797.2,657.7,797.144,690.696,797.148,723.691C797.149,731.345,797.155,731.346,789.432,731.349C783.766,731.351,778.1,731.36,772.434,731.345C765.917,731.328,765.875,731.284,765.874,724.533C765.87,692.204,765.874,659.875,765.869,627.546C765.868,620.266,765.856,620.25,758.383,620.25C597.239,620.244,436.095,620.241,274.951,620.241C268.345,620.241,268.318,620.258,268.314,626.792C268.299,659.288,268.304,691.783,268.29,724.279C268.287,731.33,268.265,731.336,261.047,731.345C254.882,731.352,248.711,731.203,242.552,731.395C238.907,731.508,237.532,730.187,237.58,726.485C237.734,714.492,237.639,702.495,237.639,690ZM747.499,399.764C751.832,399.761,756.179,399.543,760.494,399.816C764.646,400.079,765.941,398.5,765.934,394.376C765.83,335.877,765.825,277.377,765.945,218.878C765.953,214.854,764.369,213.243,760.717,212.565C731.783,207.192,702.862,201.746,673.937,196.329C638.306,189.655,602.668,183.016,567.044,176.307C533.548,169.998,500.069,163.597,466.575,157.275C430.146,150.398,393.707,143.577,357.276,136.709C330.313,131.626,303.38,126.372,276.382,121.483C268.449,120.047,268.303,118.105,268.304,128.281C268.31,216.447,268.31,304.613,268.313,392.779C268.314,399.777,268.319,399.781,275.503,399.781C432.502,399.775,589.501,399.769,747.499,399.764ZM765.883,560.5C765.891,519.502,765.906,478.504,765.899,437.506C765.898,431.212,765.609,430.928,759.511,430.928C598.018,430.917,436.525,430.913,275.032,430.915C268.323,430.915,268.292,430.953,268.292,437.531C268.292,486.362,268.3,535.193,268.338,584.025C268.339,585.621,267.809,587.371,269.422,589.118C270.622,589.118,272.104,589.117,273.585,589.118C349.572,589.121,425.559,589.127,501.546,589.128C571.043,589.128,640.54,589.127,710.037,589.118C726.203,589.116,742.368,589.086,758.534,589.057C765.847,589.045,765.857,589.032,765.874,581.499C765.89,574.833,765.88,568.166,765.883,560.5ZM237.633,522.5C237.634,495.844,237.638,469.187,237.634,442.531C237.632,430.895,237.625,430.915,226.298,430.916C188.479,430.921,150.66,430.897,112.841,430.934C110.603,430.937,108.179,430.281,105.833,432.208C110.402,472.588,126.282,508.199,154.085,537.744C176.736,561.814,204.513,578.522,237.632,588.308C237.632,565.982,237.632,544.741,237.633,522.5ZM797.13,566.5C797.13,573.394,797.13,580.288,797.13,586.567C799.205,587.702,800.154,587.263,801.087,586.958C835.099,575.825,864.238,557.029,887.206,529.642C909.486,503.074,922.941,472.193,927.803,437.721C928.76,430.943,928.791,430.929,921.739,430.927C882.605,430.919,843.472,430.919,804.339,430.921C797.133,430.921,797.102,430.932,797.102,438.109C797.103,480.572,797.119,523.036,797.13,566.5Z"/>
        </svg>
        <span>HomyNest</span>
      </div>
      <div class="web">www.homynest.cl</div>
    </div>
    <div class="header-divider"></div>
    <div class="header-cols">
      <div class="header-text">
        <div>Valor establecido <strong>"llave en mano"</strong></div>
        <div>de <strong>${C.modUf} UF</strong> por metro cuadrado.</div>
        <div>UF al día: ${fmt(ufVal)}</div>
      </div>
      <div class="header-meta">
        <div><strong>Fecha:</strong> ${escapeHTML(fmtDate(quote.createdAt))}</div>
        <div><strong>Validez:</strong> ${escapeHTML(quote.validez)}</div>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="project reveal">
      <div class="project-row">
        <span class="project-label">PROYECTO:</span>
        <span class="project-name">${escapeHTML(info.title)}</span>
      </div>
      <div class="project-details">
        <div><strong>Cliente:</strong> ${escapeHTML(quote.client.name)}</div>
        ${clientLoc ? `<div><strong>Ubicación:</strong> ${clientLoc}</div>` : ""}
        <div><strong>Construcción:</strong> Homy Nest Studio</div>
        <div><strong>Arquitecto:</strong> Cristóbal Letelier G.</div>
        <div style="padding-left:84px">Patente 3-4240</div>
      </div>
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
  const { uf: liveUf } = useUf();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState("presupuesto");
  const [editingTerms, setEditingTerms] = useState(false);
  const [tempTerms, setTempTerms] = useState([]);
  const [editingHeader, setEditingHeader] = useState(false);
  const [tempHeader, setTempHeader] = useState("");
  const [tempValidez, setTempValidez] = useState("");

  useEffect(() => {
    let q = storage.get(id);
    if (!q && window.location.hash.length > 1) {
      try {
        q = JSON.parse(decodeURIComponent(escape(atob(window.location.hash.slice(1)))));
      } catch {}
    }
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
    let io;
    const setup = () => {
      const els = document.querySelectorAll(".reveal:not(.reveal-in)");
      if (els.length === 0) return;
      try {
        io = new IntersectionObserver(
          (entries) => { entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("reveal-in"); io.unobserve(e.target); } }); },
          { threshold: 0.1 }
        );
        els.forEach((el) => io.observe(el));
      } catch {}
    };
    setup();
    const retry = setTimeout(() => { setup(); }, 500);
    const fallback = setTimeout(() => { document.querySelectorAll(".reveal:not(.reveal-in)").forEach((el) => el.classList.add("reveal-in")); }, 1000);
    return () => { clearTimeout(retry); clearTimeout(fallback); io?.disconnect(); };
  }, [quote, section]);

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

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/cotizacion/${quote.id}#${btoa(unescape(encodeURIComponent(JSON.stringify(quote))))}`
    : "";

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { prompt("Copia el link manualmente:", shareUrl); }
  };

  const shareWA = () => {
    const total = fmt(quote.totals.precio);
    const logLine = quote.comuna ? `\n🚚 *Logística ${quote.comuna.nombre}:* ${fmt(quote.totals.totalLog)} (aparte)` : "";
    const msg = `*Cotización HomyNest N° ${quote.id}*\n\nHola ${quote.client.name},\n\nAdjunto tu cotización:\n\n📐 *Modelo:* ${quote.modelName}\n📏 *Superficie:* ${quote.mt2} m²\n💰 *Total:* ${total} + IVA${logLine}\n\n🔗 *Ver presupuesto completo:*\n${shareUrl}\n\nCualquier duda me avisas.\n\nSaludos,\n*Cristóbal Letelier*\nHomyNest`;
    const phone = quote.client.phone ? quote.client.phone.replace(/[^\d]/g, "") : "";
    window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const downloadHTML = () => {
    const html = buildStandaloneHTML(quote, liveUf);
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
  const info = projectInfo(quote, liveUf);
  const descLabel = info.isCasa ? "Casa" : "Módulo";
  const headerLine = `Valor establecido "llave en mano" de ${C.modUf} UF por metro cuadrado. UF al día: ${fmt(liveUf)}`;
  const clientLocation = quote.comuna ? `${quote.comuna.nombre}, ${quote.comuna.region}` : "";

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .reveal { opacity:0; transform:translateY(24px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal-in { opacity:1; transform:translateY(0); }
        .edit-hover:hover { background: rgba(255,255,255,0.08) !important; }
        @media print { .no-print { display:none !important; } body, html { background:white !important; } .quote-doc { background:white !important; box-shadow:none !important; } .reveal { opacity:1 !important; transform:none !important; } }
        @media (max-width: 640px) {
          .quote-outer { padding: 8px 4px 28px !important; }
          .quote-doc .green-header-inner { padding: 18px 14px 16px !important; }
          .quote-doc .brand-row { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; margin-bottom: 10px !important; }
          .quote-doc .brand-name { font-size: 20px !important; }
          .quote-doc .brand-web { font-size: 13px !important; opacity: 0.8; }
          .quote-doc .header-cols { flex-direction: column !important; gap: 4px !important; font-size: 10px !important; line-height: 1.5 !important; }
          .quote-doc .header-meta { text-align: left !important; font-size: 10px !important; }
          .quote-doc .body-inner { padding: 20px 14px !important; }
          .quote-doc .project-row { flex-direction: column !important; }
          .quote-doc .project-title { font-size: 14px !important; display: block !important; margin-top: 4px !important; }
          .quote-doc .project-details { font-size: 12px !important; line-height: 1.7 !important; }
          .quote-doc .table-wrap table { width: 100% !important; min-width: 0 !important; }
          .quote-doc .table-wrap th, .quote-doc .table-wrap td { padding: 6px 3px !important; font-size: 11px !important; }
          .quote-doc .table-wrap .th-qty, .quote-doc .table-wrap .td-qty { width: 44px !important; }
          .quote-doc .table-wrap .th-price, .quote-doc .table-wrap .td-price { width: auto !important; }
          .quote-doc .price-big { font-size: 16px !important; white-space: normal !important; }
          .quote-doc .terms-list li { font-size: 11px !important; line-height: 1.5 !important; margin-bottom: 4px !important; }
          .quote-doc .terms-title { font-size: 12px !important; }
          .quote-doc .extras-box { padding: 12px 14px !important; font-size: 11px !important; }
          .quote-doc .extras-box .section-label { font-size: 10px !important; }
          .quote-doc .logistics-box { padding: 12px 14px !important; font-size: 11px !important; }
          .quote-doc .nav-buttons button, .quote-doc .nav-buttons a { font-size: 12px !important; padding: 10px 14px !important; }
          .plano-wrap {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 35% 0;
            overflow: visible;
          }
          .plano-wrap .plano-img {
            transform: rotate(90deg) !important;
            width: 140% !important;
            max-width: none !important;
          }
        }
      `}</style>

      <CinematicScroll quote={quote} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="quote-outer"
        style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px 40px" }}
      >

      <div className="no-print" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/")} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font }}>Calculadora</button>
          <button onClick={() => navigate("/cotizaciones")} style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font }}>Mis cotizaciones</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => window.print()} style={{ background: P.cardAlt, border: `1px solid ${P.border}`, color: P.text, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font, fontWeight: 600 }}>Imprimir</button>
        </div>

        <div style={{ background: P.card, padding: "10px 14px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, fontFamily: font }}>
          <span style={{ color: P.textMuted }}>Cliente:</span> <strong>{quote.client.name}</strong>
          {quote.client.phone && <span style={{ color: P.textMuted, marginLeft: 12 }}>{quote.client.phone}</span>}
          <span style={{ color: P.textDim, marginLeft: 12, fontSize: 11 }}>N° {quote.id}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">

      {/* ═══════════ PRESUPUESTO ═══════════ */}
      {section === "presupuesto" && (
      <motion.div
        key="presupuesto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
      <div className="quote-doc" style={{ background: "#fff", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.1)", fontFamily: font, color: "#1A1A1A" }}>

        {/* Green header */}
        <div className="green-header-inner" style={{ background: B.darkGreen, padding: "32px 40px 26px", color: "#fff", animation: "fadeUp .6s cubic-bezier(.16,1,.3,1) both" }}>
          <div className="brand-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HomyNestLogo color="#fff" size={48} />
              <div className="brand-name" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>HomyNest</div>
            </div>
            <div className="brand-web" style={{ fontSize: 22, fontWeight: 700 }}>www.homynest.cl</div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "0 0 16px" }} />
          <div className="header-cols" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div style={{ flex: "1 1 auto", fontSize: 13, lineHeight: 1.7 }}>
              <div>Valor establecido <strong>"llave en mano"</strong></div>
              <div>de <strong>{C.modUf} UF</strong> por metro cuadrado.</div>
              <div>UF al día: {fmt(liveUf)}</div>
            </div>
            <div className="header-meta" style={{ flexShrink: 0, textAlign: "right", fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Fecha:</strong> {fmtDate(quote.createdAt)}</div>
              <div><strong>Validez:</strong> {quote.validez}</div>
            </div>
          </div>
        </div>

        {/* Body — identical to PDF */}
        <div className="body-inner" style={{ padding: "48px 44px" }}>

          {/* PROYECTO */}
          <div className="reveal" style={{ marginBottom: 0 }}>
            <div className="project-row" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 800 }}>PROYECTO: &nbsp;&nbsp;</span>
              <span className="project-title" style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.01em" }}>{info.title}</span>
            </div>
            <div className="project-details" style={{ fontSize: 14, color: "#444", lineHeight: 1.9 }}>
              <div><strong>Cliente:</strong> {quote.client.name}</div>
              {clientLocation && <div><strong>Ubicación:</strong> {clientLocation}</div>}
              <div><strong>Construcción:</strong> Homy Nest Studio</div>
              <div><strong>Arquitecto:</strong> Cristóbal Letelier G. — Patente 3-4240</div>
            </div>
          </div>

          {/* Horizontal line */}
          <div style={{ height: 1, background: "#1A1A1A", margin: "20px 0 24px" }} />

          {/* Table */}
          <div className="reveal table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1A1A1A" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 800 }}>DESCRIPCIÓN</th>
                  <th className="th-qty" style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 800, width: 100 }}>CANTIDAD</th>
                  <th className="th-price" style={{ textAlign: "right", padding: "10px 8px", fontSize: 11, letterSpacing: "0.1em", fontWeight: 800, width: 140 }}>PRECIO NETO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "16px 8px", fontSize: 14, lineHeight: 1.6 }}>
                    {descLabel} de <strong>{quote.mt2} metros cuadrados</strong> ({info.dims})<br />
                    ({info.prog})
                  </td>
                  <td className="td-qty" style={{ padding: "16px 8px", textAlign: "center", fontSize: 14 }}>1</td>
                  <td className="td-price" style={{ padding: "16px 8px", textAlign: "right", fontSize: 14, whiteSpace: "nowrap" }}>{fmt(info.precioTabla)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Green gradient line + PRECIO OFERTA */}
          <div className="reveal" style={{ textAlign: "center", margin: "40px 0" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${B.darkGreen} 0%, ${B.green} 50%, ${B.darkGreen} 100%)`, marginBottom: 36 }} />
            <div className="price-big" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
              PRECIO OFERTA :&nbsp;&nbsp; {fmt(t.precio)} <span style={{ fontSize: 15, fontWeight: 700, verticalAlign: "baseline" }}>NETO</span>
            </div>
          </div>

          {/* Horizontal line before terms */}
          <div style={{ height: 1, background: "#ccc", marginBottom: 24 }} />

          {/* Terms */}
          <div className="reveal" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="terms-title" style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.04em", textDecoration: "underline" }}>TÉRMINOS Y CONDICIONES</div>
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
              <ul className="terms-list" style={{ margin: 0, paddingLeft: 22, listStyleType: "disc" }}>
                {quote.terms.map((term, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 6 }}>{term}</li>)}
              </ul>
            )}
          </div>

          {/* Extras (if any) */}
          {quote.extras && Object.keys(quote.extras).length > 0 && (
            <div className="reveal extras-box" style={{ marginBottom: 32, padding: "16px 18px", border: "1.5px dashed #FBBF24", borderRadius: 10, background: B.cream }}>
              <div className="section-label" style={{ fontSize: 11, letterSpacing: "0.14em", color: B.darkGreen, fontWeight: 800, marginBottom: 12, textTransform: "uppercase" }}>Terraza y otros (cotización aparte)</div>
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
            <div className="reveal logistics-box" style={{ marginBottom: 32, padding: "16px 18px", border: `1.5px dashed ${B.darkGreen}`, borderRadius: 10, background: B.cream }}>
              <div className="section-label" style={{ fontSize: 11, letterSpacing: "0.14em", color: B.darkGreen, fontWeight: 800, marginBottom: 10, textTransform: "uppercase" }}>Logística — {quote.comuna.nombre}, {quote.comuna.region}</div>
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

          {/* Links: EETT, Plano, Galería */}
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 32, marginBottom: 8, alignItems: "center" }}>
            <button
              onClick={() => { setSection("eett"); window.scrollTo({ top: document.querySelector(".quote-doc")?.offsetTop - 20, behavior: "smooth" }); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, width: "100%", justifyContent: "center",
                background: B.darkGreen, color: "#fff", border: "none",
                padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700,
                fontFamily: font, letterSpacing: "0.02em", boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(42,74,71,.25)", cursor: "pointer", transition: "opacity .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Ver Especificaciones Técnicas
            </button>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                onClick={() => { setSection("plano"); window.scrollTo({ top: document.querySelector(".quote-doc")?.offsetTop - 20, behavior: "smooth" }); }}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "transparent", color: B.darkGreen, border: `2px solid ${B.darkGreen}`,
                  padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  fontFamily: font, cursor: "pointer", transition: "all .15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                Ver Plano
              </button>
              <button
                onClick={() => { setSection("galeria"); window.scrollTo({ top: document.querySelector(".quote-doc")?.offsetTop - 20, behavior: "smooth" }); }}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "transparent", color: B.darkGreen, border: `2px solid ${B.darkGreen}`,
                  padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  fontFamily: font, cursor: "pointer", transition: "all .15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Ver Galería
              </button>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
      )}

      {/* ═══════════ EETT ═══════════ */}
      {section === "eett" && (
        <motion.div
          key="eett"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: P.card, borderRadius: 12, padding: "24px", boxShadow: P.shadowMd, border: `1px solid ${P.border}` }}
        >
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: B.darkGreen, fontWeight: 800, marginBottom: 16, textTransform: "uppercase", textAlign: "center" }}>
            Especificaciones Técnicas — Módulos 2026
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3,4,5,6,7,8].map((n) => (
              <img
                key={n}
                src={`/docs/eett/page-${n}.jpg`}
                alt={`Especificaciones Técnicas — Lámina ${n}`}
                loading="lazy"
                style={{ width: "100%", height: "auto", borderRadius: 6, display: "block", border: `1px solid ${B.border}` }}
              />
            ))}
          </div>
          <div className="no-print" style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <a
              href="/docs/eett-modulos-2026.pdf"
              download
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "transparent", color: B.darkGreen, border: `2px solid ${B.darkGreen}`,
                padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                fontFamily: font, textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar PDF
            </a>
            <button
              onClick={() => setSection("presupuesto")}
              style={{
                flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                background: B.darkGreen, color: "#fff", border: "none",
                padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                fontFamily: font, cursor: "pointer",
              }}
            >
              ← Volver al Presupuesto
            </button>
          </div>
        </motion.div>
      )}

      {/* ═══════════ PLANO ═══════════ */}
      {section === "plano" && (
        <motion.div
          key="plano"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: P.card, borderRadius: 12, padding: "24px", boxShadow: P.shadowMd, border: `1px solid ${P.border}` }}
        >
          <div className="plano-wrap">
            <img
              className="plano-img"
              src="/fotos/plano.jpg"
              alt={`Plano ${quote.modelName || quote.mt2 + " m²"}`}
              style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }}
            />
          </div>
          <button
            className="no-print"
            onClick={() => setSection("presupuesto")}
            style={{
              marginTop: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              width: "100%", background: B.darkGreen, color: "#fff", border: "none",
              padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              fontFamily: font, cursor: "pointer",
            }}
          >
            ← Volver al Presupuesto
          </button>
        </motion.div>
      )}

      {/* ═══════════ GALERÍA ═══════════ */}
      {section === "galeria" && (
        <motion.div
          key="galeria"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: P.card, borderRadius: 12, padding: "32px 24px", boxShadow: P.shadowMd, border: `1px solid ${P.border}` }}
        >
          <GaleriaSection quote={quote} />
          <button
            className="no-print"
            onClick={() => setSection("presupuesto")}
            style={{
              marginTop: 20, display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              width: "100%", background: B.darkGreen, color: "#fff", border: "none",
              padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              fontFamily: font, cursor: "pointer",
            }}
          >
            ← Volver al Presupuesto
          </button>
        </motion.div>
      )}

      </AnimatePresence>

      {/* ═══════════ ACCIONES (al final) ═══════════ */}
      <div className="no-print" style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={downloadHTML} style={{ width: "100%", background: P.accent, border: "none", color: "#FFFFFF", padding: "14px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: fontHeading, fontWeight: 700, letterSpacing: "-0.01em", boxShadow: "0 4px 16px rgba(166,124,82,.3)", transition: "all .15s ease" }}>
          Descargar pagina HTML (para enviar al cliente)
        </button>

        <button onClick={shareWA} style={{ width: "100%", background: "#25D366", border: "none", color: "#fff", padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: font, fontWeight: 700 }}>
          Enviar por WhatsApp{quote.client.phone ? ` — ${quote.client.phone}` : ""}
        </button>

        <button onClick={copyLink} style={{ width: "100%", background: copied ? P.accent : P.card, color: copied ? "#FFFFFF" : P.primaryDark, border: `1px solid ${copied ? P.accent : P.border}`, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: font, fontWeight: 700, transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {copied
              ? <polyline points="20 6 9 17 4 12" />
              : <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>
            }
          </svg>
          {copied ? "Link copiado al portapapeles" : "Copiar link para enviar al cliente"}
        </button>
      </div>

      </motion.div>
    </>
  );
}
