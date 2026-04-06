import { useState, useEffect, useRef } from "react";

const C = {
  // Fondos — Negro REIN y variantes
  void: "#101010", bg: "#141414", surface: "#181818", card: "#1C1C1C",
  border: "#212724", borderHi: "#3D4D43",
  // Verde principal — paleta (RE)IN
  green: "#5A6E54",     greenDim: "#5A6E5420", greenMid: "#5A6E5445",
  greenLight: "#A3AE99",
  // Funcionales — muted para mantener la estética
  red: "#8B3A3A",       redDim: "#8B3A3A20",
  amber: "#8B6914",     amberDim: "#8B691420",
  blue: "#2A5C7A",      blueDim: "#2A5C7A20",
  purple: "#5A4E78",    purpleDim: "#5A4E7820",
  // Texto
  white: "#FAFAFA", grey: "#9FA59C", greyMid: "#212724", textDim: "#5A6E54",
  mono: "'Space Mono','Courier New',monospace",
};

// ── AIRTABLE CREDENTIALS ─────────────────────────────────────────────────────
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN || "";
const AIRTABLE_BASE  = import.meta.env.VITE_AIRTABLE_BASE  || "";
// IDs de tablas (evita problemas con emojis en los nombres)
const T = {
  clientes:      "tblaww5kxRLeij45c",
  trackerCalls:  "tblAhVrRj1io2NCvT", // ☎️ Tracker de Calls — actualizar ID si cambia
  ventas:        "tblH8tPFFvDtybQ27",
  cuotas:        "tblnf0et1luKIbWPj",
  pagos:         "tblE4XhYE8MJ48Ofi",
  gastos:        "tblceQHzM9zkZxkv9",
  eods:          "tblshbtRu0euUI96k",
};

const OFFERS = ["TODOS", "B2C REIN", "B2B REIN", "B2B ADVISORY"];
const STAGES = ["TODOS", "ACTIVO", "COMPLETADO", "EN RIESGO", "PAUSADO"];

// ── AVATAR & OFFER CONTEXT ───────────────────────────────────────────────────
const AVATAR_CONTEXT = {
  perfil: ["Dueño de agencia digital", "Fundador de SaaS", "CEO de empresa establecida", "Emprendedor con marca personal"],
  objetivo: "Generar sistemas en su negocio y escalar con IA",
  duracion: 120,
  ofertas: ["B2C REIN", "B2B REIN", "B2B ADVISORY"],
};

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_CLIENTS = [
  { id:"1", name:"Martín Rodríguez", company:"MR Agencia", offer:"B2B REIN", stage:"ACTIVO", startDate:"2026-01-15", revenue:8500, cashCollected:8500, country:"ARG", daysIn:64, platform:"Instagram", cuotas:1, payMethod:"Stripe", brandOrigin:"Federico Cristofari" },
  { id:"2", name:"Sofía Chen", company:"SC Personal Brand", offer:"B2C REIN", stage:"ACTIVO", startDate:"2026-02-01", revenue:3200, cashCollected:1600, country:"MEX", daysIn:47, platform:"YouTube", cuotas:2, payMethod:"Stripe", brandOrigin:"Federico Cristofari" },
  { id:"3", name:"Lucas Ferreira", company:"LF Consulting", offer:"B2B ADVISORY", stage:"COMPLETADO", startDate:"2025-10-10", revenue:15000, cashCollected:15000, country:"BRA", daysIn:120, platform:"Referido", cuotas:1, payMethod:"Wire", brandOrigin:"Advisory" },
  { id:"4", name:"Valentina Mora", company:"VM SaaS", offer:"B2B REIN", stage:"EN RIESGO", startDate:"2025-12-20", revenue:8500, cashCollected:4250, country:"COL", daysIn:90, platform:"Instagram", cuotas:2, payMethod:"Stripe", brandOrigin:"Federico Cristofari" },
  { id:"5", name:"Diego Salazar", company:"DS E-com", offer:"B2C REIN", stage:"ACTIVO", startDate:"2026-02-10", revenue:3200, cashCollected:3200, country:"CHI", daysIn:38, platform:"YouTube", cuotas:1, payMethod:"Mercado Pago", brandOrigin:"Federico Cristofari" },
  { id:"6", name:"Ana Torres", company:"AT Agency", offer:"B2B ADVISORY", stage:"ACTIVO", startDate:"2026-01-05", revenue:15000, cashCollected:7500, country:"ESP", daysIn:74, platform:"Instagram", cuotas:2, payMethod:"Stripe", brandOrigin:"Advisory" },
  { id:"7", name:"Pablo Gómez", company:"PG Marca", offer:"B2C REIN", stage:"PAUSADO", startDate:"2025-11-15", revenue:3200, cashCollected:3200, country:"ARG", daysIn:95, platform:"TikTok", cuotas:1, payMethod:"Mercado Pago", brandOrigin:"Federico Cristofari" },
  { id:"8", name:"Carolina Ríos", company:"CR Consulting", offer:"B2B REIN", stage:"ACTIVO", startDate:"2026-02-20", revenue:8500, cashCollected:4250, country:"PER", daysIn:28, platform:"YouTube", cuotas:2, payMethod:"Stripe", brandOrigin:"Federico Cristofari" },
];

const MOCK_INTEL = [
  { id:"1", clientId:"1", buyReason:"Quería escalar su agencia sin contratar más gente", mainFear:"Perder autenticidad al automatizar", soldMoment:"Al ver caso de estudio de agencia similar", objection:"El precio era alto para su momento", platform:"Instagram", awareness:"CONSCIENTE DEL PROBLEMA", beliefs:["La IA reemplaza trabajo humano","El contenido constante genera ventas"], payMethod:"Stripe", cuotas:1, country:"ARG", brandOrigin:"Federico Cristofari" },
  { id:"2", clientId:"2", buyReason:"Necesitaba sistematizar contenido sin agotarse", mainFear:"Sonar robótica o poco auténtica", soldMoment:"En el live cuando mostró el sistema en vivo", objection:"Dudaba si funcionaba para marcas pequeñas", platform:"YouTube", awareness:"CONSCIENTE DE LA SOLUCIÓN", beliefs:["La consistencia vence al talento","Distribución importa más que calidad"], payMethod:"Stripe", cuotas:2, country:"MEX", brandOrigin:"Federico Cristofari" },
  { id:"3", clientId:"3", buyReason:"Quería ventaja competitiva clara en 2026", mainFear:"Dependencia excesiva de una herramienta", soldMoment:"Al revisar números del caso de éxito", objection:"No sabía si tenía equipo para implementarlo", platform:"Referido", awareness:"MÁS CONSCIENTE", beliefs:["Los datos son el activo más valioso","Velocidad de implementación es clave"], payMethod:"Wire", cuotas:1, country:"BRA", brandOrigin:"Advisory" },
  { id:"4", clientId:"4", buyReason:"Escalar SaaS sin aumentar equipo de ventas", mainFear:"No tener resultados en el tiempo prometido", soldMoment:"Al ver el ROI proyectado en la llamada", objection:"Ya había probado otras soluciones sin éxito", platform:"Instagram", awareness:"CONSCIENTE DEL PROBLEMA", beliefs:["La IA es el futuro del SaaS","Los sistemas superan a las personas"], payMethod:"Stripe", cuotas:2, country:"COL", brandOrigin:"Federico Cristofari" },
];

// ── DATE HELPERS ─────────────────────────────────────────────────────────────
const MONTH_NAMES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
function toMonthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function monthDisplay(key) {
  if (!key) return key;
  const [y,m] = key.split("-");
  return `${MONTH_NAMES[parseInt(m,10)-1]} ${y}`;
}
function getMeses(items, dateField) {
  return [...new Set(items.map(i=>toMonthKey(i[dateField])).filter(Boolean))].sort().reverse();
}

// ── PRIMITIVES ───────────────────────────────────────────────────────────────
function Tag({ label, color = C.green }) {
  return <span style={{ fontFamily:C.mono, fontSize:9, fontWeight:700, letterSpacing:"0.1em", color, background:color+"18", border:`1px solid ${color}35`, padding:"2px 8px", display:"inline-block", whiteSpace:"nowrap" }}>{label}</span>;
}
function StageTag({ stage }) {
  const m = { "ACTIVO":C.green, "COMPLETADO":"#555", "EN RIESGO":C.red, "PAUSADO":C.amber };
  return <Tag label={stage} color={m[stage]||C.grey}/>;
}
function OfferTag({ offer }) {
  const m = { "B2C REIN":C.green, "B2B REIN":C.blue, "B2B ADVISORY":C.amber };
  return <Tag label={offer} color={m[offer]||C.grey}/>;
}
function Div({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
      <span style={{ fontFamily:C.mono, fontSize:8, color:C.grey, letterSpacing:"0.2em", whiteSpace:"nowrap" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}
function Bar({ value, max, color=C.green }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  return <div style={{ background:"#161616", height:2, width:"100%" }}><div style={{ width:`${pct}%`, height:"100%", background:color, boxShadow:`0 0 6px ${color}80`, transition:"width 0.8s ease" }}/></div>;
}
function KPI({ label, value, sub, color=C.green, small=false }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:"20px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${color}60,transparent)` }}/>
      <div style={{ fontFamily:C.mono, fontSize:7, letterSpacing:"0.18em", color:C.grey, marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:C.mono, fontSize:small?22:28, fontWeight:700, color, lineHeight:1, letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontFamily:C.mono, fontSize:8, color:C.grey, marginTop:7, letterSpacing:"0.06em" }}>{sub}</div>}
    </div>
  );
}

// ── DONUT CHART (SVG) ────────────────────────────────────────────────────────
function DonutChart({ data, size=160 }) {
  const total = data.reduce((s,d)=>s+d.value,0);
  if(total===0) return null;
  let offset = 0;
  const r = 58, cx = size/2, cy = size/2;
  const circumference = 2*Math.PI*r;
  const slices = data.map(d => {
    const pct = d.value/total;
    const dash = pct*circumference;
    const gap = circumference-dash;
    const slice = { ...d, dash, gap, offset, pct };
    offset += dash;
    return slice;
  });
  return (
    <div style={{ position:"relative", width:size, height:size, margin:"0 auto" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        {slices.map((s,i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={14}
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset} style={{ transition:"all 0.8s ease" }}/>
        ))}
        <circle cx={cx} cy={cy} r={44} fill={C.card}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontFamily:C.mono, fontSize:22, fontWeight:700, color:C.white, lineHeight:1 }}>{total}</div>
        <div style={{ fontFamily:C.mono, fontSize:7, color:C.grey, letterSpacing:"0.14em", marginTop:4 }}>TOTAL</div>
      </div>
    </div>
  );
}

// ── REVENUE BAR CHART ────────────────────────────────────────────────────────
function RevenueChart({ clients }) {
  const months = ["ENE","FEB","MAR"];
  const data = months.map((m,i) => ({
    m,
    rev: clients.filter(c=>new Date(c.startDate).getMonth()===i).reduce((s,c)=>s+(c.revenue||0),0),
    cash: clients.filter(c=>new Date(c.startDate).getMonth()===i).reduce((s,c)=>s+(c.cashCollected||0),0),
  }));
  const maxVal = Math.max(...data.map(d=>d.rev), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:80, padding:"0 4px" }}>
      {data.map(({m,rev,cash})=>(
        <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <div style={{ width:"100%", display:"flex", gap:2, alignItems:"flex-end", height:60 }}>
            <div style={{ flex:1, background:C.green+"60", height:`${(rev/maxVal)*100}%`, minHeight:rev>0?4:0, transition:"height 0.8s ease" }}/>
            <div style={{ flex:1, background:C.green, height:`${(cash/maxVal)*100}%`, minHeight:cash>0?4:0, boxShadow:`0 0 6px ${C.green}80`, transition:"height 0.8s ease" }}/>
          </div>
          <span style={{ fontFamily:C.mono, fontSize:7, color:C.grey, letterSpacing:"0.1em" }}>{m}</span>
        </div>
      ))}
    </div>
  );
}

