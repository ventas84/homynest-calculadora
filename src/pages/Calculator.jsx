import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  C, PRESETS, EXTRAS, DEFAULT_TERMS, DEFAULT_TERMS_CASA,
  DEFAULT_HEADER_TEXT, DEFAULT_VALIDEZ, P, font, fontHeading, fmt, fmtNum, genId,
} from "../data/constants";
import {
  MoneyInput, TextInput, NumInput, Toggle, Line, Section, SubHead,
  Divider, Tabs, PresetChips, ComunaSearch, SaveQuoteModal,
} from "../components/ui";
import { storage } from "../lib/storage";

function CalcModulos() {
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState("m36");
  const [m3x6bc, setM3x6bc] = useState(1);
  const [m3x6b, setM3x6b] = useState(0);
  const [m3x6v, setM3x6v] = useState(1);
  const [m35x7b, setM35x7b] = useState(0);
  const [m35x7v, setM35x7v] = useState(0);
  const [incl150, setIncl150] = useState(false);
  const [val150, setVal150] = useState(C.add150);
  const [inclEstruct, setInclEstruct] = useState(false);
  const [valEstruct, setValEstruct] = useState(C.estructVent);
  const [inclCocina, setInclCocina] = useState(true);
  const [valCocina, setValCocina] = useState(C.cocina);
  const [banos, setBanos] = useState(1);
  const [valBano, setValBano] = useState(C.bano);
  const [inclVent, setInclVent] = useState(true);
  const [valVent, setValVent] = useState(C.vent36);
  const [inclHoja, setInclHoja] = useState(true);
  const [valHoja, setValHoja] = useState(C.hoja);
  const [inclApoyos, setInclApoyos] = useState(true);
  const [valApoyo, setValApoyo] = useState(C.apoyo);
  const [cantApoyos, setCantApoyos] = useState(2);
  const [viaticos, setViaticos] = useState(C.viaticos);
  const [selectedComuna, setSelectedComuna] = useState(null);
  const [extras, setExtras] = useState(() =>
    EXTRAS.reduce((acc, ex) => ({ ...acc, [ex.id]: { on: false, qty: ex.defaultQty, price: ex.defaultPrice } }), {})
  );
  const [precio, setPrecio] = useState(23500000);
  const [margenObj, setMargenObj] = useState(18);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleExtra = (id) => { setExtras((prev) => ({ ...prev, [id]: { ...prev[id], on: !prev[id].on } })); clearPreset(); };
  const setExtraQty = (id, qty) => setExtras((prev) => ({ ...prev, [id]: { ...prev[id], qty } }));
  const setExtraPrice = (id, price) => setExtras((prev) => ({ ...prev, [id]: { ...prev[id], price } }));

  const applyPreset = (preset) => {
    const v = preset.v;
    setActivePreset(preset.id);
    setM3x6bc(v.m3x6bc); setM3x6b(v.m3x6b); setM3x6v(v.m3x6v);
    setM35x7b(v.m35x7b); setM35x7v(v.m35x7v);
    setIncl150(v.incl150); setVal150(v.val150);
    setInclEstruct(v.inclEstruct); setValEstruct(v.valEstruct);
    setInclCocina(v.inclCocina); setValCocina(v.valCocina);
    setBanos(v.banos); setValBano(v.valBano);
    setInclVent(v.inclVent); setValVent(v.valVent);
    setInclHoja(v.inclHoja); setValHoja(v.valHoja);
    setInclApoyos(v.inclApoyos); setValApoyo(v.valApoyo); setCantApoyos(v.cantApoyos);
    setViaticos(v.viaticos); setPrecio(v.precio);
  };

  const clearPreset = () => activePreset && setActivePreset(null);

  const totalMod3x6 = m3x6bc + m3x6b + m3x6v;
  const totalMod35x7 = m35x7b + m35x7v;
  const totalModulos = totalMod3x6 + totalMod35x7;
  const mt2 = totalMod3x6 * 18 + totalMod35x7 * 24.5 + (incl150 ? 4.5 : 0);

  const calc = useMemo(() => {
    const costoMods = m3x6bc * C.m3x6bc + m3x6b * C.m3x6b + m3x6v * C.m3x6v + m35x7b * C.m35x7b + m35x7v * C.m35x7v;
    const cAdd150 = incl150 ? val150 : 0;
    const cEstruct = inclEstruct ? valEstruct : 0;
    const cCocina = inclCocina ? valCocina : 0;
    const cBanos = banos * valBano;
    const cVent = inclVent ? valVent : 0;
    const cHoja = inclHoja ? valHoja : 0;
    const cApoyos = inclApoyos ? valApoyo * cantApoyos : 0;
    const cExtras = Object.entries(extras).reduce((sum, [, ex]) => sum + (ex.on ? ex.qty * ex.price : 0), 0);
    const costoTotal = costoMods + cAdd150 + cEstruct + cCocina + cBanos + cVent + cHoja + cApoyos + viaticos;
    const precioMinimo = Math.ceil(costoTotal / (1 - margenObj / 100));
    const transComuna = selectedComuna ? selectedComuna.transporte : 0;
    const izajeComuna = selectedComuna ? selectedComuna.izaje : 0;
    const totalLog = transComuna + izajeComuna;
    const ganancia = precio - costoTotal;
    const margen = precio > 0 ? (ganancia / precio) * 100 : 0;
    const bajoMargen = margen < margenObj;
    return { costoMods, cAdd150, cEstruct, cCocina, cBanos, cVent, cHoja, cApoyos, cExtras, costoTotal, precioMinimo, transComuna, izajeComuna, totalLog, ganancia, margen, bajoMargen };
  }, [m3x6bc, m3x6b, m3x6v, m35x7b, m35x7v, incl150, val150, inclEstruct, valEstruct, inclCocina, valCocina, banos, valBano, inclVent, valVent, inclHoja, valHoja, inclApoyos, valApoyo, cantApoyos, viaticos, extras, selectedComuna, precio, margenObj]);

  const handleSaveQuote = (clientInfo) => {
    setSaving(true);
    const preset = PRESETS.find((p) => p.id === activePreset);
    const quote = {
      id: genId(),
      createdAt: Date.now(),
      client: clientInfo,
      preset: activePreset,
      modelName: preset ? `${preset.label} — ${preset.sub}` : `Personalizado · ${totalModulos} mód · ${mt2} m²`,
      terms: [...DEFAULT_TERMS],
      headerText: DEFAULT_HEADER_TEXT,
      validez: DEFAULT_VALIDEZ,
      totalModulos, mt2,
      items: {
        m3x6bc, m3x6b, m3x6v, m35x7b, m35x7v,
        incl150, val150, inclEstruct, valEstruct,
        inclCocina, valCocina, banos, valBano,
        inclVent, valVent, inclHoja, valHoja,
        inclApoyos, valApoyo, cantApoyos, viaticos,
      },
      extras: Object.fromEntries(Object.entries(extras).filter(([, v]) => v.on).map(([k, v]) => [k, { qty: v.qty, price: v.price }])),
      comuna: selectedComuna,
      totals: {
        costoTotal: calc.costoTotal, precio, ganancia: calc.ganancia, margen: calc.margen,
        totalLog: calc.totalLog,
        breakdown: {
          fabricacion: calc.costoMods, add150: calc.cAdd150, estruct: calc.cEstruct,
          cocina: calc.cCocina, banos: calc.cBanos, ventanas: calc.cVent,
          hojalateria: calc.cHoja, apoyos: calc.cApoyos, viaticos,
        },
      },
    };
    const ok = storage.save(quote);
    setSaving(false);
    if (ok) {
      setShowModal(false);
      navigate(`/cotizacion/${quote.id}`);
    } else {
      alert("Error al guardar. Intenta de nuevo.");
    }
  };

  return (
    <div>
      <PresetChips active={activePreset} onSelect={applyPreset} />

      <Section title="Módulos">
        <SubHead>Línea 3×6 (18 m² c/u)</SubHead>
        <NumInput label="Con baño y cocina" value={m3x6bc} onChange={(v) => { setM3x6bc(v); clearPreset(); }} suffix={`× ${fmt(C.m3x6bc)}`} max={6} />
        <NumInput label="Con baño" value={m3x6b} onChange={(v) => { setM3x6b(v); clearPreset(); }} suffix={`× ${fmt(C.m3x6b)}`} max={6} />
        <NumInput label="Vacío" value={m3x6v} onChange={(v) => { setM3x6v(v); clearPreset(); }} suffix={`× ${fmt(C.m3x6v)}`} max={6} />
        <SubHead>Línea pro 3,5×7 (24,5 m² c/u)</SubHead>
        <NumInput label="Con baño" value={m35x7b} onChange={(v) => { setM35x7b(v); clearPreset(); }} suffix={`× ${fmt(C.m35x7b)}`} max={6} />
        <NumInput label="Solo (sin baño)" value={m35x7v} onChange={(v) => { setM35x7v(v); clearPreset(); }} suffix={`× ${fmt(C.m35x7v)}`} max={6} />
        <SubHead>Extensiones</SubHead>
        <Toggle label="150 cm adicionales (+4,5 m²)" checked={incl150} onChange={(v) => { setIncl150(v); clearPreset(); }} />
        {incl150 && <MoneyInput label="Valor 150 cm adicionales" value={val150} onChange={setVal150} />}
        <Toggle label="Extra estructura ventanal" checked={inclEstruct} onChange={(v) => { setInclEstruct(v); clearPreset(); }} />
        {inclEstruct && <MoneyInput label="Valor estructura ventanal" value={valEstruct} onChange={setValEstruct} />}
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          <div style={{ background: P.cardAlt, borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: P.textDim, fontFamily: font }}>Módulos</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: P.text, fontFamily: font }}>{totalModulos}</div>
          </div>
          <div style={{ background: P.cardAlt, borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: P.textDim, fontFamily: font }}>m² totales</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: P.accent, fontFamily: font }}>{mt2}</div>
          </div>
        </div>
      </Section>

      <Section title="Adicionales">
        <Toggle label="Mueble de cocina" checked={inclCocina} onChange={(v) => { setInclCocina(v); clearPreset(); }} />
        {inclCocina && <MoneyInput label="Valor mueble cocina" value={valCocina} onChange={setValCocina} />}
        <NumInput label="Muebles de baño (cantidad)" value={banos} onChange={(v) => { setBanos(v); clearPreset(); }} suffix={`× ${fmt(valBano)}`} min={0} max={4} />
        <MoneyInput label="Valor mueble baño (c/u)" value={valBano} onChange={setValBano} />
      </Section>

      <Section title="Ventanas y terminaciones">
        <Toggle label="Ventanas" checked={inclVent} onChange={(v) => { setInclVent(v); clearPreset(); }} />
        {inclVent && <MoneyInput label="Valor ventanas" value={valVent} onChange={setValVent} />}
        <Toggle label="Hojalatería" checked={inclHoja} onChange={(v) => { setInclHoja(v); clearPreset(); }} />
        {inclHoja && <MoneyInput label="Valor hojalatería" value={valHoja} onChange={setValHoja} />}
      </Section>

      <Section title="Logística — Apoyos">
        <Toggle label="Incluir apoyos" checked={inclApoyos} onChange={(v) => { setInclApoyos(v); clearPreset(); }} />
        {inclApoyos && (
          <>
            <MoneyInput label="Valor unitario apoyo" value={valApoyo} onChange={setValApoyo} />
            <NumInput label="Cantidad de apoyos" value={cantApoyos} onChange={(v) => { setCantApoyos(v); clearPreset(); }} min={1} max={20} />
            <div style={{ fontSize: 12, color: P.textDim, fontFamily: font, textAlign: "right", marginTop: -8 }}>
              Subtotal: {fmt(valApoyo * cantApoyos)}
            </div>
          </>
        )}
      </Section>

      <Section title="Terraza y otros">
        {EXTRAS.map((ex) => {
          const s = extras[ex.id];
          return (
            <div key={ex.id}>
              <Toggle label={ex.label} checked={s.on} onChange={() => toggleExtra(ex.id)} />
              {s.on && (
                <div style={{ paddingLeft: 12, borderLeft: `2px solid ${P.accent}`, marginBottom: 8, marginTop: 4 }}>
                  <NumInput label={`Cantidad (${ex.unit})`} value={s.qty} onChange={(v) => setExtraQty(ex.id, v)} min={1} max={999} />
                  <MoneyInput label={`Precio ${ex.priceLabel}`} value={s.price} onChange={(v) => setExtraPrice(ex.id, v)} />
                  <div style={{ fontSize: 12, color: P.textDim, fontFamily: font, textAlign: "right", marginTop: -8, marginBottom: 4 }}>
                    Subtotal: {fmt(s.qty * s.price)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Section>

      <Section title="Viáticos base">
        <MoneyInput label="Viáticos y transportes base" value={viaticos} onChange={setViaticos} note="Incluido en el costo total" />
      </Section>

      <Section title="Margen y precio de venta">
        <NumInput label="Margen objetivo (%)" value={margenObj} onChange={setMargenObj} suffix="%" min={1} max={80} note="Nunca menos que este porcentaje" />
        <div style={{ background: P.cardAlt, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
          <Line label="Precio mínimo sugerido" value={calc.precioMinimo} accent />
          <div style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 2 }}>
            Precio que garantiza al menos {margenObj}% de margen
          </div>
        </div>
        <MoneyInput label="Precio final al cliente (neto + IVA)" value={precio} onChange={setPrecio} />
        {calc.bajoMargen && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 14px", marginTop: -8 }}>
            <div style={{ fontSize: 13, color: "#DC2626", fontFamily: font, fontWeight: 700 }}>Margen bajo: {calc.margen.toFixed(1)}%</div>
            <div style={{ fontSize: 12, color: "#991B1B", fontFamily: font, marginTop: 4, lineHeight: 1.5 }}>
              Estas por debajo del {margenObj}% objetivo. Sube el precio a al menos <strong style={{ color: P.accent }}>{fmt(calc.precioMinimo)}</strong> o reduce costos.
            </div>
            <button
              onClick={() => setPrecio(calc.precioMinimo)}
              style={{
                marginTop: 10, background: P.accent, color: "#FFFFFF", border: "none", padding: "8px 16px",
                borderRadius: 6, cursor: "pointer", fontFamily: font, fontSize: 12, fontWeight: 700,
              }}
            >
              Usar precio sugerido ({fmt(calc.precioMinimo)})
            </button>
          </div>
        )}
      </Section>

      <Section title="Resumen de costos — Módulos">
        <Line label="Fabricación módulos" value={calc.costoMods} />
        {calc.cAdd150 > 0 && <Line label="150 cm adicionales" value={calc.cAdd150} />}
        {calc.cEstruct > 0 && <Line label="Extra estructura ventanal" value={calc.cEstruct} />}
        {calc.cCocina > 0 && <Line label="Mueble cocina" value={calc.cCocina} />}
        {calc.cBanos > 0 && <Line label={`Mueble(s) baño (×${banos})`} value={calc.cBanos} />}
        {calc.cVent > 0 && <Line label="Ventanas" value={calc.cVent} />}
        {calc.cHoja > 0 && <Line label="Hojalatería" value={calc.cHoja} />}
        {calc.cApoyos > 0 && <Line label={`Apoyos (×${cantApoyos})`} value={calc.cApoyos} />}
        {viaticos > 0 && <Line label="Viáticos base" value={viaticos} />}
        <Divider />
        <Line label="COSTO TOTAL MÓDULOS" value={calc.costoTotal} bold />
        <Divider />
        <Line label="Precio venta (neto + IVA)" value={precio} />
        <Line label="Ganancia" value={calc.ganancia} bold accent={!calc.bajoMargen} warn={calc.bajoMargen} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0" }}>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: font, color: calc.bajoMargen ? "#EF4444" : P.text }}>Margen</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: font, letterSpacing: "-0.02em", color: calc.bajoMargen ? "#EF4444" : P.accent }}>
              {calc.margen.toFixed(1)}%
            </span>
            {!calc.bajoMargen && <span style={{ fontSize: 10, background: "#DCFCE7", color: "#16A34A", padding: "2px 8px", borderRadius: 10, fontWeight: 700, fontFamily: font }}>OK</span>}
            {calc.bajoMargen && <span style={{ fontSize: 10, background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 10, fontWeight: 700, fontFamily: font }}>BAJO</span>}
          </div>
        </div>
      </Section>

      {calc.cExtras > 0 && (
        <Section title="Terraza y otros (aparte)" borderColor={P.warn}>
          {Object.entries(extras).filter(([, v]) => v.on).map(([id, v]) => {
            const def = EXTRAS.find((e) => e.id === id);
            return <Line key={id} label={`${def.label} (${v.qty} ${def.unit})`} value={v.qty * v.price} />;
          })}
          <Divider />
          <Line label="Total terraza y otros" value={calc.cExtras} bold accent />
          <div style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 8, textAlign: "center" }}>
            Este valor no se suma al presupuesto de módulos
          </div>
        </Section>
      )}

      <Section title="Logística por comuna (aparte)" borderColor={P.info}>
        <ComunaSearch selected={selectedComuna} onSelect={setSelectedComuna} />
        {selectedComuna ? (
          <div style={{ background: P.cardAlt, borderRadius: 8, padding: "12px 14px", marginTop: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text, fontFamily: font, marginBottom: 8 }}>
              {selectedComuna.nombre} — {selectedComuna.region}
            </div>
            <Line label="Distancia" value={`${fmtNum(selectedComuna.km)} km`} />
            <Line label="Valor izaje" value={selectedComuna.izaje} />
            <Line label="Valor transporte" value={selectedComuna.transporte} />
            <Line label="Valor Maripi" value={selectedComuna.maripi} />
            <Divider />
            <Line label="Total logística comuna" value={calc.totalLog} bold accent />
            <div style={{ fontSize: 11, color: P.textDim, fontFamily: font, marginTop: 8, textAlign: "center" }}>
              Este valor no se suma al costo total de arriba
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: P.textDim, fontFamily: font, textAlign: "center", padding: "8px 0" }}>
            Selecciona una comuna para ver costos de logística
          </div>
        )}
      </Section>

      <div style={{ position: "sticky", bottom: 0, marginTop: 20, padding: "12px 0", background: `linear-gradient(to top, ${P.bg} 60%, transparent)` }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: "100%", padding: "16px 20px", background: P.accent, color: "#FFFFFF",
            border: "none", borderRadius: 12, fontFamily: fontHeading, fontSize: 15, fontWeight: 700,
            letterSpacing: "-0.01em", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.2)",
            transition: "all .15s ease",
          }}
        >
          Generar cotización para cliente
        </button>
      </div>

      <SaveQuoteModal open={showModal} onClose={() => setShowModal(false)} onSave={handleSaveQuote} saving={saving} />
    </div>
  );
}

