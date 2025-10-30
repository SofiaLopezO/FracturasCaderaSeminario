"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { useInvestigator } from "@/contexts/InvestigatorContext";

/* ===== helpers ===== */
const PALETTE = ["#2563eb","#10b981","#f59e0b","#ef4444","#8b5cf6","#14b8a6","#f97316","#22c55e","#e11d48","#06b6d4"];
const colorFor = (i: number) => PALETTE[i % PALETTE.length];
const getYear = (iso?: string|null) => {
  if (!iso) return NaN;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? NaN : d.getFullYear();
};
const ensure = <T,>(arr: T[], filler: T) => (arr.length ? arr : [filler]);

/* ===== UI helpers ===== */
function ChartTitle({children}:{children: React.ReactNode}) {
  return (
    <h4 className="mb-2 text-sm font-semibold text-slate-800 text-center tracking-wide">
      {children}
    </h4>
  );
}

function SoftGlow({ tone = "blue" }: { tone?: "blue" | "emerald" | "violet" | "amber" }) {
  const toneMap: Record<string, string> = {
    blue:   "bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,.18),rgba(16,185,129,.10)_45%,transparent_70%)]",
    emerald:"bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,.18),rgba(59,130,246,.10)_45%,transparent_70%)]",
    violet: "bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.20),rgba(6,182,212,.10)_45%,transparent_70%)]",
    amber:  "bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,.22),rgba(34,197,94,.10)_45%,transparent_70%)]",
  };
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div
        className={[
          "absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-70",
          toneMap[tone],
        ].join(" ")}
      />
    </div>
  );
}