// ── AIRTABLE HELPERS ─────────────────────────────────────────────────────────

// Mapea el valor de "Programa" al formato del portal
function mapPrograma(val) {
  if (!val) return "B2C REIN";
  const v = String(val).toUpperCase();
  if (v.includes("B2B") && v.includes("ADVISORY")) return "B2B ADVISORY";
  if (v.includes("B2B")) return "B2B REIN";
  return "B2C REIN"; // RE(IN), REIN, etc. → B2C por defecto
}

// Usa Reporte de Venta como fuente principal de clientes
function mapAirtableClients(records) {
  return records.map(r => {
    const f = r.fields;
    const startDate = f["📅 Fecha de Inicio en el programa"] || f["📆 Fecha de cierre"] || "";
    const start = startDate ? new Date(startDate) : new Date();
    const daysIn = Math.max(0, Math.floor((new Date() - start) / 86400000));
    const planPago = f["🧾 Plan de pago"] || "PIF";
    const cuotas = planPago==="PIF"?1:parseInt(planPago)||1;
    return {
      id:           r.id,
      name:         f["👤 Nombre Cliente"] || "Sin nombre",
      company:      f["🌏 Ubicación"] || "",
      offer:        mapPrograma(f["📦 Programa"]),
      stage:        "ACTIVO",
      startDate,
      revenue:      Number(f["💰 Total del Servicio"] || 0),
      cashCollected:Number(f["💰Cash Collected"] || 0),
      country:      f["🌏 Ubicación"] || "",
      daysIn,
      platform:     f["🛜 Fuente de Conocimiento"] || "",
      cuotas,
      payMethod:    f["💳 Método de Pago"] || "",
      brandOrigin:  f["🛜 Fuente de Conocimiento"] || "",
    };
  });
}

// Intel derivada del Reporte de Venta
function mapAirtableIntel(records) {
  return records.map(r => {
    const f = r.fields;
    return {
      id:          r.id,
      clientId:    r.id,
      buyReason:   f["🚀 Ángulo de Cierre"] || "",
      mainFear:    "",
      soldMoment:  f["🚀 Ángulo de Cierre"] || "",
      objection:   "",
      platform:    f["🛜 Fuente de Conocimiento"] || "",
      awareness:   "",
      beliefs:     [],
      payMethod:   f["💳 Método de Pago"] || "",
      cuotas:      1,
      country:     f["🌏 Ubicación"] || "",
      brandOrigin: f["🛜 Fuente de Conocimiento"] || "",
    };
  });
}

function mapAirtableVentas(records) {
  return records.map(r => {
    const f = r.fields;
    return {
      id:            r.id,
      nombre:        f["👤 Nombre Cliente"] || "",
      email:         f["📧 Email"] || "",
      fechaCierre:   f["📆 Fecha de cierre"] || "",
      fechaInicio:   f["📅 Fecha de Inicio en el programa"] || "",
      closer:        f["🙍‍♂️ Cerrado por"] || "",
      programa:      f["📦 Programa"] || "",
      fuente:        f["🛜 Fuente de Conocimiento"] || "",
      planPago:      f["🧾 Plan de pago"] || "",
      metodoPago:    f["💳 Método de Pago"] || "",
      totalServicio: Number(f["💰 Total del Servicio"] || 0),
      cashCollected: Number(f["💰Cash Collected"] || 0),
      pago1:         Number(f["💸 Pago 1"] || 0),
      pago2:         Number(f["💸Pago 2"] || 0),
      pago3:         Number(f["💸 Pago 3"] || 0),
      check1:        Boolean(f["✅ Check 1"]),
      check2:        Boolean(f["✅ Check 2"]),
      check3:        Boolean(f["✅ Check 3"]),
      anguloCierre:  f["🚀 Ángulo de Cierre"] || "",
      outstanding:   Number(f["💸 Outstanding Balance"] || 0),
      anoMes:        f["📆 Año-mes de Cierre"] || "",
    };
  });
}

function fmtDateShort(val) {
  if (!val) return "—";
  // Airtable date fields: "2026-03-27" o "2026-03-27T00:00:00.000Z"
  // Parsear sin conversión de timezone para evitar desfase de días
  const match = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [,y,m,d] = match;
    return `${d}-${m}-${y.slice(2)}`;
  }
  return val;
}

function pick(f, ...keys) {
  for (const k of keys) {
    const v = f[k];
    if (v !== undefined && v !== null && v !== "") {
      if (Array.isArray(v)) return v[0] || "";           // linked record / lookup
      if (typeof v === "object" && v.name) return v.name; // collaborator field
      return v;
    }
  }
  return "";
}

function mapAirtableTrackerCalls(records) {
  return records.map(r => {
    const f = r.fields;
    // Probar nombres con y sin emoji — Airtable a veces incluye el emoji en el nombre del campo
    const fechaAgenda  = pick(f, "Fecha de Agenda","📅 Fecha de Agenda","Fecha Agenda","fecha_agenda");
    const fechaLlamada = pick(f, "Fecha de Llamada","📅 Fecha de Llamada","Fecha Llamada","Fecha de la Llamada","fecha_llamada");
    const estado       = pick(f, "Estado","Status","estado");
    const setter       = pick(f, "Setter","setter","Owner","Responsable");
    const origen       = pick(f, "Origen","Source","origen");
    const ig           = pick(f, "@instagram","Instagram","instagram");
    return {
      id:           r.id,
      nombre:       pick(f, "Nombre","Name","nombre"),
      fechaAgenda,
      fechaLlamada,
      estado,
      setter,
      origen,
      instagram:    ig.startsWith("@") ? ig.slice(1) : ig, // evitar doble @
    };
  });
}

function mapAirtableCuotas(records) {
  return records.map(r => {
    const f = r.fields;
    return {
      id:               r.id,
      fechaPago:        f["Fecha de pago"] || "",
      alumno:           f["Nombre del Alumno"] || "",
      programa:         f["Programa"] || "",
      vertical:         f["Vertical"] || "",
      plataforma:       f["Plataforma"] || "",
      facturacionTotal: Number(f["Facturación Total"] || 0),
      montoPagado:      Number(f["Monto Pagado"] || 0),
      cashCollected:    Number(f["Cash Collected"] || 0),
      tipoPago:         f["Tipo de Pago"] || "",
      comentarios:      f["Comentarios"] || "",
      mes:              f["Mes"] || "",
    };
  });
}

function mapAirtablePagos(records) {
  return records.map(r => {
    const f = r.fields;
    return {
      id:             r.id,
      nombreCliente:  f["Nombre Cliente"] || "",
      fechaProxCuota: f["Fecha Próxima Cuota"] || "",
      totalServicio:  Number(f["Total del Servicio"] || 0),
      ccCuotas:       Number(f["CC Cuotas"] || 0),
      closer:         f["Closer"] || "",
      programa:       f["Programa"] || "",
      planPago:       f["Plan de pago"] || "",
      progresoCuotas: f["Progreso Cuotas"] || "",
      estadoCuota:    f["Estado cuota"] || "",
      pago1:          Number(f["Pago 1"] || 0),
      pago2:          Number(f["Pago 2"] || 0),
      pago3:          Number(f["Pago 3"] || 0),
      check1:         Boolean(f["Check 1"]),
      check2:         Boolean(f["Check 2"]),
      check3:         Boolean(f["Check 3"]),
      anoMes:         f["Año-Mes"] || "",
    };
  });
}

function mapAirtableGastos(records) {
  return records.map(r => {
    const f = r.fields;
    return {
      id:          r.id,
      fecha:       f["📆 Fecha de Pago"] || "",
      tipo:        f["⭐️ Tipo"] || "",
      discriminado:f["📌 Discriminado"] || "",
      categoria:   f["🗃️ Categoria"] || "",
      monto:       Number(f["💰Monto"] || 0),
      status:      f["🏎️ Status"] || "",
      importancia: f["💡 Importancia"] || "",
      metodoPago:  f["🎲 Método de Pago"] || "",
      vertical:    f["🗄️ Vertical"] || "",
      recurrencia: f["♻️ Recurrencia"] || "",
      frecuencia:  f["🗓️ Frecuencia"] || "",
      correcto:    Boolean(f["✅ Correcto"]),
      periodo:     f["Periodo"] || "",
      anoMes:      f["📆 Año-Mes Pago"] || "",
    };
  });
}

function mapAirtableEODs(records) {
  return records.map(r => {
    const f = r.fields;
    return {
      id:               r.id,
      fecha:            f["📅 Fecha"] || "",
      responsable:      f["👨🏻‍💻 Responsable"] || f["🙎‍♂️ Responsable"] || "",
      cuenta:           f["🛜 Cuenta"] || "",
      trafico:          f["🔵 Tráfico"] || "",
      chatsOut:         Number(f["📨 Chats Iniciados Outbound"] || 0),
      chatsIn:          Number(f["💬 Chats Inciados Inbound"] || 0),
      seguimientos:     Number(f["🧾 Seguimientos"] || 0),
      respuestas:       Number(f["✅ Respuestas Seguimientos"] || 0),
      respuestasUtiles: Number(f["✅  Respuestas Útiles"] || 0),
      links:            Number(f["🔗 Links Envíados"] || 0),
      llamadas:         Number(f["☎️ Llamadas Agendadas"] || 0),
      convAgenda:       Number(f["✅ % Conversión a Agenda"] || 0),
      sentimiento:      Number(f["⭐️ Cómo te Sentiste Hoy"] || 0),
      desempeno:        Number(f["⭐️ Desempeño Propio"] || 0),
      mes:              f["🟡 Mes"] || "",
    };
  });
}

async function fetchAirtableTable(token, baseId, tableName) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const headers = { Authorization: `Bearer ${token}` };
  let records = [], offset = null;
  do {
    const res = await fetch(offset ? `${url}?offset=${offset}` : url, { headers });
    if (!res.ok) throw new Error(`AIRTABLE_ERROR_${res.status}`);
    const data = await res.json();
    records = [...records, ...(data.records || [])];
    offset = data.offset || null;
  } while (offset);
  return records;
}

