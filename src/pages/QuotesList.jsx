import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { P, font, fmt, fmtDate } from "../data/constants";
import { TextInput } from "../components/ui";
import { storage } from "../lib/storage";

export default function QuotesList() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setQuotes(storage.list());
    setLoading(false);
  }, []);

  const handleDelete = (id) => {
    if (!confirm("¿Eliminar esta cotización?")) return;
    setDeletingId(id);
    storage.del(id);
    setQuotes(quotes.filter((q) => q.id !== id));
    setDeletingId(null);
  };

  const filtered = quotes.filter(
    (q) =>
      !search.trim() ||
      q.client.name.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: P.card, border: `1px solid ${P.border}`, color: P.text,
            padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: font,
          }}
        >
          Calculadora
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: P.text, fontFamily: font }}>Mis cotizaciones</h2>
        <div style={{ fontSize: 12, color: P.textDim, fontFamily: font }}>
          {quotes.length} cotización{quotes.length !== 1 ? "es" : ""} guardada{quotes.length !== 1 ? "s" : ""}
        </div>
      </div>
      <TextInput label="" value={search} onChange={setSearch} placeholder="Buscar por cliente o ID..." />
      {loading && <div style={{ textAlign: "center", color: P.textDim, padding: 20, fontFamily: font }}>Cargando...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: P.textDim, fontFamily: font }}>
          {quotes.length === 0 ? "Aún no has generado cotizaciones." : "No hay resultados para tu búsqueda."}
        </div>
      )}
      {filtered.map((q) => (
        <div
          key={q.id}
          onClick={() => navigate(`/cotizacion/${q.id}`)}
          style={{
            background: P.card, borderRadius: 12, padding: "14px 16px", marginBottom: 10,
            border: `1px solid ${P.border}`, cursor: "pointer", position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.text, fontFamily: font, letterSpacing: "-0.02em", marginBottom: 2 }}>
                {q.client.name}
              </div>
              <div style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginBottom: 6 }}>
                {q.id} · {fmtDate(q.createdAt)}
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: P.textMuted, fontFamily: font, flexWrap: "wrap" }}>
                <span>{q.modelName}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: P.accent, fontFamily: font, letterSpacing: "-0.02em" }}>
                {fmt(q.totals.precio)}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                disabled={deletingId === q.id}
                style={{
                  background: "transparent", border: "none", color: P.textDim, fontSize: 11,
                  marginTop: 6, cursor: "pointer", fontFamily: font, padding: "2px 6px",
                }}
              >
                {deletingId === q.id ? "..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