function ChartBox({
  height = 256,
  children,
  glow = "blue",
}: {
  height?: number;
  children: React.ReactNode;
  glow?: "blue" | "emerald" | "violet" | "amber";
}) {
  return (
    <div className="relative w-full">
      <SoftGlow tone={glow} />
      <div className="mx-auto" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

/** ✅ Select “pill” con capas decorativas que NO capturan clics */
function SelectPill({
  value,
  onChange,
  options,
  placeholder,
  title,
}: {
  value?: number | undefined;
  onChange: (v?: number) => void;
  options: number[];
  placeholder: string;
  title: string;
}) {
  return (
    <div className="relative inline-flex items-center group">
      {/* borde degradado */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 opacity-60 group-hover:opacity-90 transition-opacity"
      />
      {/* focus ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-blue-500/0 group-focus-within:ring-blue-500/30 transition"
      />
      {/* contenido clickeable */}
      <div className="relative rounded-full bg-white/75 backdrop-blur px-3 py-1.5 shadow-sm">
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e)=>onChange(e.target.value ? Number(e.target.value) : undefined)}
            title={title}
            className="relative z-10 appearance-none pr-7 bg-transparent text-sm text-slate-700 font-medium outline-none"
          >
            <option value="">{placeholder}</option>
            {options.map((y)=><option key={y} value={y}>{y}</option>)}
          </select>
          {/* caret */}
          <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M6 8l4 4 4-4" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ChartsPanelSketchV4() {
  const { filtered } = useInvestigator();

  const years = useMemo(() => {
    const s = new Set<number>();
    filtered.forEach((m) => {
      const y = getYear(m.fecha_extraccion || (m as any).fechaIngreso || (m as any).fecha_recepcion);
      if (!isNaN(y)) s.add(y);
    });
    return Array.from(s).sort((a, b) => a - b);
  }, [filtered]);

  const [fromY, setFromY] = useState<number | undefined>(undefined);
  const [toY, setToY]     = useState<number | undefined>(undefined);

  useEffect(() => {
    if (years.length && fromY == null) setFromY(years[years.length - 1]);
  }, [years]); // eslint-disable-line

  const inTime = (m: any) => {
    const y = getYear(m.fecha_extraccion || m.fechaIngreso || m.fecha_recepcion);
    if (isNaN(y)) return false;
    if (fromY != null && toY == null) return y === fromY;
    if (fromY == null && toY != null) return y === toY;
    if (fromY != null && toY != null) return y >= fromY && y <= toY;
    return true;
  };
  const dataT = useMemo(() => filtered.filter(inTime), [filtered, fromY, toY]);

  const tipos = useMemo(() => {
    const s = new Set<string>();
    dataT.forEach((m) => s.add(m.tipo_muestra));
    return Array.from(s).sort();
  }, [dataT]);

  /* ===== (A) Promedio por parámetro ===== */
  const avgByParam = useMemo(() => {
    const mp = new Map<string, { sum: number; n: number }>();
    dataT.forEach((m) =>
      m.Resultados.forEach((r) => {
        const v = Number(r.valor);
        if (!Number.isFinite(v)) return;
        const cur = mp.get(r.parametro) ?? { sum: 0, n: 0 };
        cur.sum += v; cur.n += 1;
        mp.set(r.parametro, cur);
      })
    );
    const rows = Array.from(mp.entries())
      .map(([parametro, { sum, n }]) => ({ parametro, promedio: sum / Math.max(1, n) }))
      .sort((a, b) => a.parametro.localeCompare(b.parametro));
    return ensure(rows, { parametro: "—", promedio: 0 });
  }, [dataT]);

  /* ===== (B) Tortas: Laboratorio vs Imagen ===== */
  // Normalización y helpers de clasificación (con sinónimos)
  const norm = (s?: string) =>
    (s ?? "")
      .toString()
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const LAB_SET = new Set([
    "SANGRE","SANGRE TOTAL","SANGRE_CAPILAR","SANGRE VENOSA","SANGRE VENOSA CITRATADA","SANGRE VENOSA EDTA",
    "ORINA","HECES","SUERO","PLASMA","LCR","BIOPSIA","TEJIDO","SALIVA","SECRECION","OROFAST",
  ]);

  const IMG_KEYWORDS = [
    "RX","RAYOS X","RADIOGRAF","ECO","ECOGRAF","ECO-DOPPLER","DOPPLER","ULTRASON","US",
    "TAC","TOMOGRAF","RMN","RESONANCIA","ANGIO TAC","ANGIO RMN","MAMOGRAF",
  ];

  const isLab = (t: string) => LAB_SET.has(t);
  const isImg = (t: string) => IMG_KEYWORDS.some(k => t.includes(norm(k)));

  type Slice = { name: string; value: number };
  function countBy<T extends string>(arr: any[], pred: (m: any)=> T | null): Slice[] {
    const mp = new Map<string, number>();
    arr.forEach((m) => {
      const k = pred(m);
      if (!k) return;
      mp.set(k, (mp.get(k) ?? 0) + 1);
    });
    const rows = Array.from(mp.entries())
      .map(([name,value]) => ({ name, value }))
      .sort((a,b)=> b.value - a.value);
    return rows.length ? rows : [{ name:"—", value:1 }];
  }

  const pieLab = useMemo(() => {
    return countBy(dataT, (m:any) => {
      const t = norm(m?.tipo_muestra);
      if (isLab(t)) return (m.tipo_muestra as string);
      return null;
    });
  }, [dataT]);

  const pieImg = useMemo(() => {
    return countBy(dataT, (m:any) => {
      const t = norm(m?.tipo_muestra);
      if (isImg(t)) return (m.tipo_muestra as string);
      return null;
    });
  }, [dataT]);

  /* ===== (C) Fractura por sexo ===== */
  const fracturaSexo = useMemo(() => {
    const by = new Map<string, {F:number; M:number; O:number}>();
    dataT.forEach((m:any) => {
      const tf = m?.tipo_fractura as string|undefined;
      if (!tf) return;
      const sexo = (m?.sexo as string|undefined)?.toUpperCase() ?? "O";
      const row = by.get(tf) ?? {F:0, M:0, O:0};
      if (sexo.startsWith("F")) row.F++; else if (sexo.startsWith("M")) row.M++; else row.O++;
      by.set(tf, row);
    });
    const rows = Array.from(by.entries())
      .map(([tipo_fractura, v]) => ({ tipo_fractura, Femenino: v.F, Masculino: v.M, Otro: v.O }))
      .sort((a,b)=> (b.Femenino+b.Masculino+b.Otro) - (a.Femenino+a.Masculino+a.Otro));
    return ensure(rows, { tipo_fractura:"—", Femenino:0, Masculino:0, Otro:0 });
  }, [dataT]);

  /* ===== (D) Riesgo por comorbilidades / hábitos ===== */
  type BarRow = { name: string; value: number };
  function aggCategory(arr: any[], field: "comorbilidades" | "habitos"): BarRow[] {
    const hasScore = arr.some((m:any) => typeof m?.riesgo_refractura === "number");
    const mp = new Map<string, {sum:number; n:number}>();
    arr.forEach((m:any) => {
      const raw = m?.[field];
      const list: string[] =
        Array.isArray(raw) ? raw :
        typeof raw === "string" ? raw.split(",").map((x)=>x.trim()).filter(Boolean) : [];
      if (list.length === 0) return;
      list.forEach((label) => {
        const v = mp.get(label) ?? { sum:0, n:0 };
        v.sum += hasScore ? Number(m.riesgo_refractura ?? 0) : 1;
        v.n   += 1;
        mp.set(label, v);
      });
    });
    let rows = Array.from(mp.entries()).map(([name, v]) => ({
      name,
      value: arr.some((m:any)=>typeof m?.riesgo_refractura==="number")
        ? v.sum / Math.max(1, v.n) : v.sum
    }));
    rows = rows.sort((a,b)=>b.value-a.value).slice(0,12);
    return ensure(rows, { name:"—", value:0 });
  }
  const barsComorb = useMemo(()=> aggCategory(dataT, "comorbilidades"), [dataT]);
  const barsHabits = useMemo(()=> aggCategory(dataT, "habitos"), [dataT]);

  const gridStroke = "#e5e7eb";

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Encabezado + selector */}
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800"></h3>
        <div className="flex items-center gap-3">
          <SelectPill
            value={fromY}
            onChange={setFromY}
            options={years}
            placeholder="Desde…"
            title="Desde (año)"
          />
          <span className="text-slate-400">→</span>
          <SelectPill
            value={toY}
            onChange={setToY}
            options={years}
            placeholder="Hasta…"
            title="Hasta (año)"
          />
        </div>
      </div>

      {/* Fila 1 (50/50) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
          <ChartTitle>Promedio por parámetro</ChartTitle>
          <ChartBox height={260} glow="blue">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgByParam}>
                <CartesianGrid stroke={gridStroke} strokeOpacity={0.7} />
                <XAxis dataKey="parametro" interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="promedio" stroke="#2563eb" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        <div className="lg:col-span-1">
          <ChartTitle>Tipos por categoría de examen</ChartTitle>
          <div className="grid grid-cols-2 gap-6">
            {/* Laboratorio */}
            <div className="flex flex-col">
              <div className="mb-1 text-center text-xs font-semibold text-slate-700 tracking-wide">
                EXÁMENES DE LABORATORIO
              </div>
              <ChartBox height={220} glow="emerald">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pieShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
                      </filter>
                    </defs>
                    <Tooltip />
                    <g filter="url(#pieShadow)">
                      <Pie data={pieLab} dataKey="value" nameKey="name" outerRadius={90} label>
                        {pieLab.map((_, idx) => <Cell key={idx} fill={colorFor(idx)} />)}
                      </Pie>
                    </g>
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>

            {/* Imagen */}
            <div className="flex flex-col">
              <div className="mb-1 text-center text-xs font-semibold text-slate-700 tracking-wide">
                EXÁMENES DE IMAGEN
              </div>
              <ChartBox height={220} glow="violet">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="pieShadow2" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
                      </filter>
                    </defs>
                    <Tooltip />
                    <g filter="url(#pieShadow2)">
                      <Pie data={pieImg} dataKey="value" nameKey="name" outerRadius={90} label>
                        {pieImg.map((_, idx) => <Cell key={idx} fill={colorFor(idx)} />)}
                      </Pie>
                    </g>
                  </PieChart>
                </ResponsiveContainer>
              </ChartBox>
            </div>
          </div>
        </div>
      </div>

      {/* Fila 2 */}
      <div>
        <ChartTitle>Distribución por tipo de fractura (por sexo)</ChartTitle>
        <ChartBox height={300} glow="violet">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fracturaSexo}>
              <CartesianGrid stroke={gridStroke} strokeOpacity={0.7} />
              <XAxis dataKey="tipo_fractura" interval={0} angle={-15} textAnchor="end" height={40} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Femenino" fill={PALETTE[4]} radius={[8,8,0,0]} />
              <Bar dataKey="Masculino" fill={PALETTE[0]} radius={[8,8,0,0]} />
              <Bar dataKey="Otro"      fill={PALETTE[2]} radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* Fila 3 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <ChartTitle>Puntuación de riesgo de refractura — por Comorbilidades</ChartTitle>
          <ChartBox height={260} glow="amber">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barsComorb}>
                <CartesianGrid stroke={gridStroke} strokeOpacity={0.7} />
                <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={PALETTE[6]} radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        <div>
          <ChartTitle>Puntuación de riesgo de refractura — por Hábitos</ChartTitle>
          <ChartBox height={260} glow="emerald">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barsHabits}>
                <CartesianGrid stroke={gridStroke} strokeOpacity={0.7} />
                <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={PALETTE[5]} radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>
      </div>
    </div>
  );
}