function CalcTerrazas() {
  const [mt2, setMt2] = useState(42);
  const [costoMt2, setCostoMt2] = useState(C.terrazaMt2);
  const [margenPct, setMargenPct] = useState(20);
  const calc = useMemo(() => {
    const pvMt2 = costoMt2 + costoMt2 * (margenPct / 100);
    const ct = costoMt2 * mt2;
    const vt = pvMt2 * mt2;
    return { pvMt2, ct, vt, g: vt - ct };
  }, [mt2, costoMt2, margenPct]);
  return (
    <div>
      <Section title="Configuración terraza">
        <NumInput label="Metros cuadrados" value={mt2} onChange={setMt2} suffix="m²" min={1} max={500} />
        <MoneyInput label="Costo por m² (Maripi)" value={costoMt2} onChange={setCostoMt2} suffix="CLP/m²" />
        <NumInput label="Margen HOMYNEST" value={margenPct} onChange={setMargenPct} suffix="%" min={0} max={100} />
      </Section>
      <Section title="Desglose">
        <Line label="Costo Maripi por m²" value={costoMt2} />
        <Line label="Precio venta por m²" value={calc.pvMt2} />
        <Divider />
        <Line label={`Pago Maripi (${mt2} m²)`} value={calc.ct} />
        <Line label="Valor venta total" value={calc.vt} bold />
        <Divider />
        <Line label="Ganancia HOMYNEST" value={calc.g} bold accent />
      </Section>
    </div>
  );
}

