import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { P, font } from "./data/constants";
import CalculatorPage from "./pages/Calculator";
import QuotesList from "./pages/QuotesList";
import QuoteView from "./pages/QuoteView";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isQuoteView = location.pathname.startsWith("/cotizacion/");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: P.bg,
        color: P.text,
        fontFamily: font,
        padding: "20px 16px 40px",
        maxWidth: 520,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {!isQuoteView && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: P.accent }}>
                HOMYNEST
              </div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: P.text }}>
                {location.pathname === "/cotizaciones" ? "Cotizaciones" : "Calculadora"}
              </h1>
            </div>
            <button
              onClick={() => navigate(location.pathname === "/cotizaciones" ? "/" : "/cotizaciones")}
              style={{
                background: P.card,
                border: `1px solid ${P.border}`,
                color: P.text,
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: font,
                fontWeight: 600,
              }}
            >
              {location.pathname === "/cotizaciones" ? "Calculadora" : "Mis cotizaciones"}
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/cotizaciones" element={<QuotesList />} />
        <Route path="/cotizacion/:id" element={<QuoteView />} />
      </Routes>

      {!isQuoteView && (
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: P.textDim, fontFamily: font }}>
          Datos enlazados a "Valor transporte por comuna" · Modelos 2026
        </div>
      )}
    </div>
  );
}
