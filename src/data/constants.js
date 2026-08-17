export const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CL");
export const fmtNum = (n) => Math.round(n).toLocaleString("es-CL");
export const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
export const genId = () =>
  Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).slice(2, 5).toUpperCase();

export const C = {
  m3x6bc: 8800000,
  m3x6b: 8645000,
  m3x6v: 7415000,
  m35x7b: 12750000,
  m35x7v: 11500000,
  add150: 2000000,
  estructVent: 800000,
  cocina: 380000,
  bano: 100000,
  vent36: 1800000,
  vent54: 2200000,
  hoja: 400000,
  apoyo: 180000,
  viaticos: 200000,
  terrazaMt2: 85000,
  casaUf: 18,
  modUf: 17,
  uf: 39640,
};

export const PRESETS = [
  {
    id: "m36",
    label: "36 m²",
    sub: "2 mód · 1 baño",
    v: {
      m3x6bc: 1, m3x6b: 0, m3x6v: 1, m35x7b: 0, m35x7v: 0,
      incl150: false, val150: 2000000, inclEstruct: false, valEstruct: 800000,
      inclCocina: true, valCocina: 380000, banos: 1, valBano: 100000,
      inclVent: true, valVent: 1800000, inclHoja: true, valHoja: 400000,
      inclApoyos: true, valApoyo: 180000, cantApoyos: 2, viaticos: 200000,
      precio: 21990000,
    },
  },
  {
    id: "m54",
    label: "54 m²",
    sub: "3 mód · 2 baños",
    v: {
      m3x6bc: 1, m3x6b: 1, m3x6v: 1, m35x7b: 0, m35x7v: 0,
      incl150: false, val150: 2000000, inclEstruct: false, valEstruct: 800000,
      inclCocina: true, valCocina: 380000, banos: 2, valBano: 100000,
      inclVent: true, valVent: 2200000, inclHoja: true, valHoja: 400000,
      inclApoyos: true, valApoyo: 180000, cantApoyos: 3, viaticos: 200000,
      precio: 35000000,
    },
  },
  {
    id: "m22",
    label: "22,5 m²",
    sub: "1 mód + 150 cm",
    v: {
      m3x6bc: 1, m3x6b: 0, m3x6v: 0, m35x7b: 0, m35x7v: 0,
      incl150: true, val150: 2000000, inclEstruct: false, valEstruct: 800000,
      inclCocina: true, valCocina: 380000, banos: 1, valBano: 100000,
      inclVent: true, valVent: 1300000, inclHoja: true, valHoja: 300000,
      inclApoyos: true, valApoyo: 180000, cantApoyos: 1, viaticos: 400000,
      precio: 17500000,
    },
  },
  {
    id: "m50",
    label: "50 m²",
    sub: "Línea pro 3,5×14",
    v: {
      m3x6bc: 0, m3x6b: 0, m3x6v: 0, m35x7b: 1, m35x7v: 1,
      incl150: false, val150: 2000000, inclEstruct: true, valEstruct: 800000,
      inclCocina: true, valCocina: 400000, banos: 1, valBano: 150000,
      inclVent: true, valVent: 2500000, inclHoja: false, valHoja: 400000,
      inclApoyos: false, valApoyo: 180000, cantApoyos: 2, viaticos: 0,
      precio: 35000000,
    },
  },
];

export const EXTRAS = [
  { id: "terraza", label: "Terraza", unit: "m²", defaultQty: 42, defaultPrice: 102000, priceLabel: "por m²" },
  { id: "tinaja", label: "Tinaja", unit: "un", defaultQty: 1, defaultPrice: 1200000, priceLabel: "c/u" },
  { id: "duchaExt", label: "Ducha exterior", unit: "un", defaultQty: 1, defaultPrice: 450000, priceLabel: "c/u" },
  { id: "sauna", label: "Sauna", unit: "un", defaultQty: 1, defaultPrice: 3500000, priceLabel: "c/u" },
  { id: "quincho", label: "Quincho", unit: "m²", defaultQty: 20, defaultPrice: 180000, priceLabel: "por m²" },
  { id: "cierro", label: "Cierro perimetral", unit: "ml", defaultQty: 50, defaultPrice: 35000, priceLabel: "por ml" },
  { id: "fosa", label: "Provisión e instalación de fosa", unit: "un", defaultQty: 1, defaultPrice: 1500000, priceLabel: "c/u" },
];

export const DEFAULT_TERMS = [
  'Se considera formato "llave en mano".',
  "El tiempo para la ejecución de la construcción es de 35 días hábiles.",
  "Incluye fundaciones de hormigón prefabricado sobre estructura de madera.",
  "No incluye provisión e instalación de fosa.",
  "Incluye mueble cocina con lavaplatos y cocina encimera de 2 platos.",
  "No incluye terraza.",
  "No considera ingreso municipal.",
  "No considera cálculo estructural.",
  "No considera pago de derechos municipales.",
  "No considera proyectos de especialidades (T1 — luz, TC6 — gas, factibilidad de Agua y Alcantarillado).",
  "Presupuesto considerado con envío e instalación para las regiones de la Araucanía y Los Ríos. En el rango fuera de esa zona se debe considerar un adicional por transporte y viáticos.",
];

export const DEFAULT_TERMS_CASA = [
  'Se considera formato "llave en mano"',
  "El tiempo para la ejecución de la construcción es de 90 días hábiles.",
  "Incluye fundaciones de hormigón prefabricado sobre estructura de madera según planos.",
  "Incluye provisión e instalación de kit de fosa 2500lt (para 8 personas).",
  "Incluye closets y mueble cocina (formato económico).",
  "Incluye calefont y regulador para entrada de Gas.",
  "No considera ingreso municipal.",
  "No considera cálculo estructural.",
  "No considera pago de derechos municipales.",
  "No considera proyectos de especialidades (T1 (luz), TC6 (gas), factibilidad de Agua y Alcantarillado).",
];

export const DEFAULT_HEADER_TEXT =
  'Valor establecido "llave en mano" de 17 UF por metro cuadrado.';
export const DEFAULT_VALIDEZ = "6 meses";

export const P = {
  bg: "#F5F1E6",
  card: "#FFFCF5",
  cardAlt: "#ECE5D8",
  accent: "#A67C52",
  accentHover: "#8F6A44",
  primary: "#A67C52",
  primaryDark: "#5C4D3F",
  text: "#4A3F35",
  textMuted: "#7D6B56",
  textDim: "#A69580",
  border: "#DBD0BA",
  inputBg: "#FFFCF5",
  warn: "#B54A35",
  info: "#A67C52",
  success: "#16A34A",
  destructive: "#B54A35",
  ring: "#A67C52",
  shadow: "0 1px 3px rgba(74,63,53,.08), 0 1px 2px rgba(74,63,53,.04)",
  shadowMd: "0 4px 12px rgba(74,63,53,.08), 0 2px 4px rgba(74,63,53,.04)",
  shadowLg: "0 10px 24px rgba(74,63,53,.1), 0 4px 8px rgba(74,63,53,.05)",
};

export const B = {
  darkGreen: "#2A4A47",
  darkGreenAlt: "#1F3D3A",
  cream: "#F5F1E8",
  green: "#5AC57E",
  ink: "#1A1A1A",
  gray: "#666666",
  grayLight: "#999999",
  border: "#E5E5E5",
  bg: "#FFFFFF",
};

export const font = "'Open Sans',-apple-system,BlinkMacSystemFont,sans-serif";
export const fontHeading = "'Poppins','Open Sans',-apple-system,sans-serif";