function CalcCasa() {
  const navigate = useNavigate();
  const [mt2, setMt2] = useState(70);
  const [ufVenta, setUfVenta] = useState(17);
  const [ufCosto, setUfCosto] = useState(13);
  const [valorUf, setValorUf] = useState(C.uf);
  const [dormitorios, setDormitorios] = useState(3);
  const [banos, setBanos] = useState(2);
  const [ancho, setAncho] = useState(5);
  const [largo, setLargo] = useState(14);
  const [precioOferta, setPrecioOferta] = useState(46990000);
  const [extras, setExtras] = useState(() =>
    EXTRAS.reduce((acc, ex) => ({ ...acc, [ex.id]: { on: false, qty: ex.defaultQty, price: ex.defaultPrice } }), {})
  );
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleExtra = (id) => setExtras((prev) => ({ ...prev, [id]: { ...prev[id], on: !prev[id].on } }));
  const setExtraQty = (id, qty) => setExtras((prev) => ({ ...prev, [id]: { ...prev[id], qty } }));
  const setExtraPrice = (id, price) => setExtras((prev) => ({ ...prev, [id]: { ...prev[id], price } }));

  const calc = useMemo(() => {
    const ufTotalVenta = ufVenta * mt2;
    const ufTotalCosto = ufCosto * mt2;
    const ventaClp = ufTotalVenta * valorUf;
    const costoClp = ufTotalCosto * valorUf;
    const gananciaClp = precioOferta - costoClp;
    const margen = precioOferta > 0 ? (gananciaClp / precioOferta) * 100 : 0;
    const cExtras = Object.entries(extras).reduce((sum, [, ex]) => sum + (ex.on ? ex.qty * ex.price : 0), 0);
    return { ufTotalVenta, ufTotalCosto, ventaClp, costoClp, gananciaClp, margen, cExtras };
  }, [mt2, ufVenta, ufCosto, valorUf, precioOferta, extras]);

  const handleSaveQuote = (clientInfo) => {
    setSaving(true);
    const dims = `${ancho} x ${largo} mt`;
    const prog = `${dormitorios} dormitorio${dormitorios > 1 ? "s" : ""}, ${banos} baño${banos > 1 ? "s" : ""}, living-comedor-cocina`;
    const quote = {
      id: genId(),
      createdAt: Date.now(),
      client: clientInfo,
      quoteType: "casa",
      modelName: `Casa de ${mt2} metros cuadrados`,
      headerText: `Valor establecido "llave en mano" de ${ufVenta} UF por metro cuadrado. UF al día: ${fmt(valorUf)}`,
      validez: DEFAULT_VALIDEZ,
      terms: [...DEFAULT_TERMS_CASA],
      totalModulos: 0, mt2,
      casa: { dims, prog, ancho, largo, dormitorios, banos, ufVenta, ufCosto, valorUf, precioOferta },
      items: {},
      extras: Object.fromEntries(Object.entries(extras).filter(([, v]) => v.on).map(([k, v]) => [k, { qty: v.qty, price: v.price }])),
      comuna: null,
      totals: {
        costoTotal: calc.costoClp, precio: precioOferta, ganancia: calc.gananciaClp, margen: calc.margen,
        totalLog: 0, breakdown: {},
      },
    };
    const ok = storage.save(quote);
    setSaving(false);
    if (ok) { setShowModal(false); navigate(`/cotizacion/${quote.id}`); }
    else alert("Error al guardar.");
  };

  return (
    <div>
      <Section title="Parámetros de la casa">
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><NumInput label="Ancho (mt)" value={ancho} onChange={setAncho} min={3} max={20} step={0.5} /></div>
          <div style={{ flex: 1 }}><NumInput label="Largo (mt)" value={largo} onChange={setLargo} min={5} max={40} step={0.5} /></div>
        </div>
        <NumInput label="Superficie total" value={mt2} onChange={setMt2} suffix="m²" min={30} max={500} />
        <MoneyInput label="Valor UF del día" value={valorUf} onChange={setValorUf} note="Actualizar según UF vigente" />
      </Section>

      <Section title="Programa">
        <NumInput label="Dormitorios" value={dormitorios} onChange={setDormitorios} min={1} max={6} />
        <NumInput label="Baños" value={banos} onChange={setBanos} min={1} max={4} />
        <div style={{ fontSize: 12, color: P.textDim, fontFamily: font, marginTop: 4 }}>
          {dormitorios} dormitorio{dormitorios > 1 ? "s" : ""}, {banos} baño{banos > 1 ? "s" : ""}, living-comedor-cocina
        </div>
      </Section>

      <Section title="Costo fábrica vs. precio venta">
        <NumInput label="Costo fabricación (UF/m²)" value={ufCosto} onChange={setUfCosto} suffix="UF/m²" min={1} max={50} step={0.5} note="Lo que cuesta fabricar" />
        <NumInput label="Precio venta (UF/m²)" value={ufVenta} onChange={setUfVenta} suffix="UF/m²" min={1} max={50} step={0.5} note="Referencia UF por m²" />
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div style={{ background: P.cardAlt, borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: P.textDim, fontFamily: font }}>Diferencia</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: P.accent, fontFamily: font }}>{(ufVenta - ufCosto).toFixed(1)} UF/m²</div>
          </div>
          <div style={{ background: P.cardAlt, borderRadius: 8, padding: "8px 14px", flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: P.textDim, fontFamily: font }}>Margen</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: calc.margen >= 18 ? P.accent : P.warn, fontFamily: font }}>{calc.margen.toFixed(1)}%</div>
          </div>
        </div>
      </Section>

      <Section title="Precio oferta">
        <MoneyInput label="Precio oferta al cliente (neto + IVA)" value={precioOferta} onChange={setPrecioOferta} />
        <div style={{ background: P.cardAlt, borderRadius: 8, padding: "10px 14px", marginTop: 4 }}>
          <Line label="Precio lista UF" value={calc.ventaClp} dim />
          <Line label="Precio oferta" value={precioOferta} bold />
        </div>
      </Section>

      <Section title="Terraza y otros">
        {EXTRAS.map((ex) => {
          const s = extras[ex.id];
          return (
            <div key={ex.id}>
              <Toggle label={ex.label} checked={s.on} onChange={() => toggleExtra(ex.id)} />
              {s.on && (
                <div style={{ paddingLeft: 12, borderLeft: `2px solid ${P.accent}`, marginBottom: 8, marginTop: 4 }}>
                  <NumInput label={`Cantidad (${ex.unit})`} value={s.qty} onChange={(v) => setExtraQty(ex.id, v)} min={1} max={999} />
                  <MoneyInput label={`Precio ${ex.priceLabel}`} value={s.price} onChange={(v) => setExtraPrice(ex.id, v)} />
                  <div style={{ fontSize: 12, color: P.textDim, fontFamily: font, textAlign: "right", marginTop: -8, marginBottom: 4 }}>
                    Subtotal: {fmt(s.qty * s.price)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Section>

      <Section title="Resumen económico">
        <Line label={`Costo fábrica (${ufCosto} UF/m²)`} value={calc.costoClp} />
        <Line label="Precio oferta" value={precioOferta} />
        <Divider />
        <Line label="Ganancia módulo" value={calc.gananciaClp} bold accent={calc.gananciaClp > 0} warn={calc.gananciaClp <= 0} />
        <Line label="Margen" value={`${calc.margen.toFixed(1)}%`} accent={calc.margen >= 18} warn={calc.margen < 18} />
        {calc.cExtras > 0 && (
          <>
            <Divider />
            <Line label="Total terraza y otros (aparte)" value={calc.cExtras} dim />
          </>
        )}
      </Section>

      <div style={{ position: "sticky", bottom: 0, marginTop: 20, padding: "12px 0", background: `linear-gradient(to top, ${P.bg} 60%, transparent)` }}>
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: "100%", padding: "16px 20px", background: P.accent, color: "#FFFFFF",
            border: "none", borderRadius: 12, fontFamily: fontHeading, fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.2)",
            transition: "all .15s ease",
          }}
        >
          Generar cotización casa
        </button>
      </div>

      <SaveQuoteModal open={showModal} onClose={() => setShowModal(false)} onSave={handleSaveQuote} saving={saving} />
    </div>
  );
}

export default function CalculatorPage() {
  const [tab, setTab] = useState("modulos");
  const tabs = [
    { key: "modulos", label: "Módulos" },
    { key: "terrazas", label: "Terrazas" },
    { key: "casa", label: "Casa Prefab." },
  ];
  return (
    <>
      <Tabs active={tab} onChange={setTab} items={tabs} />
      {tab === "modulos" && <CalcModulos />}
      {tab === "terrazas" && <CalcTerrazas />}
      {tab === "casa" && <CalcCasa />}
    </>
  );
}