// ── AIRTABLE MODAL ────────────────────────────────────────────────────────────
function AirtableModal({ onConnect, onSkip, savedConfig }) {
  const [token,   setToken]   = useState(savedConfig?.token   || "");
  const [baseId,  setBaseId]  = useState(savedConfig?.baseId  || "");
  const [clientsTable, setClientsTable] = useState(savedConfig?.clientsTable || "Clients");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  async function go() {
    if (!token || !baseId) return setErr("TOKEN_Y_BASE_ID_REQUERIDOS");
    setLoading(true); setErr("");
    try {
      const records = await fetchAirtableTable(token, baseId, clientsTable);
      onConnect({ token, baseId, clientsTable, records });
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }

  const inp = (val, set, placeholder) => (
    <input value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
      style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,padding:"9px 12px",fontSize:11,color:C.white,fontFamily:C.mono,outline:"none",boxSizing:"border-box",letterSpacing:"0.03em" }}
      onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
  );

  return (
    <div style={{ position:"fixed",inset:0,background:"#000000F2",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,width:480,maxWidth:"90vw",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:C.blue,boxShadow:`0 0 20px ${C.blue}` }}/>
        <div style={{ padding:"10px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.2em",color:C.grey }}>AIRTABLE_SYNC_PROTOCOL</span>
          <div style={{ display:"flex",gap:6 }}>{[C.grey,C.grey,C.blue].map((c,i)=><div key={i} style={{ width:8,height:8,borderRadius:"50%",background:c }}/>)}</div>
        </div>
        <div style={{ padding:32 }}>
          <div style={{ fontFamily:C.mono,fontSize:22,fontWeight:700,color:C.white,letterSpacing:"-0.02em",marginBottom:4 }}>AIRTABLE</div>
          <div style={{ fontFamily:C.mono,fontSize:8,color:C.grey,letterSpacing:"0.16em",marginBottom:28 }}>LIVE_DATA_CONNECTION</div>

          <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.16em",color:C.grey,marginBottom:6 }}>PERSONAL_ACCESS_TOKEN</div>
              {inp(token, setToken, "patXXXXXXXXXXXXXX.xxxxxxxxxx")}
            </div>
            <div>
              <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.16em",color:C.grey,marginBottom:6 }}>BASE_ID</div>
              {inp(baseId, setBaseId, "appXXXXXXXXXXXXXX")}
            </div>
            <div>
              <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.16em",color:C.grey,marginBottom:6 }}>NOMBRE_DE_LA_TABLA</div>
              {inp(clientsTable, setClientsTable, "Clientes")}
            </div>
          </div>

          <div style={{ marginBottom:16,padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,fontFamily:C.mono,fontSize:8,color:C.grey,lineHeight:1.9 }}>
            → Airtable → Settings → Developer Hub → Personal tokens<br/>
            → Scope requerido: <span style={{ color:C.blue }}>data.records:read</span><br/>
            → Base ID: en la URL de tu base
          </div>

          {err && <div style={{ fontFamily:C.mono,fontSize:8,color:C.red,letterSpacing:"0.12em",marginBottom:12 }}>⚠ {err}</div>}

          <div style={{ display:"flex",gap:8 }}>
            <button onClick={go} disabled={loading} style={{ flex:1,padding:"11px",background:C.blue,border:"none",cursor:"pointer",fontFamily:C.mono,fontSize:10,fontWeight:700,letterSpacing:"0.14em",color:C.void }}>{loading?"CONECTANDO...":"CONECTAR AIRTABLE"}</button>
            <button onClick={onSkip} style={{ padding:"11px 16px",background:"transparent",border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:C.mono,fontSize:9,letterSpacing:"0.1em",color:C.grey }}>CANCELAR</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CONNECT MODAL ────────────────────────────────────────────────────────────
function ConnectModal({ onConnect, onSkip, savedConfig }) {
  const [n8nUrl, setN8nUrl] = useState(savedConfig?.n8nUrl||"");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    if(!n8nUrl) return setErr("URL_DEL_WEBHOOK_REQUERIDA");
    setLoading(true); setErr("");
    try {
      const r = await fetch(n8nUrl+"?action=getClients");
      if(!r.ok) throw new Error("WEBHOOK_NO_RESPONDE");
      onConnect({ n8nUrl });
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"#000000F2",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
      <div style={{ background:C.bg, border:`1px solid ${C.border}`, width:460, maxWidth:"90vw", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:C.green,boxShadow:`0 0 20px ${C.green}` }}/>
        <div style={{ padding:"10px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:C.mono, fontSize:8, letterSpacing:"0.2em", color:C.grey }}>SECURE_ACCESS_PROTOCOL</span>
          <div style={{ display:"flex",gap:6 }}>{[C.grey,C.grey,C.green].map((c,i)=><div key={i} style={{ width:8,height:8,borderRadius:"50%",background:c }}/>)}</div>
        </div>
        <div style={{ padding:36 }}>
          <div style={{ fontFamily:C.mono, fontSize:24, fontWeight:700, color:C.white, letterSpacing:"-0.02em", marginBottom:4 }}>(RE)IN</div>
          <div style={{ fontFamily:C.mono, fontSize:8, color:C.grey, letterSpacing:"0.16em", marginBottom:28 }}>BUSINESS_INTELLIGENCE_SYSTEM</div>

          <div style={{ marginBottom:20, padding:14, background:C.surface, border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.mono, fontSize:8, color:C.amber, letterSpacing:"0.14em", marginBottom:8 }}>CONFIGURACIÓN_N8N_WEBHOOK</div>
            <div style={{ fontFamily:C.mono, fontSize:9, color:C.grey, lineHeight:1.7 }}>
              En n8n: Webhook node → GET → activar.<br/>
              Pegá la URL del webhook acá abajo.
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:C.mono, fontSize:8, letterSpacing:"0.16em", color:C.grey, marginBottom:6 }}>N8N_WEBHOOK_URL</div>
            <input value={n8nUrl} onChange={e=>setN8nUrl(e.target.value)} placeholder="https://tu-n8n.app.n8n.cloud/webhook/..."
              style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,padding:"9px 12px",fontSize:11,color:C.white,fontFamily:C.mono,outline:"none",boxSizing:"border-box",letterSpacing:"0.03em" }}
              onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>

          {err && <div style={{ fontFamily:C.mono,fontSize:8,color:C.red,letterSpacing:"0.12em",marginBottom:12 }}>⚠ {err}</div>}

          <div style={{ fontFamily:C.mono, fontSize:8, color:C.grey, letterSpacing:"0.1em", marginBottom:20, padding:"10px 12px", background:C.surface, border:`1px solid ${C.border}`, lineHeight:1.8 }}>
            El webhook debe devolver JSON:<br/>
            {"{"}"clients": [...], "intelligence": [...]{"}"}
          </div>

          <div style={{ display:"flex",gap:8 }}>
            <button onClick={go} disabled={loading} style={{ flex:1,padding:"11px",background:C.green,border:"none",cursor:"pointer",fontFamily:C.mono,fontSize:10,fontWeight:700,letterSpacing:"0.14em",color:C.void }}>{loading?"CONECTANDO...":"ACCEDER AL SISTEMA"}</button>
            <button onClick={onSkip} style={{ padding:"11px 16px",background:"transparent",border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:C.mono,fontSize:9,letterSpacing:"0.1em",color:C.grey }}>DEMO</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ clients }) {
  const active = clients.filter(c=>c.stage==="ACTIVO");
  const atRisk = clients.filter(c=>c.stage==="EN RIESGO");
  const totalRev = clients.reduce((s,c)=>s+(c.revenue||0),0);
  const cashCol = clients.reduce((s,c)=>s+(c.cashCollected||0),0);

  const now = new Date();
  const thisMonth = clients.filter(c=>{
    const d = new Date(c.startDate);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  });
  const monthRev = thisMonth.reduce((s,c)=>s+(c.revenue||0),0);
  const monthCash = thisMonth.reduce((s,c)=>s+(c.cashCollected||0),0);

  const byOffer = [
    { label:"B2C REIN", color:C.green, value:clients.filter(c=>c.offer==="B2C REIN").length },
    { label:"B2B REIN", color:C.blue, value:clients.filter(c=>c.offer==="B2B REIN").length },
    { label:"B2B ADVISORY", color:C.amber, value:clients.filter(c=>c.offer==="B2B ADVISORY").length },
  ];

  const riskList = [...atRisk, ...clients.filter(c=>c.stage==="ACTIVO"&&(120-c.daysIn)<20)];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.green,marginBottom:8 }}>CENTRO_DE_CONTROL_OPERATIVO</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          OVERVIEW<br/><span style={{ color:C.grey,fontSize:18 }}>DEL_NEGOCIO</span>
        </div>
      </div>

      {/* Row 1: KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,marginBottom:2 }}>
        <KPI label="CLIENTES_ACTIVOS" value={active.length} sub={`${atRisk.length} EN_RIESGO`} color={C.green}/>
        <KPI label="REVENUE_TOTAL" value={`$${(totalRev/1000).toFixed(1)}K`} sub="CONTRATOS_FIRMADOS" color={C.amber}/>
        <KPI label="CASH_COLLECTED" value={`$${(cashCol/1000).toFixed(1)}K`} sub="COBRADO_REAL" color={C.green}/>
        <KPI label="VENDIDOS_ESTE_MES" value={thisMonth.length} sub={`$${monthCash.toLocaleString()} cobrado`} color={C.blue}/>
      </div>

      {/* Row 2: Clients left + Revenue chart */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2 }}>

        {/* Left: active clients per program */}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:24 }}>
          <Div label="CLIENTES_ACTIVOS_POR_PROGRAMA"/>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:20 }}>
            <DonutChart data={byOffer} size={150}/>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {byOffer.map(({label,color,value})=>(
              <div key={label} style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:6,height:6,background:color,boxShadow:`0 0 6px ${color}`,flexShrink:0 }}/>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,flex:1,letterSpacing:"0.06em" }}>{label}</span>
                <span style={{ fontFamily:C.mono,fontSize:11,color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Revenue breakdown */}
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:24,display:"flex",flexDirection:"column",gap:18 }}>
          <Div label="FINANZAS_RESUMEN"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2 }}>
            <div style={{ padding:"14px 14px",background:C.surface,border:`1px solid ${C.border}` }}>
              <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:6 }}>MES_REVENUE</div>
              <div style={{ fontFamily:C.mono,fontSize:18,fontWeight:700,color:C.amber,lineHeight:1 }}>${monthRev.toLocaleString()}</div>
            </div>
            <div style={{ padding:"14px 14px",background:C.surface,border:`1px solid ${C.border}` }}>
              <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:6 }}>MES_CASH</div>
              <div style={{ fontFamily:C.mono,fontSize:18,fontWeight:700,color:C.green,lineHeight:1 }}>${monthCash.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:10 }}>REVENUE_VS_CASH_ÚLTIMOS_3M</div>
            <RevenueChart clients={clients}/>
            <div style={{ display:"flex",gap:14,marginTop:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:8,height:2,background:C.green+"60" }}/><span style={{ fontFamily:C.mono,fontSize:7,color:C.grey }}>REVENUE</span></div>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:8,height:2,background:C.green }}/><span style={{ fontFamily:C.mono,fontSize:7,color:C.grey }}>CASH</span></div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:8 }}>COBRO_PROMEDIO</div>
            <div style={{ fontFamily:C.mono,fontSize:14,fontWeight:700,color:C.white }}>
              ${clients.length>0?(cashCol/clients.length).toFixed(0):0}
              <span style={{ fontSize:9,color:C.grey,marginLeft:6 }}>POR_CLIENTE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ background:C.card,border:`1px solid ${riskList.length>0?C.red+"50":C.border}`,padding:24 }}>
        <Div label="ALERTAS_SISTEMA"/>
        {riskList.length===0
          ? <div style={{ fontFamily:C.mono,fontSize:10,color:C.grey,letterSpacing:"0.06em" }}>// ALL_SYSTEMS_NOMINAL — SIN_ALERTAS_ACTIVAS</div>
          : riskList.slice(0,4).map(c=>(
            <div key={c.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ fontFamily:C.mono,fontSize:11,color:C.white,letterSpacing:"0.04em" }}>{c.name.toUpperCase()}</div>
                <div style={{ fontFamily:C.mono,fontSize:8,color:C.grey,letterSpacing:"0.06em",marginTop:2 }}>{c.company.toUpperCase()} · {c.offer}</div>
              </div>
              <div style={{ textAlign:"right",display:"flex",gap:10,alignItems:"center" }}>
                <StageTag stage={c.stage}/>
                <div style={{ fontFamily:C.mono,fontSize:8,color:c.stage==="EN RIESGO"?C.red:C.amber,letterSpacing:"0.08em" }}>
                  {120-c.daysIn}D_RESTANTES
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────
function ClientsBase({ clients }) {
  const [off,setOff]=useState("TODOS"); const [st,setSt]=useState("TODOS");
  const [q,setQ]=useState(""); const [sel,setSel]=useState(null);

  const filtered = clients.filter(c=>
    (off==="TODOS"||c.offer===off)&&
    (st==="TODOS"||c.stage===st)&&
    (!q||c.name?.toLowerCase().includes(q.toLowerCase())||c.company?.toLowerCase().includes(q.toLowerCase()))
  );

  function FRow({ label,opts,val,onChange }) {
    return (
      <div style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}` }}>
        <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",width:56,flexShrink:0 }}>{label}</span>
        <div style={{ display:"flex",gap:3,flexWrap:"wrap" }}>
          {opts.map(o=>(
            <button key={o} onClick={()=>onChange(o)} style={{ fontFamily:C.mono,fontSize:7,letterSpacing:"0.08em",cursor:"pointer",padding:"4px 9px",background:val===o?C.green:"transparent",color:val===o?C.void:C.grey,border:`1px solid ${val===o?C.green:C.border}`,transition:"all 0.12s" }}>{o}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.green,marginBottom:8 }}>BASE_DE_DATOS</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          CLIENTES<br/><span style={{ color:C.grey,fontSize:18 }}>{filtered.length}_REGISTROS</span>
        </div>
      </div>

      <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:18,marginBottom:2 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="BUSCAR // nombre o empresa..."
          style={{ width:"100%",background:C.surface,border:`1px solid ${C.border}`,padding:"9px 12px",fontSize:10,color:C.white,fontFamily:C.mono,outline:"none",boxSizing:"border-box",letterSpacing:"0.08em",marginBottom:8 }}
          onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
        <FRow label="OFERTA" opts={OFFERS} val={off} onChange={setOff}/>
        <FRow label="ETAPA" opts={STAGES} val={st} onChange={setSt}/>
      </div>

      <div style={{ background:C.card,border:`1px solid ${C.border}`,overflow:"auto",marginBottom:2 }}>
        <table style={{ width:"100%",borderCollapse:"collapse",minWidth:700 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}`,background:C.surface }}>
              {["CLIENTE","EMPRESA","OFERTA","REVENUE","DÍAS_EN_PROG.","ESTADO"].map(h=>(
                <th key={h} style={{ padding:"9px 14px",textAlign:"left",fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.18em",fontWeight:700,whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=>{
              const daysLeft = 120-c.daysIn;
              const pct = Math.round((c.daysIn/120)*100);
              return (
                <tr key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)}
                  style={{ borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:sel?.id===c.id?C.greenDim:"transparent",borderLeft:`2px solid ${sel?.id===c.id?C.green:"transparent"}`,transition:"all 0.12s" }}>
                  <td style={{ padding:"12px 14px",fontFamily:C.mono,fontSize:10,color:C.white,letterSpacing:"0.04em" }}>{c.name.toUpperCase()}</td>
                  <td style={{ padding:"12px 14px",fontFamily:C.mono,fontSize:9,color:C.grey }}>{c.company.toUpperCase()}</td>
                  <td style={{ padding:"12px 14px" }}><OfferTag offer={c.offer}/></td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ fontFamily:C.mono,fontSize:10,color:C.amber }}>${c.revenue?.toLocaleString()}</div>
                    <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,marginTop:2 }}>CASH: ${c.cashCollected?.toLocaleString()}</div>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                      <span style={{ fontFamily:C.mono,fontSize:9,color:daysLeft<20?C.red:C.grey }}>{c.daysIn}D / 120D</span>
                      <span style={{ fontFamily:C.mono,fontSize:8,color:daysLeft<20?C.red:C.green }}>{pct}%</span>
                    </div>
                    <Bar value={c.daysIn} max={120} color={daysLeft<20?C.red:C.green}/>
                  </td>
                  <td style={{ padding:"12px 14px" }}><StageTag stage={c.stage}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{ padding:40,fontFamily:C.mono,fontSize:10,color:C.grey,textAlign:"center",letterSpacing:"0.1em" }}>// NULL_RESULTS — AJUSTÁ LOS FILTROS</div>}
      </div>

      {sel&&(
        <div style={{ background:C.card,border:`1px solid ${C.greenMid}`,padding:22,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:C.green,boxShadow:`0 0 10px ${C.green}` }}/>
          <Div label="REGISTRO_COMPLETO"/>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14 }}>
            {[
              ["CLIENTE",sel.name.toUpperCase()],
              ["EMPRESA",sel.company.toUpperCase()],
              ["OFERTA",sel.offer],
              ["PAÍS",sel.country],
              ["PLATAFORMA",sel.platform||"—"],
              ["REVENUE",`$${sel.revenue?.toLocaleString()}`],
              ["CASH_COL.",`$${sel.cashCollected?.toLocaleString()}`],
              ["CUOTAS",sel.cuotas||"—"],
              ["MÉTODO_PAGO",sel.payMethod||"—"],
              ["MARCA_ORIGEN",sel.brandOrigin||"—"],
            ].map(([k,v])=>(
              <div key={k}><div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:4 }}>{k}</div><div style={{ fontFamily:C.mono,fontSize:10,color:C.white,letterSpacing:"0.04em" }}>{v}</div></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── INTELLIGENCE ─────────────────────────────────────────────────────────────
function Intelligence({ clients, intelligence }) {
  const [active,setActive]=useState(null);

  const platforms=[...new Set(intelligence.map(i=>i.platform))].map(p=>({p,count:intelligence.filter(i=>i.platform===p).length})).sort((a,b)=>b.count-a.count);
  const awareness=[...new Set(intelligence.map(i=>i.awareness))].map(a=>({a,count:intelligence.filter(i=>i.awareness===a).length}));
  const payMethods=[...new Set(intelligence.map(i=>i.payMethod))].map(m=>({m,count:intelligence.filter(i=>i.payMethod===m).length})).sort((a,b)=>b.count-a.count);
  const countries=[...new Set(intelligence.map(i=>i.country))].map(c=>({c,count:intelligence.filter(i=>i.country===c).length})).sort((a,b)=>b.count-a.count);
  const brands=[...new Set(intelligence.map(i=>i.brandOrigin))].map(b=>({b,count:intelligence.filter(i=>i.brandOrigin===b).length})).sort((a,b)=>b.count-a.count);
  const avgCuotas = intelligence.length>0?(intelligence.reduce((s,i)=>s+(i.cuotas||1),0)/intelligence.length).toFixed(1):"—";
  const allBeliefs = intelligence.flatMap(i=>i.beliefs||[]);
  const beliefCount = {};
  allBeliefs.forEach(b=>{beliefCount[b]=(beliefCount[b]||0)+1;});
  const topBeliefs = Object.entries(beliefCount).sort((a,b)=>b[1]-a[1]).slice(0,6);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.green,marginBottom:8 }}>NEURAL_INTELLIGENCE</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          BASE DE<br/><span style={{ color:C.grey,fontSize:20 }}>INTELIGENCIA</span>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2,marginBottom:2 }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="PLATAFORMA_ORIGEN"/>
          {platforms.map(({p,count})=>(
            <div key={p} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,letterSpacing:"0.06em" }}>{p.toUpperCase()}</span>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.green }}>{count}</span>
              </div>
              <Bar value={count} max={intelligence.length||1}/>
            </div>
          ))}
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="NIVEL_CONCIENCIA"/>
          {awareness.map(({a,count})=>(
            <div key={a} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontFamily:C.mono,fontSize:8,color:C.white,letterSpacing:"0.04em" }}>{a}</span>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.blue }}>{count}</span>
              </div>
              <Bar value={count} max={intelligence.length||1} color={C.blue}/>
            </div>
          ))}
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="PLATAFORMA_PAGO"/>
          {payMethods.map(({m,count})=>(
            <div key={m} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,letterSpacing:"0.06em" }}>{m}</span>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.amber }}>{count}</span>
              </div>
              <Bar value={count} max={intelligence.length||1} color={C.amber}/>
            </div>
          ))}
          <div style={{ marginTop:16,padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.14em",marginBottom:4 }}>CUOTAS_PROMEDIO</div>
            <div style={{ fontFamily:C.mono,fontSize:18,fontWeight:700,color:C.amber }}>{avgCuotas}x</div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2 }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="PAÍSES_DE_ORIGEN"/>
          {countries.map(({c,count},i)=>(
            <div key={c} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <span style={{ fontFamily:C.mono,fontSize:7,color:C.textDim,width:14 }}>{String(i+1).padStart(2,"0")}</span>
              <span style={{ fontFamily:C.mono,fontSize:10,color:C.white,flex:1 }}>{c}</span>
              <Bar value={count} max={intelligence.length||1}/>
              <span style={{ fontFamily:C.mono,fontSize:9,color:C.green,width:14,textAlign:"right" }}>{count}</span>
            </div>
          ))}
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="MARCA_PERSONAL_DE_ORIGEN"/>
          {brands.map(({b,count},i)=>(
            <div key={b} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <span style={{ fontFamily:C.mono,fontSize:7,color:C.textDim,width:14 }}>{String(i+1).padStart(2,"0")}</span>
              <span style={{ fontFamily:C.mono,fontSize:10,color:C.white,flex:1 }}>{b}</span>
              <Bar value={count} max={intelligence.length||1} color={C.purple}/>
              <span style={{ fontFamily:C.mono,fontSize:9,color:C.purple,width:14,textAlign:"right" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2 }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="CREENCIAS_DETECTADAS"/>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            {topBeliefs.map(([b,cnt])=>(
              <div key={b} style={{ padding:"6px 12px",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,letterSpacing:"0.04em" }}>{b.toUpperCase()}</span>
                <span style={{ fontFamily:C.mono,fontSize:8,color:C.green }}>{cnt}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
          <Div label="RAZONES_DE_COMPRA"/>
          {intelligence.map((item,i)=>(
            <div key={item.id} style={{ display:"flex",gap:12,padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,marginBottom:4 }}>
              <span style={{ fontFamily:C.mono,fontSize:7,color:C.green,flexShrink:0,marginTop:2 }}>{String(i+1).padStart(2,"0")}</span>
              <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>"{item.buyReason.toUpperCase()}"</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
        <Div label="PERFILES_INDIVIDUALES"/>
        <div style={{ display:"flex",gap:5,marginBottom:16,flexWrap:"wrap" }}>
          {intelligence.map(item=>{
            const cl=clients.find(c=>c.id===item.clientId);
            const on=active?.id===item.id;
            return <button key={item.id} onClick={()=>setActive(on?null:item)} style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.1em",cursor:"pointer",padding:"5px 12px",background:on?C.green:"transparent",color:on?C.void:C.grey,border:`1px solid ${on?C.green:C.border}` }}>{cl?.name?.toUpperCase()||"CLIENTE"}</button>;
          })}
        </div>
        {active&&(
          <div style={{ background:C.surface,border:`1px solid ${C.border}`,padding:16,borderLeft:`2px solid ${C.green}` }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
              {[["POR_QUÉ_COMPRÓ",active.buyReason],["MIEDO_PRINCIPAL",active.mainFear],["MOMENTO_DE_VENTA",active.soldMoment],["OBJECIÓN_PRINCIPAL",active.objection]].map(([k,v])=>(
                <div key={k} style={{ padding:12,background:C.card,border:`1px solid ${C.border}` }}>
                  <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.14em",marginBottom:4 }}>{k}</div>
                  <div style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{v.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.14em",marginBottom:6 }}>CREENCIAS</div>
            <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
              {active.beliefs?.map((b,i)=><Tag key={i} label={b.toUpperCase()} color={C.green}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONTENT HUB ──────────────────────────────────────────────────────────────
function ContentHub({ clients, intelligence }) {
  const [loading,setLoading]=useState(false);
  const [content,setContent]=useState(null);
  const [log,setLog]=useState([]);

  function addLog(m){ setLog(p=>[...p,`[${new Date().toLocaleTimeString()}] ${m}`]); }

  async function generateContent() {
    setLoading(true); setContent(null); setLog([]);
    addLog("ANALIZANDO_PERFILES_DE_CLIENTES...");
    const avgAwareness = [...new Set(intelligence.map(i=>i.awareness))];
    const topPlatforms = [...new Set(intelligence.map(i=>i.platform))].slice(0,3);
    const allBeliefs = intelligence.flatMap(i=>i.beliefs||[]);
    const allReasons = intelligence.map(i=>i.buyReason);
    const allFears = intelligence.map(i=>i.mainFear);
    const summary = { avatar:AVATAR_CONTEXT, totalClients:clients.length, activeClients:clients.filter(c=>c.stage==="ACTIVO").length, awarenessLevels:avgAwareness, topPlatforms, beliefs:allBeliefs, buyReasons:allReasons, fears:allFears, offers:["B2C REIN","B2B REIN","B2B ADVISORY"] };
    try {
      addLog("GENERANDO_ESTRATEGIA_DE_CONTENIDO...");
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`Sos el estratega de contenido de REIN, empresa que ayuda a dueños de agencias, fundadores de SaaS, CEOs y emprendedores a generar sistemas en sus negocios y escalar con IA. El programa dura 120 días.
Respondé ÚNICAMENTE en JSON válido sin backticks:
{"nivel_conciencia_dominante":"string","angulos_comunicacion":["a1","a2","a3","a4","a5"],"hooks_probados":["hook1","hook2","hook3"],"objeciones_a_romper":["o1","o2","o3"],"temas_contenido":["t1","t2","t3","t4","t5"],"cambios_recomendados":"string","avatar_actualizado":"descripción del avatar actualizado en base a los datos"}`,messages:[{role:"user",content:`Analizá esta data de clientes de REIN y generá la estrategia de contenido:\n${JSON.stringify(summary,null,2)}`}]})});
      addLog("PROCESANDO_DATA_DE_INTELIGENCIA...");
      const data=await res.json();
      if(data.error){ addLog("API_ERROR: "+JSON.stringify(data.error)); setContent({error:true}); setLoading(false); return; }
      const text=data.content?.find(b=>b.type==="text")?.text||"";
      if(!text){ addLog("RESPUESTA_VACIA: "+JSON.stringify(data).slice(0,200)); setContent({error:true}); setLoading(false); return; }
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      addLog("ESTRATEGIA_GENERADA ✓");
      setContent(parsed);
    } catch(e){ addLog("ERROR: "+e.message); setContent({error:true}); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.green,marginBottom:8 }}>CONTENT_INTELLIGENCE</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          CENTRO DE<br/><span style={{ color:C.grey,fontSize:20 }}>CONTROL_CONTENIDO</span>
        </div>
      </div>

      <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20,marginBottom:2 }}>
        <Div label="CONTEXTO_BASE"/>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,marginBottom:16 }}>
          <div style={{ padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:6 }}>OBJETIVO_AVATAR</div>
            <div style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{AVATAR_CONTEXT.objetivo.toUpperCase()}</div>
          </div>
          <div style={{ padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:6 }}>PERFILES_OBJETIVO</div>
            {AVATAR_CONTEXT.perfil.map((p,i)=><div key={i} style={{ fontFamily:C.mono,fontSize:8,color:C.green,lineHeight:1.8 }}>→ {p.toUpperCase()}</div>)}
          </div>
          <div style={{ padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",marginBottom:6 }}>SEÑALES_DATA</div>
            <div style={{ fontFamily:C.mono,fontSize:9,color:C.blue }}>{clients.length} CLIENTES ANALIZADOS</div>
            <div style={{ fontFamily:C.mono,fontSize:9,color:C.blue }}>{intelligence.length} PERFILES INTEL.</div>
          </div>
        </div>
        <button onClick={generateContent} disabled={loading} style={{ fontFamily:C.mono,fontSize:9,fontWeight:700,letterSpacing:"0.14em",cursor:loading?"wait":"pointer",padding:"10px 24px",background:loading?C.surface:C.green,color:loading?C.grey:C.void,border:"none",boxShadow:loading?"none":`0 0 20px ${C.green}50`,transition:"all 0.2s" }}>
          {loading?"PROCESANDO...":"⚡ GENERAR_ESTRATEGIA_CONTENIDO"}
        </button>
      </div>

      {log.length>0&&(
        <div style={{ background:C.void,border:`1px solid ${C.border}`,padding:14,marginBottom:2,fontFamily:C.mono,fontSize:10,color:C.green,lineHeight:1.9 }}>
          {log.map((l,i)=><div key={i}>{l}</div>)}
          {loading&&<span style={{ animation:"blink 1s infinite" }}>█</span>}
        </div>
      )}

      {content&&!content.error&&(
        <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
          <div style={{ background:C.card,border:`1px solid ${C.greenMid}`,padding:24,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:C.green,boxShadow:`0 0 20px ${C.green}` }}/>
            <Div label="NIVEL_CONCIENCIA_DOMINANTE"/>
            <div style={{ fontFamily:C.mono,fontSize:14,fontWeight:700,color:C.green,letterSpacing:"0.06em" }}>{content.nivel_conciencia_dominante?.toUpperCase()}</div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2 }}>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:22 }}>
              <Div label="ÁNGULOS_DE_COMUNICACIÓN"/>
              {content.angulos_comunicacion?.map((x,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:C.mono,fontSize:7,color:C.green,flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{x.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:22 }}>
              <Div label="HOOKS_PROBADOS"/>
              {content.hooks_probados?.map((x,i)=>(
                <div key={i} style={{ padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,marginBottom:6 }}>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>"{x.toUpperCase()}"</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2 }}>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:22 }}>
              <Div label="TEMAS_DE_CONTENIDO"/>
              {content.temas_contenido?.map((x,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:C.mono,fontSize:7,color:C.blue }}>→</span>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{x.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:22 }}>
              <Div label="OBJECIONES_A_ROMPER"/>
              {content.objeciones_a_romper?.map((x,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:C.mono,fontSize:7,color:C.red }}>⚠</span>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{x.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:22 }}>
            <Div label="AVATAR_ACTUALIZADO"/>
            <div style={{ fontFamily:C.mono,fontSize:10,color:C.white,lineHeight:1.8,letterSpacing:"0.04em" }}>{content.avatar_actualizado?.toUpperCase()}</div>
            {content.cambios_recomendados&&(
              <div style={{ marginTop:14,padding:"10px 12px",background:C.amberDim,border:`1px solid ${C.amber}40` }}>
                <div style={{ fontFamily:C.mono,fontSize:7,color:C.amber,letterSpacing:"0.16em",marginBottom:4 }}>CAMBIOS_RECOMENDADOS</div>
                <div style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{content.cambios_recomendados.toUpperCase()}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {content?.error&&<div style={{ background:C.redDim,border:`1px solid ${C.red}40`,padding:22,fontFamily:C.mono,fontSize:10,color:C.red }}>⚠ ERROR_GENERANDO_ESTRATEGIA</div>}
    </div>
  );
}

// ── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ clients, intelligence }) {
  const [loading,setLoading]=useState(false); const [report,setReport]=useState(null);
  const [type,setType]=useState("MENSUAL"); const [log,setLog]=useState([]);

  function addLog(m){ setLog(p=>[...p,`[${new Date().toLocaleTimeString()}] ${m}`]); }

  async function generate() {
    setLoading(true); setReport(null); setLog([]);
    addLog("INICIANDO_ANÁLISIS...");
    const summary = { avatar:AVATAR_CONTEXT, totalClients:clients.length, activeClients:clients.filter(c=>c.stage==="ACTIVO").length, byOffer:OFFERS.slice(1).map(o=>({offer:o,count:clients.filter(c=>c.offer===o).length})), revenue:clients.reduce((s,c)=>s+(c.revenue||0),0), cashCollected:clients.reduce((s,c)=>s+(c.cashCollected||0),0), buyReasons:intelligence.map(i=>i.buyReason), fears:intelligence.map(i=>i.mainFear), platforms:intelligence.map(i=>i.platform), countries:clients.map(c=>c.country), awareness:intelligence.map(i=>i.awareness), brandOrigins:intelligence.map(i=>i.brandOrigin), payMethods:intelligence.map(i=>i.payMethod) };
    try {
      addLog("CONECTANDO_MOTOR_IA...");
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`Sos analista de negocio de REIN. Respondé ÚNICAMENTE en JSON válido sin backticks:\n{"titulo":"string","resumen_ejecutivo":"2-3 oraciones directas","insights_clave":["i1","i2","i3","i4"],"avatar_ideal":"descripción directa","angulos_contenido":["a1","a2","a3"],"acciones_recomendadas":["ac1","ac2","ac3"],"alerta":"string o null"}`,messages:[{role:"user",content:`Reporte ${type} REIN:\n${JSON.stringify(summary,null,2)}`}]})});
      addLog("PROCESANDO...");
      const data=await res.json();
      if(data.error){ addLog("API_ERROR: "+JSON.stringify(data.error)); setReport({error:true}); setLoading(false); return; }
      const text=data.content?.find(b=>b.type==="text")?.text||"";
      if(!text){ addLog("RESPUESTA_VACIA: "+JSON.stringify(data).slice(0,200)); setReport({error:true}); setLoading(false); return; }
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      addLog("REPORTE_GENERADO ✓");
      setReport(parsed);
    } catch(e){ addLog("ERROR: "+e.message); setReport({error:true}); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.green,marginBottom:8 }}>NEURAL_REPORTS</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          REPORTES<br/><span style={{ color:C.grey,fontSize:20 }}>CON_IA</span>
        </div>
      </div>
      <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20,marginBottom:2,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
        {["SEMANAL","MENSUAL"].map(t=>(
          <button key={t} onClick={()=>setType(t)} style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.14em",cursor:"pointer",padding:"7px 16px",background:type===t?C.green:"transparent",color:type===t?C.void:C.grey,border:`1px solid ${type===t?C.green:C.border}` }}>{t}</button>
        ))}
        <button onClick={generate} disabled={loading} style={{ fontFamily:C.mono,fontSize:9,fontWeight:700,letterSpacing:"0.14em",cursor:loading?"wait":"pointer",padding:"9px 22px",background:loading?C.surface:C.green,color:loading?C.grey:C.void,border:"none",boxShadow:loading?"none":`0 0 20px ${C.green}50`,transition:"all 0.2s" }}>
          {loading?"PROCESANDO...":"⚡ GENERAR_REPORTE"}
        </button>
        <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey }}>{clients.length}_CLIENTES · {intelligence.length}_PERFILES</span>
      </div>
      {log.length>0&&(
        <div style={{ background:C.void,border:`1px solid ${C.border}`,padding:14,marginBottom:2,fontFamily:C.mono,fontSize:10,color:C.green,lineHeight:1.9 }}>
          {log.map((l,i)=><div key={i}>{l}</div>)}
          {loading&&<span style={{ animation:"blink 1s infinite" }}>█</span>}
        </div>
      )}
      {report&&!report.error&&(
        <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
          <div style={{ background:C.card,border:`1px solid ${C.greenMid}`,padding:24,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:1,background:C.green,boxShadow:`0 0 20px ${C.green}` }}/>
            <div style={{ fontFamily:C.mono,fontSize:8,color:C.green,letterSpacing:"0.2em",marginBottom:8 }}>REPORTE_EJECUTIVO</div>
            <div style={{ fontFamily:C.mono,fontSize:16,fontWeight:700,color:C.white,marginBottom:10 }}>{report.titulo?.toUpperCase()}</div>
            <div style={{ fontFamily:C.mono,fontSize:10,color:C.grey,lineHeight:1.8 }}>{report.resumen_ejecutivo}</div>
            {report.alerta&&<div style={{ marginTop:14,padding:"9px 12px",background:C.redDim,border:`1px solid ${C.red}40`,fontFamily:C.mono,fontSize:9,color:C.red }}>⚠ {report.alerta.toUpperCase()}</div>}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2 }}>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
              <Div label="INSIGHTS_CLAVE"/>
              {report.insights_clave?.map((x,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:C.mono,fontSize:7,color:C.green,flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{x.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
              <Div label="ACCIONES_RECOMENDADAS"/>
              {report.acciones_recomendadas?.map((x,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:C.mono,fontSize:7,color:C.green }}>→</span>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{x.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2 }}>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
              <Div label="AVATAR_IDEAL"/>
              <div style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.8 }}>{report.avatar_ideal?.toUpperCase()}</div>
            </div>
            <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:20 }}>
              <Div label="ÁNGULOS_DE_CONTENIDO"/>
              {report.angulos_contenido?.map((x,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:C.mono,fontSize:7,color:C.blue }}>#{i+1}</span>
                  <span style={{ fontFamily:C.mono,fontSize:9,color:C.white,lineHeight:1.6 }}>{x.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {report?.error&&<div style={{ background:C.redDim,border:`1px solid ${C.red}40`,padding:22,fontFamily:C.mono,fontSize:10,color:C.red }}>⚠ ERROR — VERIFICAR_CONEXIÓN</div>}
    </div>
  );
}

// ── TRACKER CALLS ─────────────────────────────────────────────────────────────
const CALL_STATUS_COLORS = {
  "Show Up": C.green, "No Show": C.red, "Cerrado": C.blue,
  "En Proceso": C.amber, "Reagendado": C.purple, "Nuevo": C.grey,
};
function TrackerCalls({ calls }) {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [filterSetter, setFilterSetter] = useState("TODOS");
  const [sortCol, setSortCol] = useState("fechaAgenda");
  const [sortDir, setSortDir] = useState("desc");

  const allEstados = ["TODOS", ...new Set(calls.map(c=>c.estado).filter(Boolean))];
  const allSetters = ["TODOS", ...new Set(calls.map(c=>c.setter).filter(Boolean))];

  const filtered = calls.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.nombre.toLowerCase().includes(q) || c.instagram.toLowerCase().includes(q) || c.setter.toLowerCase().includes(q) || c.origen.toLowerCase().includes(q);
    const matchEstado = filterEstado==="TODOS" || c.estado===filterEstado;
    const matchSetter = filterSetter==="TODOS" || c.setter===filterSetter;
    return matchSearch && matchEstado && matchSetter;
  }).sort((a,b) => {
    const va = a[sortCol]||"", vb = b[sortCol]||"";
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir==="asc" ? cmp : -cmp;
  });

  const totalCalls   = calls.length;
  const byEstado     = allEstados.filter(e=>e!=="TODOS").map(e=>({ label:e, count:calls.filter(c=>c.estado===e).length }));

  const selStyle = { fontFamily:C.mono, fontSize:9, background:C.surface, color:C.white, border:`1px solid ${C.border}`, padding:"5px 10px", cursor:"pointer", outline:"none", letterSpacing:"0.06em" };
  const thStyle  = (col) => ({ fontFamily:C.mono, fontSize:7, color: sortCol===col ? C.green : C.grey, letterSpacing:"0.12em", padding:"10px 14px", textAlign:"left", cursor:"pointer", userSelect:"none", whiteSpace:"nowrap", borderBottom:`1px solid ${C.border}`, background:C.surface });

  function toggleSort(col) {
    if(sortCol===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortCol(col); setSortDir("desc"); }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.green,marginBottom:8 }}>TRACKER_CALLS</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          TRACKER<br/><span style={{ color:C.grey,fontSize:18 }}>DE_CALLS</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${Math.min(5,1+byEstado.length)},1fr)`,gap:2,marginBottom:16 }}>
        <KPI label="TOTAL_CALLS" value={totalCalls} color={C.white}/>
        {byEstado.slice(0,4).map(e=>(
          <KPI key={e.label} label={e.label.toUpperCase().replace(/ /g,"_")} value={e.count} color={C.green}/>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,padding:"10px 16px",marginBottom:2,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Buscar nombre, Instagram, setter, origen..."
          style={{ fontFamily:C.mono,fontSize:9,background:C.card,color:C.white,border:`1px solid ${C.border}`,padding:"5px 12px",outline:"none",flex:"1",minWidth:200,letterSpacing:"0.04em" }}
        />
        <div style={{ width:1,height:20,background:C.border }}/>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.1em" }}>ESTADO</span>
          <select value={filterEstado} onChange={e=>setFilterEstado(e.target.value)} style={selStyle}>
            {allEstados.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.1em" }}>SETTER</span>
          <select value={filterSetter} onChange={e=>setFilterSetter(e.target.value)} style={selStyle}>
            {allSetters.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(filterEstado!=="TODOS"||filterSetter!=="TODOS"||search) && (
          <button onClick={()=>{setFilterEstado("TODOS");setFilterSetter("TODOS");setSearch("");}}
            style={{ fontFamily:C.mono,fontSize:7,cursor:"pointer",padding:"5px 11px",background:C.redDim,color:C.red,border:`1px solid ${C.red}40`,letterSpacing:"0.08em" }}>
            ✕ LIMPIAR
          </button>
        )}
        <span style={{ marginLeft:"auto",fontFamily:C.mono,fontSize:7,color:C.grey }}>{filtered.length} / {totalCalls} REGISTROS</span>
      </div>

      {/* Grid */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,overflowX:"auto" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {[
                {col:"nombre",       label:"NOMBRE"},
                {col:"fechaAgenda",  label:"F. AGENDA"},
                {col:"fechaLlamada", label:"F. LLAMADA"},
                {col:"estado",       label:"ESTADO"},
                {col:"setter",       label:"SETTER"},
                {col:"origen",       label:"ORIGEN"},
                {col:"instagram",    label:"INSTAGRAM"},
              ].map(({col,label})=>(
                <th key={col} style={thStyle(col)} onClick={()=>toggleSort(col)}>
                  {label}{sortCol===col ? (sortDir==="asc"?" ↑":" ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{ fontFamily:C.mono,fontSize:9,color:C.grey,padding:"28px 14px",textAlign:"center" }}>SIN RESULTADOS</td></tr>
            )}
            {filtered.map((c,i)=>{
              const stColor = CALL_STATUS_COLORS[c.estado]||C.greenLight;
              return (
                <tr key={c.id} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.surface+"80" }}>
                  <td style={{ fontFamily:C.mono,fontSize:10,color:C.white,padding:"10px 14px",fontWeight:700,whiteSpace:"nowrap" }}>{c.nombre||"—"}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.grey,padding:"10px 14px",whiteSpace:"nowrap" }}>{fmtDateShort(c.fechaAgenda)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.grey,padding:"10px 14px",whiteSpace:"nowrap" }}>{fmtDateShort(c.fechaLlamada)}</td>
                  <td style={{ padding:"10px 14px" }}><Tag label={(c.estado||"—").toUpperCase()} color={stColor}/></td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.greenLight,padding:"10px 14px",whiteSpace:"nowrap" }}>{c.setter||"—"}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.grey,padding:"10px 14px" }}>{c.origen||"—"}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.grey,padding:"10px 14px" }}>{c.instagram?`@${c.instagram}`:"—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── FINANZAS ──────────────────────────────────────────────────────────────────
function Finanzas({ ventas, gastos }) {
  const fmt = n => `$${Number(n||0).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}`;

  const totalFact  = ventas.reduce((s,v)=>s+(v.totalServicio||0),0);
  const totalCash  = ventas.reduce((s,v)=>s+(v.cashCollected||0),0);
  const totalGastos= gastos.reduce((s,g)=>s+(g.monto||0),0);
  const profit     = totalCash - totalGastos;

  const programas = [...new Set(ventas.map(v=>v.programa).filter(Boolean))];
  const byVertical = programas.map(p=>({
    programa:p,
    facturacion:ventas.filter(v=>v.programa===p).reduce((s,v)=>s+(v.totalServicio||0),0),
    cash:ventas.filter(v=>v.programa===p).reduce((s,v)=>s+(v.cashCollected||0),0),
    count:ventas.filter(v=>v.programa===p).length,
  })).sort((a,b)=>b.facturacion-a.facturacion);

  const cats = [...new Set(gastos.map(g=>g.categoria).filter(Boolean))];
  const byCategoria = cats.map(c=>({
    cat:c,
    total:gastos.filter(g=>g.categoria===c).reduce((s,g)=>s+(g.monto||0),0),
  })).sort((a,b)=>b.total-a.total);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.amber,marginBottom:8 }}>FINANCIAL_DASHBOARD</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          FINANZAS<br/><span style={{ color:C.grey,fontSize:18 }}>OVERVIEW</span>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,marginBottom:2 }}>
        <KPI label="FACTURACIÓN_TOTAL" value={fmt(totalFact)} sub="contratos firmados" color={C.amber}/>
        <KPI label="CASH_COLLECTED"    value={fmt(totalCash)}  sub={`${Math.round((totalFact?totalCash/totalFact:0)*100)}% cobrado`} color={C.green}/>
        <KPI label="TOTAL_GASTOS"      value={fmt(totalGastos)} sub="egresos" color={C.red}/>
        <KPI label="PROFIT_NETO"       value={fmt(profit)} sub="cash − gastos" color={profit>=0?C.green:C.red}/>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2 }}>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:24 }}>
          <Div label="BREAKDOWN_POR_VERTICAL"/>
          {byVertical.length===0&&<div style={{ fontFamily:C.mono,fontSize:8,color:C.grey }}>SIN_DATOS</div>}
          {byVertical.map(v=>(
            <div key={v.programa} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.white }}>{v.programa.toUpperCase()}</span>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.amber }}>{fmt(v.facturacion)}</span>
              </div>
              <Bar value={v.facturacion} max={totalFact||1} color={C.amber}/>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey }}>{v.count} ventas</span>
                <span style={{ fontFamily:C.mono,fontSize:7,color:C.green }}>Cash: {fmt(v.cash)}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:24 }}>
          <Div label="GASTOS_POR_CATEGORÍA"/>
          {byCategoria.length===0&&<div style={{ fontFamily:C.mono,fontSize:8,color:C.grey }}>SIN_DATOS</div>}
          {byCategoria.map(c=>(
            <div key={c.cat} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.white }}>{c.cat.toUpperCase()}</span>
                <span style={{ fontFamily:C.mono,fontSize:9,color:C.red }}>{fmt(c.total)}</span>
              </div>
              <Bar value={c.total} max={totalGastos||1} color={C.red}/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:C.card,border:`1px solid ${C.border}` }}>
        <div style={{ padding:"10px 16px",borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontFamily:C.mono,fontSize:8,color:C.grey,letterSpacing:"0.16em" }}>VENTAS_RECIENTES · {ventas.length} REGISTROS</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["CLIENTE","PROGRAMA","CLOSER","TOTAL","CASH","PLAN","MÉTODO","FECHA"].map(h=>(
                <th key={h} style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.12em",padding:"9px 14px",textAlign:"left",whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {ventas.map((v,i)=>(
                <tr key={v.id} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.surface }}>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.white,padding:"8px 14px",whiteSpace:"nowrap" }}>{v.nombre}</td>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.amber,padding:"8px 14px" }}>{v.programa}</td>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.grey,padding:"8px 14px" }}>{v.closer}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.amber,padding:"8px 14px",whiteSpace:"nowrap" }}>{fmt(v.totalServicio)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.green,padding:"8px 14px",whiteSpace:"nowrap" }}>{fmt(v.cashCollected)}</td>
                  <td style={{ padding:"8px 14px" }}><Tag label={v.planPago||"PIF"} color={C.blue}/></td>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.grey,padding:"8px 14px" }}>{v.metodoPago}</td>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.grey,padding:"8px 14px",whiteSpace:"nowrap" }}>{v.fechaCierre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── PAGOS / CUOTAS ────────────────────────────────────────────────────────────
function PagosCuotas({ pagos }) {
  const [filtroMes,      setFiltroMes]      = useState("TODOS");
  const [filtroPrograma, setFiltroPrograma] = useState("TODOS");
  const fmt = n => `$${Number(n||0).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}`;

  const meses    = [...new Set(pagos.map(p=>p.anoMes).filter(Boolean))].sort();
  const programas= [...new Set(pagos.map(p=>p.programa).filter(Boolean))];

  const filtered = pagos.filter(p=>{
    if(filtroMes!=="TODOS"&&p.anoMes!==filtroMes) return false;
    if(filtroPrograma!=="TODOS"&&p.programa!==filtroPrograma) return false;
    return true;
  });

  const totalOutstanding = filtered.reduce((s,p)=>s+Math.max(0,(p.totalServicio||0)-(p.ccCuotas||0)),0);
  const pendientes       = filtered.filter(p=>p.estadoCuota&&p.estadoCuota!=="Al día");
  const statusColor      = {"Al día":C.green,"Pendiente":C.amber,"Vencido":C.red};

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.amber,marginBottom:8 }}>PAYMENT_TRACKER</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          PAGOS &amp;<br/><span style={{ color:C.grey,fontSize:18 }}>CUOTAS</span>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,marginBottom:12 }}>
        <KPI label="TOTAL_REGISTROS"  value={filtered.length} color={C.blue}/>
        <KPI label="OUTSTANDING"       value={fmt(totalOutstanding)} sub="por cobrar" color={C.amber}/>
        <KPI label="PENDIENTES"        value={pendientes.length} color={C.red}/>
        <KPI label="AL_DÍA"           value={filtered.filter(p=>p.estadoCuota==="Al día").length} color={C.green}/>
      </div>
      {/* Filtros */}
      <div style={{ background:C.card,border:`1px solid ${C.border}`,padding:"10px 16px",marginBottom:2,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
        <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.12em" }}>MES:</span>
        {["TODOS",...meses].map(m=>(
          <button key={m} onClick={()=>setFiltroMes(m)} style={{ fontFamily:C.mono,fontSize:7,letterSpacing:"0.08em",cursor:"pointer",padding:"4px 10px",background:filtroMes===m?C.amber:"transparent",color:filtroMes===m?C.void:C.grey,border:`1px solid ${filtroMes===m?C.amber:C.border}` }}>{m}</button>
        ))}
        <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.12em",marginLeft:8 }}>PROGRAMA:</span>
        {["TODOS",...programas].map(p=>(
          <button key={p} onClick={()=>setFiltroPrograma(p)} style={{ fontFamily:C.mono,fontSize:7,letterSpacing:"0.08em",cursor:"pointer",padding:"4px 10px",background:filtroPrograma===p?C.blue:"transparent",color:filtroPrograma===p?C.void:C.grey,border:`1px solid ${filtroPrograma===p?C.blue:C.border}` }}>{p}</button>
        ))}
      </div>
      <div style={{ background:C.card,border:`1px solid ${C.border}` }}>
        <div style={{ padding:"10px 16px",borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontFamily:C.mono,fontSize:8,color:C.grey,letterSpacing:"0.16em" }}>SEGUIMIENTO_CUOTAS · {filtered.length} REGISTROS</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["CLIENTE","PROGRAMA","PLAN","TOTAL","COBRADO","PRÓX. CUOTA","ESTADO"].map(h=>(
                <th key={h} style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.12em",padding:"9px 14px",textAlign:"left",whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((p,i)=>{
                const color = statusColor[p.estadoCuota]||C.grey;
                return (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.surface }}>
                    <td style={{ fontFamily:C.mono,fontSize:9,color:C.white,padding:"8px 14px",whiteSpace:"nowrap" }}>{p.nombreCliente}</td>
                    <td style={{ fontFamily:C.mono,fontSize:8,color:C.amber,padding:"8px 14px" }}>{p.programa}</td>
                    <td style={{ padding:"8px 14px" }}><Tag label={p.planPago||"PIF"} color={C.blue}/></td>
                    <td style={{ fontFamily:C.mono,fontSize:9,color:C.white,padding:"8px 14px",whiteSpace:"nowrap" }}>{fmt(p.totalServicio)}</td>
                    <td style={{ fontFamily:C.mono,fontSize:9,color:C.green,padding:"8px 14px",whiteSpace:"nowrap" }}>{fmt(p.ccCuotas)}</td>
                    <td style={{ fontFamily:C.mono,fontSize:8,color:C.amber,padding:"8px 14px",whiteSpace:"nowrap" }}>{p.fechaProxCuota||"—"}</td>
                    <td style={{ padding:"8px 14px" }}><Tag label={(p.estadoCuota||"—").toUpperCase()} color={color}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── EODs ──────────────────────────────────────────────────────────────────────
function EODs({ eods }) {
  const fmt = n => Number(n||0).toLocaleString();
  const totalLlamadas  = eods.reduce((s,e)=>s+(e.llamadas||0),0);
  const avgLlamadas    = eods.length ? Math.round(totalLlamadas/eods.length) : 0;
  const avgConvAgenda  = eods.length ? (eods.reduce((s,e)=>s+(e.convAgenda||0),0)/eods.length).toFixed(1) : 0;
  const sorted         = [...eods].sort((a,b)=>new Date(b.fecha)-new Date(a.fecha));

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:C.mono,fontSize:8,letterSpacing:"0.22em",color:C.purple,marginBottom:8 }}>DAILY_OPERATIONS</div>
        <div style={{ fontFamily:C.mono,fontSize:32,fontWeight:700,color:C.white,letterSpacing:"-0.03em",lineHeight:1 }}>
          EODs<br/><span style={{ color:C.grey,fontSize:18 }}>END_OF_DAY</span>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,marginBottom:16 }}>
        <KPI label="TOTAL_EODs"          value={eods.length}       color={C.purple}/>
        <KPI label="LLAMADAS_TOTAL"       value={fmt(totalLlamadas)} color={C.green}/>
        <KPI label="PROM_LLAMADAS/DÍA"    value={avgLlamadas}        color={C.blue}/>
        <KPI label="CONV_AGENDA_PROM"     value={`${avgConvAgenda}%`} color={C.amber}/>
      </div>
      <div style={{ background:C.card,border:`1px solid ${C.border}` }}>
        <div style={{ padding:"10px 16px",borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontFamily:C.mono,fontSize:8,color:C.grey,letterSpacing:"0.16em" }}>REGISTROS_EOD · {eods.length} DÍAS</span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["FECHA","RESPONSABLE","CUENTA","CHATS OUT","CHATS IN","RESP. ÚTILES","LINKS","LLAMADAS","% AGENDA","MOOD"].map(h=>(
                <th key={h} style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.1em",padding:"9px 12px",textAlign:"left",whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sorted.map((e,i)=>(
                <tr key={e.id} style={{ borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.surface }}>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.white,padding:"8px 12px",whiteSpace:"nowrap" }}>{e.fecha}</td>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.grey,padding:"8px 12px",whiteSpace:"nowrap" }}>{e.responsable}</td>
                  <td style={{ fontFamily:C.mono,fontSize:8,color:C.blue,padding:"8px 12px" }}>{e.cuenta}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.white,padding:"8px 12px",textAlign:"center" }}>{fmt(e.chatsOut)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.white,padding:"8px 12px",textAlign:"center" }}>{fmt(e.chatsIn)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.green,padding:"8px 12px",textAlign:"center",fontWeight:700 }}>{fmt(e.respuestasUtiles)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.white,padding:"8px 12px",textAlign:"center" }}>{fmt(e.links)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.amber,padding:"8px 12px",textAlign:"center",fontWeight:700 }}>{fmt(e.llamadas)}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,color:C.purple,padding:"8px 12px",textAlign:"center" }}>{e.convAgenda?`${Number(e.convAgenda).toFixed(0)}%`:"—"}</td>
                  <td style={{ fontFamily:C.mono,fontSize:9,padding:"8px 12px",textAlign:"center",color:e.sentimiento>=4?C.green:e.sentimiento>=3?C.amber:C.red }}>{"★".repeat(e.sentimiento||0)||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── GLOBAL FILTER BAR ────────────────────────────────────────────────────────
function GlobalFilterBar({ ventas, gMes, setGMes, gPrograma, setGPrograma, onSync, syncing }) {
  const allMeses     = getMeses(ventas, "fechaCierre");
  const allProgramas = [...new Set(ventas.map(v=>v.programa).filter(Boolean))].sort();
  const active       = gMes!=="TODOS" || gPrograma!=="TODOS";

  const sel = { fontFamily:C.mono, fontSize:9, background:C.surface, color:C.white, border:`1px solid ${C.border}`, padding:"5px 10px", cursor:"pointer", outline:"none", letterSpacing:"0.06em", minWidth:140 };

  return (
    <div style={{ position:"sticky",top:0,zIndex:50,background:C.bg,borderBottom:`1px solid ${C.border}`,padding:"0 40px",display:"flex",alignItems:"center",gap:0,height:44 }}>

      {/* MES */}
      <div style={{ display:"flex",alignItems:"center",gap:10,paddingRight:20,borderRight:`1px solid ${C.border}`,height:"100%" }}>
        <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",whiteSpace:"nowrap" }}>MES</span>
        <select value={gMes} onChange={e=>setGMes(e.target.value)} style={sel}>
          <option value="TODOS">Todos los meses</option>
          {allMeses.map(m=><option key={m} value={m}>{monthDisplay(m)}</option>)}
        </select>
      </div>

      {/* PROGRAMA */}
      <div style={{ display:"flex",alignItems:"center",gap:10,paddingLeft:20,paddingRight:20,borderRight:`1px solid ${C.border}`,height:"100%" }}>
        <span style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.16em",whiteSpace:"nowrap" }}>PROGRAMA</span>
        <select value={gPrograma} onChange={e=>setGPrograma(e.target.value)} style={sel}>
          <option value="TODOS">Todos los programas</option>
          {allProgramas.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Filtro activo pill */}
      {active && (
        <div style={{ display:"flex",alignItems:"center",gap:8,paddingLeft:20 }}>
          {gMes!=="TODOS" && <span style={{ fontFamily:C.mono,fontSize:7,background:C.greenDim,color:C.green,border:`1px solid ${C.greenMid}`,padding:"3px 10px",letterSpacing:"0.08em" }}>{monthDisplay(gMes)} ×</span>}
          {gPrograma!=="TODOS" && <span style={{ fontFamily:C.mono,fontSize:7,background:C.greenDim,color:C.green,border:`1px solid ${C.greenMid}`,padding:"3px 10px",letterSpacing:"0.08em" }}>{gPrograma} ×</span>}
          <button onClick={()=>{setGMes("TODOS");setGPrograma("TODOS");}} style={{ fontFamily:C.mono,fontSize:7,cursor:"pointer",padding:"3px 10px",background:"transparent",color:C.red,border:`1px solid ${C.red}40`,letterSpacing:"0.08em" }}>LIMPIAR</button>
        </div>
      )}

      {/* Sync */}
      <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center" }}>
        {syncing && <span style={{ fontFamily:C.mono,fontSize:7,color:C.amber,letterSpacing:"0.1em",animation:"blink 1s infinite" }}>SYNCING...</span>}
        <button onClick={onSync} style={{ fontFamily:C.mono,fontSize:7,cursor:"pointer",padding:"5px 14px",background:"transparent",color:C.grey,border:`1px solid ${C.border}`,letterSpacing:"0.1em" }}>↻ SYNC</button>
      </div>
    </div>
  );
}

// ── SHELL ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",    label:"OVERVIEW",     code:"01" },
  { id:"clients",      label:"CLIENTES",     code:"02" },
  { id:"intelligence", label:"INTELIGENCIA", code:"03" },
  { id:"tracker",       label:"TRACKER CALLS", code:"04" },
  { id:"finanzas",     label:"FINANZAS",     code:"05" },
  { id:"pagos",        label:"PAGOS/CUOTAS", code:"06" },
  { id:"eods",         label:"EODs",         code:"07" },
  { id:"content",      label:"CONTENIDO",    code:"08" },
  { id:"reports",      label:"REPORTES_IA",  code:"09" },
];

export default function App() {
  const [section,setSection]=useState("dashboard");
  const [showConnect,setShowConnect]=useState(false);
  const [showAirtable,setShowAirtable]=useState(false);
  const [config,setConfig]=useState(null);
  const [airtableConfig,setAirtableConfig]=useState(()=>{
    try { return JSON.parse(localStorage.getItem("rein_airtable")||"null"); } catch{ return null; }
  });
  const [clients,setClients]=useState(MOCK_CLIENTS);
  const [intel,setIntel]=useState(MOCK_INTEL);
  const [calls,setCalls]=useState([]);
  const [ventas,setVentas]=useState([]);
  const [cuotas,setCuotas]=useState([]);
  const [pagos,setPagos]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [eods,setEods]=useState([]);
  const [syncing,setSyncing]=useState(false);
  const [syncErr,setSyncErr]=useState("");
  const [gMes,setGMes]=useState("TODOS");
  const [gPrograma,setGPrograma]=useState("TODOS");
  const [time,setTime]=useState(new Date().toLocaleTimeString());

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date().toLocaleTimeString()),1000); return ()=>clearInterval(t); },[]);

  async function fetchFromN8n(url) {
    setSyncing(true);
    try {
      const [cr,ir] = await Promise.all([
        fetch(url+"?action=getClients").then(r=>r.json()),
        fetch(url+"?action=getIntelligence").then(r=>r.json()).catch(()=>({intelligence:[]})),
      ]);
      if(cr.clients?.length>0) setClients(cr.clients);
      if(ir.intelligence?.length>0) setIntel(ir.intelligence);
    } catch(e){ console.error(e); }
    setSyncing(false);
  }

  async function syncAirtable(cfg) {
    if (!cfg) return;
    setSyncing(true); setSyncErr("");
    try {
      const [pipelineR,ventasR,cuotasR,pagosR,gastosR,eodR] = await Promise.allSettled([
        fetchAirtableTable(cfg.token, cfg.baseId, T.trackerCalls),
        fetchAirtableTable(cfg.token, cfg.baseId, T.ventas),
        fetchAirtableTable(cfg.token, cfg.baseId, T.cuotas),
        fetchAirtableTable(cfg.token, cfg.baseId, T.pagos),
        fetchAirtableTable(cfg.token, cfg.baseId, T.gastos),
        fetchAirtableTable(cfg.token, cfg.baseId, T.eods),
      ]);
      // Reporte de Venta es la fuente principal de clientes
      if(ventasR.status==="fulfilled"&&ventasR.value.length>0){
        setClients(mapAirtableClients(ventasR.value));
        setIntel(mapAirtableIntel(ventasR.value));
        setVentas(mapAirtableVentas(ventasR.value));
      }
      if(pipelineR.status==="fulfilled") setCalls(mapAirtableTrackerCalls(pipelineR.value));
      if(cuotasR.status==="fulfilled")   setCuotas(mapAirtableCuotas(cuotasR.value));
      if(pagosR.status==="fulfilled")    setPagos(mapAirtablePagos(pagosR.value));
      if(gastosR.status==="fulfilled")   setGastos(mapAirtableGastos(gastosR.value));
      if(eodR.status==="fulfilled")      setEods(mapAirtableEODs(eodR.value));
    } catch(e) { setSyncErr(e.message); console.error(e); }
    setSyncing(false);
  }

  useEffect(()=>{ if(config?.n8nUrl) fetchFromN8n(config.n8nUrl); },[config]);

  // Siempre usar las credenciales hardcodeadas (pisa cualquier config vieja)
  useEffect(()=>{
    const cfg = { token:AIRTABLE_TOKEN, baseId:AIRTABLE_BASE, clientsTable:T.clientes };
    localStorage.setItem("rein_airtable", JSON.stringify(cfg));
    setAirtableConfig(cfg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Sync Airtable on mount + every 5 minutes
  useEffect(()=>{
    if(!airtableConfig) return;
    syncAirtable(airtableConfig);
    const t = setInterval(()=>syncAirtable(airtableConfig), 5*60*1000);
    return ()=>clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[airtableConfig]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{background:#070707;font-family:'Space Mono',monospace;color:#F0F0F0;min-height:100vh;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#1C1C1C;}
        button{font-family:'Space Mono',monospace;}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes scanline{0%{top:-2px}100%{top:100vh}}
      `}</style>

      {/* CRT scanline */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden" }}>
        <div style={{ position:"absolute",left:0,right:0,height:2,background:"linear-gradient(transparent,rgba(0,232,122,0.04),transparent)",animation:"scanline 12s linear infinite" }}/>
        <div style={{ position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)" }}/>
      </div>

      {showConnect&&<ConnectModal savedConfig={config} onConnect={cfg=>{setConfig(cfg);setShowConnect(false);}} onSkip={()=>setShowConnect(false)}/>}
      {showAirtable&&<AirtableModal savedConfig={airtableConfig} onConnect={cfg=>{const c={...cfg};delete c.records;localStorage.setItem("rein_airtable",JSON.stringify(c));setAirtableConfig(c);syncAirtable(c);setShowAirtable(false);}} onSkip={()=>setShowAirtable(false)}/>}

      <div style={{ display:"flex",minHeight:"100vh" }}>
        {/* Sidebar */}
        <div style={{ width:188,background:C.bg,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",height:"100vh",zIndex:10 }}>
          <div style={{ padding:"20px 18px 16px",borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:20,fontWeight:700,color:C.white,letterSpacing:"-0.02em",lineHeight:1,fontFamily:C.mono }}>(RE)IN</div>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.green,letterSpacing:"0.2em",marginTop:4 }}>BUSINESS_INTELLIGENCE</div>
          </div>
          <div style={{ flex:1,padding:"12px 0" }}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setSection(n.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 18px",background:section===n.id?C.greenDim:"transparent",border:"none",borderLeft:`2px solid ${section===n.id?C.green:"transparent"}`,cursor:"pointer",textAlign:"left",transition:"all 0.12s" }}>
                <span style={{ fontFamily:C.mono,fontSize:7,color:section===n.id?C.green:C.textDim,letterSpacing:"0.1em" }}>{n.code}</span>
                <span style={{ fontFamily:C.mono,fontSize:9,color:section===n.id?C.green:C.grey,letterSpacing:"0.1em",fontWeight:section===n.id?700:400 }}>{n.label}</span>
              </button>
            ))}
          </div>
          <div style={{ padding:16,borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.mono,fontSize:7,color:C.grey,letterSpacing:"0.08em",marginBottom:7 }}>{time}</div>
            <button onClick={()=>setShowAirtable(true)} style={{ width:"100%",padding:"7px 10px",background:airtableConfig?C.blueDim:"transparent",border:`1px solid ${airtableConfig?C.blue:C.border}`,cursor:"pointer",fontFamily:C.mono,fontSize:7,letterSpacing:"0.12em",color:airtableConfig?C.blue:C.grey,marginBottom:4 }}>
              {airtableConfig?"● AIRTABLE_LIVE":"○ CONECTAR_AIRTABLE"}
            </button>
            <button onClick={()=>setShowConnect(true)} style={{ width:"100%",padding:"7px 10px",background:"transparent",border:`1px solid ${config?C.greenMid:C.border}`,cursor:"pointer",fontFamily:C.mono,fontSize:7,letterSpacing:"0.12em",color:config?C.green:C.grey }}>
              {config?"● N8N_CONNECTED":"○ CONECTAR_N8N"}
            </button>
            {syncing&&<div style={{ fontFamily:C.mono,fontSize:7,color:C.amber,letterSpacing:"0.1em",marginTop:5,animation:"blink 1s infinite" }}>SYNCING...</div>}
            {syncErr&&<div style={{ fontFamily:C.mono,fontSize:7,color:C.red,letterSpacing:"0.08em",marginTop:4 }}>⚠ {syncErr}</div>}
          </div>
        </div>

        {/* Main */}
        <div style={{ marginLeft:188,flex:1,maxWidth:"calc(100vw - 188px)",background:C.void,display:"flex",flexDirection:"column",minHeight:"100vh" }}>
          <GlobalFilterBar
            ventas={ventas} gMes={gMes} setGMes={setGMes}
            gPrograma={gPrograma} setGPrograma={setGPrograma}
            onSync={()=>syncAirtable(airtableConfig)} syncing={syncing}
          />
          {(()=>{
            const byMes  = x => gMes==="TODOS"     || toMonthKey(x)===gMes;
            const byProg = p => gPrograma==="TODOS" || p===gPrograma;
            const fVentas  = ventas.filter(v=>byMes(v.fechaCierre)&&byProg(v.programa));
            const fClients = clients.filter(c=>byMes(c.startDate)&&(gPrograma==="TODOS"||mapPrograma(gPrograma)===c.offer));
            const fIntel   = intel.filter((_,i)=>fClients.some(c=>c.id===clients[i]?.id));
            const fGastos  = gastos.filter(g=>byMes(g.fecha));
            const fCalls   = calls.filter(c=>byMes(c.fecha));
            const fPagos   = pagos.filter(p=>byMes(p.fechaProxCuota)&&(gPrograma==="TODOS"||p.programa===gPrograma));
            const fEods    = eods.filter(e=>byMes(e.fecha));
            return (
              <div style={{ padding:"32px 40px",flex:1 }}>
                {section==="dashboard"    &&<Dashboard clients={fClients}/>}
                {section==="clients"      &&<ClientsBase clients={fClients}/>}
                {section==="intelligence" &&<Intelligence clients={fClients} intelligence={fIntel}/>}
                {section==="tracker"      &&<TrackerCalls calls={fCalls}/>}
                {section==="finanzas"     &&<Finanzas ventas={fVentas} gastos={fGastos}/>}
                {section==="pagos"        &&<PagosCuotas pagos={fPagos}/>}
                {section==="eods"         &&<EODs eods={fEods}/>}
                {section==="content"      &&<ContentHub clients={fClients} intelligence={fIntel}/>}
                {section==="reports"      &&<Reports clients={fClients} intelligence={fIntel}/>}
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
