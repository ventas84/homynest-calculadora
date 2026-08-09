import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { P, font } from "../data/constants";

const GALLERY = {
  m36: [
    { src: "/fotos/m36-exterior.png", caption: "Vista exterior — Modelo 36 m²" },
  ],
  m54: [
    { src: "/fotos/m54-exterior.png", caption: "Vista exterior en bosque — Modelo 54 m²" },
    { src: "/fotos/m54-nocturno.png", caption: "Vista nocturna con terraza — Modelo 54 m²" },
    { src: "/fotos/m54-terraza.png", caption: "Vista aérea con deck y jardín — Modelo 54 m²" },
  ],
  m22: [
    { src: "/fotos/m22-exterior.png", caption: "Vista exterior — Modelo 22,5 m²" },
  ],
  m50: [
    { src: "/fotos/m50-exterior.png", caption: "Vista premium elevada — Modelo 50 m²" },
  ],
};

export default function GaleriaSection({ quote }) {
  const [lightbox, setLightbox] = useState(null);
  const modelKey = quote.presetId || (quote.mt2 <= 25 ? "m22" : quote.mt2 <= 40 ? "m36" : quote.mt2 <= 52 ? "m50" : "m54");
  const photos = GALLERY[modelKey] || [];

  return (
    <div style={{ textAlign: "center", fontFamily: font }}>
      <div style={{ fontSize: 11, letterSpacing: "0.14em", color: P.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
        Galeria del proyecto
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: P.text, letterSpacing: "-0.02em", marginBottom: 8 }}>
        {quote.modelName}
      </div>
      <div style={{ fontSize: 13, color: P.textDim, marginBottom: 32 }}>
        Fotos y renders del modelo
      </div>

      {photos.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {photos.map((photo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              onClick={() => setLightbox(i)}
              style={{ cursor: "pointer", borderRadius: 10, overflow: "hidden", border: `1px solid ${P.border}`, background: P.cardAlt }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
              />
              <div style={{ display: "none", aspectRatio: "4/3", alignItems: "center", justifyContent: "center", color: P.textDim, fontSize: 12 }}>
                Foto no disponible
              </div>
              <div style={{ padding: "8px 10px", fontSize: 11, color: P.textMuted, textAlign: "left" }}>
                {photo.caption}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "40px 20px", color: P.textDim, fontSize: 13 }}>
          No hay fotos disponibles para este modelo
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 9999,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "zoom-out", padding: 24,
            }}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={photos[lightbox].src}
              alt={photos[lightbox].caption}
              style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 8, objectFit: "contain" }}
            />
            <div style={{ position: "absolute", bottom: 32, color: "#fff", fontSize: 14, fontFamily: font }}>
              {photos[lightbox].caption}
            </div>
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}
                  style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.2)", border: "none", color: "#fff", fontSize: 28, width: 44, height: 44, borderRadius: "50%", cursor: "pointer" }}
                >&#8249;</button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.2)", border: "none", color: "#fff", fontSize: 28, width: 44, height: 44, borderRadius: "50%", cursor: "pointer" }}
                >&#8250;</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 24, fontSize: 12, color: P.textDim, fontStyle: "italic" }}>
        Fotos del modelo — click para ampliar
      </div>
    </div>
  );
}
