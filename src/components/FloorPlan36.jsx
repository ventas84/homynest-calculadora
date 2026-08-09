import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { P, font } from "../data/constants";

const ROOMS = [
  { id: "dorm1", label: "Dormitorio 1", x: 10, y: 10, w: 214, h: 145, desc: "Dormitorio principal con espacio para cama 1½ plaza" },
  { id: "living", label: "Living-Comedor", x: 10, y: 10, w: 370, h: 280, desc: "Espacio abierto living-comedor con mesa para 6 personas" },
  { id: "cocina", label: "Cocina", x: 380, y: 10, w: 220, h: 120, desc: "Cocina equipada con encimera de 2 platos y lavaplatos" },
  { id: "bano", label: "Baño", x: 480, y: 10, w: 122, h: 285, desc: "Baño completo con ducha, WC y lavamanos" },
  { id: "dorm2", label: "Dormitorio 2", x: 602, y: 10, w: 296, h: 280, desc: "Dormitorio con espacio para cama 2 plazas" },
];

export default function FloorPlan36({ active }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const scale = 0.55;
  const svgW = 920;
  const svgH = 320;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ fontFamily: font }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", color: P.textMuted, textTransform: "uppercase", marginBottom: 6 }}>
          Plano de distribución
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: P.text, letterSpacing: "-0.02em" }}>
          Módulo 36 m² (3×12 mt)
        </div>
        <div style={{ fontSize: 13, color: P.textDim, marginTop: 4 }}>
          2 dormitorios · 1 baño · living-comedor-cocina
        </div>
      </div>

      <div style={{ overflow: "auto", display: "flex", justifyContent: "center" }}>
        <svg
          viewBox={`-10 -10 ${svgW + 20} ${svgH + 20}`}
          style={{ width: "100%", maxWidth: 700, height: "auto" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect x={0} y={0} width={svgW} height={svgH} fill={P.card} stroke={P.text} strokeWidth={3} rx={2} />

          {/* Module divider */}
          <line x1={460} y1={0} x2={460} y2={svgH} stroke={P.text} strokeWidth={2} strokeDasharray="8 4" />

          {/* Walls */}
          {/* Dorm 1 walls */}
          <rect x={8} y={8} width={220} h={150} fill="none" stroke={P.border} strokeWidth={1.5} />
          <line x1={228} y1={8} x2={228} y2={158} stroke={P.text} strokeWidth={2} />

          {/* Kitchen area wall */}
          <line x1={460} y1={130} x2={610} y2={130} stroke={P.text} strokeWidth={2} />

          {/* Bathroom walls */}
          <rect x={610} y={8} width={130} h={285} fill="none" stroke={P.text} strokeWidth={2} rx={1} />
          <line x1={610} y1={8} x2={610} y2={293} stroke={P.text} strokeWidth={2} />
          <line x1={740} y1={8} x2={740} y2={293} stroke={P.text} strokeWidth={2} />

          {/* Dorm 2 walls */}
          <line x1={740} y1={8} x2={740} y2={305} stroke={P.text} strokeWidth={2} />

          {/* Interactive room overlays */}
          {ROOMS.map((room) => (
            <g key={room.id}>
              <rect
                x={room.id === "living" ? 8 : room.id === "cocina" ? 460 : room.id === "bano" ? 610 : room.id === "dorm2" ? 740 : 8}
                y={8}
                width={room.id === "living" ? 452 : room.id === "dorm1" ? 220 : room.id === "cocina" ? 150 : room.id === "bano" ? 130 : 172}
                height={room.id === "dorm1" ? 150 : room.id === "cocina" ? 122 : 304}
                fill={hovered === room.id || selected === room.id ? `${P.accent}22` : "transparent"}
                stroke={hovered === room.id || selected === room.id ? P.accent : "transparent"}
                strokeWidth={2}
                rx={3}
                style={{ cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={() => setHovered(room.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(selected === room.id ? null : room.id)}
              />
            </g>
          ))}

          {/* Furniture - Dorm 1: Bed */}
          <rect x={22} y={30} width={90} height={55} fill="none" stroke={P.textDim} strokeWidth={1} rx={4} />
          <rect x={22} y={30} width={90} height={12} fill="none" stroke={P.textDim} strokeWidth={1} rx={3} />
          <text x={67} y={75} textAnchor="middle" fontSize={9} fill={P.textMuted} fontFamily={font}>Dormitorio 1</text>

          {/* Furniture - Living: Sofa */}
          <rect x={30} y={170} width={120} height={45} fill="none" stroke={P.textDim} strokeWidth={1} rx={6} />
          <rect x={30} y={210} width={120} height={10} fill="none" stroke={P.textDim} strokeWidth={1} rx={3} />

          {/* Furniture - Dining table */}
          <rect x={200} y={180} width={70} height={50} fill="none" stroke={P.textDim} strokeWidth={1} rx={3} />
          {/* Chairs */}
          {[0, 1, 2].map(i => (
            <g key={`chair-t-${i}`}>
              <circle cx={215 + i * 25} cy={175} r={7} fill="none" stroke={P.textDim} strokeWidth={0.8} />
              <circle cx={215 + i * 25} cy={237} r={7} fill="none" stroke={P.textDim} strokeWidth={0.8} />
            </g>
          ))}
          <text x={235} y={210} textAnchor="middle" fontSize={9} fill={P.textMuted} fontFamily={font}>Living-Comedor</text>

          {/* Kitchen */}
          <rect x={465} y={14} width={80} height={40} fill="none" stroke={P.textDim} strokeWidth={1} rx={2} />
          <circle cx={480} cy={25} r={5} fill="none" stroke={P.textDim} strokeWidth={0.8} />
          <circle cx={495} cy={25} r={5} fill="none" stroke={P.textDim} strokeWidth={0.8} />
          <circle cx={480} cy={40} r={5} fill="none" stroke={P.textDim} strokeWidth={0.8} />
          <circle cx={495} cy={40} r={5} fill="none" stroke={P.textDim} strokeWidth={0.8} />
          <text x={505} y={90} textAnchor="middle" fontSize={9} fill={P.textMuted} fontFamily={font}>Cocina</text>

          {/* Bathroom fixtures */}
          {/* Toilet */}
          <ellipse cx={650} cy={200} rx={12} ry={16} fill="none" stroke={P.textDim} strokeWidth={1} />
          <rect x={638} y={210} width={24} height={14} fill="none" stroke={P.textDim} strokeWidth={1} rx={4} />
          {/* Sink */}
          <rect x={660} cy={100} width={20} height={16} fill="none" stroke={P.textDim} strokeWidth={1} rx={8} />
          <circle cx={670} cy={108} r={4} fill="none" stroke={P.textDim} strokeWidth={0.8} />
          {/* Shower */}
          <rect x={620} y={20} width={50} height={60} fill="none" stroke={P.textDim} strokeWidth={1} rx={2} strokeDasharray="4 2" />
          <text x={675} y={160} textAnchor="middle" fontSize={9} fill={P.textMuted} fontFamily={font}>Baño</text>

          {/* Dorm 2: Double bed */}
          <rect x={770} y={30} width={120} height={90} fill="none" stroke={P.textDim} strokeWidth={1} rx={4} />
          <rect x={770} y={30} width={120} height={16} fill="none" stroke={P.textDim} strokeWidth={1} rx={3} />
          <line x1={830} y1={30} x2={830} y2={120} stroke={P.textDim} strokeWidth={0.5} />
          <text x={830} y={145} textAnchor="middle" fontSize={9} fill={P.textMuted} fontFamily={font}>Dormitorio 2</text>

          {/* Windows (blue) */}
          {/* Bottom wall windows */}
          <line x1={30} y1={svgH} x2={100} y2={svgH} stroke="#4DA8DA" strokeWidth={4} />
          <line x1={150} y1={svgH} x2={220} y2={svgH} stroke="#4DA8DA" strokeWidth={4} />
          <line x1={330} y1={svgH} x2={440} y2={svgH} stroke="#4DA8DA" strokeWidth={4} />
          {/* Bathroom window */}
          <line x1={740} y1={100} x2={740} y2={140} stroke="#4DA8DA" strokeWidth={4} />

          {/* Doors (arcs) */}
          <path d="M 228 158 Q 278 158 278 108" fill="none" stroke={P.text} strokeWidth={1.5} />
          <path d="M 740 305 Q 790 305 790 255" fill="none" stroke={P.text} strokeWidth={1.5} />

          {/* Dimensions */}
          {/* Total width */}
          <line x1={0} y1={svgH + 12} x2={svgW} y2={svgH + 12} stroke={P.textDim} strokeWidth={0.8} markerEnd="url(#arrow)" markerStart="url(#arrow-start)" />
          <text x={svgW / 2} y={svgH + 26} textAnchor="middle" fontSize={11} fill={P.textMuted} fontFamily={font} fontWeight={600}>1200 cm</text>

          {/* Total height */}
          <line x1={-8} y1={0} x2={-8} y2={svgH} stroke={P.textDim} strokeWidth={0.8} />
          <text x={-8} y={svgH / 2} textAnchor="middle" fontSize={11} fill={P.textMuted} fontFamily={font} fontWeight={600} transform={`rotate(-90, -8, ${svgH / 2})`}>300 cm</text>

          {/* Module labels */}
          <text x={230} y={svgH + 8} textAnchor="middle" fontSize={8} fill={P.textDim} fontFamily={font}>600 cm</text>
          <text x={690} y={svgH + 8} textAnchor="middle" fontSize={8} fill={P.textDim} fontFamily={font}>600 cm</text>
        </svg>
      </div>

      {/* Room info tooltip */}
      <AnimatePresence>
        {(selected || hovered) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 16,
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 10,
              padding: "12px 16px",
              textAlign: "center",
              boxShadow: P.shadowMd,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginBottom: 4 }}>
              {ROOMS.find(r => r.id === (selected || hovered))?.label}
            </div>
            <div style={{ fontSize: 12, color: P.textMuted }}>
              {ROOMS.find(r => r.id === (selected || hovered))?.desc}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: P.textDim }}>
        Pasa el mouse sobre cada zona para ver detalles · Medidas en centímetros
      </div>
    </motion.div>
  );
}
