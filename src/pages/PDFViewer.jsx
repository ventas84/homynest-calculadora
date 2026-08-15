import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { B, font } from "../data/constants";
import { HomyNestLogo } from "../components/ui";

export default function PDFViewer() {
  const navigate = useNavigate();
  const pdfUrl = "/docs/eett-modulos-2026.pdf";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#1a1a1a" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "10px 14px" : "12px 20px", background: B.darkGreen, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HomyNestLogo color="#fff" size={isMobile ? 24 : 28} />
          <span style={{ color: "#fff", fontSize: isMobile ? 13 : 15, fontWeight: 700, fontFamily: font }}>HomyNest</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <a
            href={pdfUrl}
            download
            style={{
              background: "rgba(255,255,255,0.15)", color: "#fff", border: "none",
              padding: isMobile ? "7px 10px" : "8px 14px", borderRadius: 6, cursor: "pointer",
              fontSize: isMobile ? 11 : 12, fontFamily: font, fontWeight: 600, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar
          </a>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.15)", color: "#fff", border: "none",
              padding: isMobile ? "7px 10px" : "8px 14px", borderRadius: 6, cursor: "pointer",
              fontSize: isMobile ? 11 : 12, fontFamily: font, fontWeight: 600,
            }}
          >
            Volver
          </button>
        </div>
      </div>

      {/* PDF title */}
      <div style={{
        textAlign: "center", padding: isMobile ? "10px 14px" : "14px 20px", background: "#222",
        color: "rgba(255,255,255,0.7)", fontSize: isMobile ? 11 : 13, fontFamily: font, fontWeight: 600,
        letterSpacing: "0.04em", flexShrink: 0,
      }}>
        Especificaciones Técnicas — Módulos 2026
      </div>

      {/* PDF embed area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <object
          data={pdfUrl}
          type="application/pdf"
          style={{
            width: "100%", maxWidth: 1000, flex: 1,
            minHeight: isMobile ? "calc(100vh - 95px)" : "calc(100vh - 110px)",
            border: "none",
          }}
        >
          {/* Fallback for browsers that can't render PDF inline (some mobile) */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "60px 24px", textAlign: "center", minHeight: "50vh",
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 24 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, fontFamily: font, marginBottom: 24, lineHeight: 1.6 }}>
              Tu navegador no puede mostrar el PDF directamente.
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: B.green, color: "#fff", textDecoration: "none",
                padding: "16px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700,
                fontFamily: font,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Abrir PDF
            </a>
          </div>
        </object>
      </div>
    </div>
  );
}
