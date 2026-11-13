import { useState } from "react";
import {
  categoryPerformanceMock,
  chartDataByRange,
  proposalStatusBreakdown,
  type TimeRange,
} from "../../constants/mockAdminData";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

type RevenueServicesChartProps = {
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

export const RevenueServicesChart = ({
  range,
  onRangeChange,
}: RevenueServicesChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [metric, setMetric] = useState<"receita" | "servicos">("receita");

  const data = chartDataByRange[range];
  const maxVal = Math.max(
    ...data.map((d) => (metric === "receita" ? d.receita : d.servicos)),
    1,
  );

  const svgWidth = 640;
  const svgHeight = 220;
  const padX = 36;
  const padTop = 20;
  const padBottom = 32;
  const plotW = svgWidth - padX * 2;
  const plotH = svgHeight - padTop - padBottom;

  const points = data.map((d, idx) => {
    const val = metric === "receita" ? d.receita : d.servicos;
    const x =
      data.length === 1
        ? padX + plotW / 2
        : padX + (idx / (data.length - 1)) * plotW;
    const y = padTop + plotH - (val / maxVal) * plotH;
    return { x, y, val, item: d };
  });

  const linePath = points
    .map(
      (p, idx) =>
        `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`,
    )
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const activePoint =
    hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Desempenho da plataforma
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-xl font-bold text-[var(--color-navy)]">
              {metric === "receita"
                ? "Receita estimada"
                : "Serviços realizados"}
            </h2>
            <span className="text-sm font-semibold text-emerald-700">
              {metric === "receita"
                ? formatCurrency(activePoint.item.receita)
                : `${activePoint.item.servicos} serviços`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMetric("receita")}
              className={`rounded-lg px-3 py-1.5 transition ${
                metric === "receita"
                  ? "bg-white text-[var(--color-navy)] shadow-xs"
                  : "text-slate-600 hover:text-[var(--color-navy)]"
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setMetric("servicos")}
              className={`rounded-lg px-3 py-1.5 transition ${
                metric === "servicos"
                  ? "bg-white text-[var(--color-navy)] shadow-xs"
                  : "text-slate-600 hover:text-[var(--color-navy)]"
              }`}
            >
              Serviços
            </button>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {(["7d", "30d", "6m"] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRangeChange(r)}
                className={`rounded-lg px-2.5 py-1.5 uppercase transition ${
                  range === r
                    ? "bg-[var(--color-navy)] text-white shadow-xs"
                    : "text-slate-600 hover:text-[var(--color-navy)]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="h-56 w-full overflow-visible"
          role="img"
          aria-label="Gráfico de evolução de receita e serviços"
        >
          <defs>
            <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={metric === "receita" ? "#1E3A8A" : "#FFD900"}
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor={metric === "receita" ? "#1E3A8A" : "#FFD900"}
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + plotH * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={padX}
                y1={y}
                x2={svgWidth - padX}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
              />
            );
          })}

          <path d={areaPath} fill="url(#adminAreaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke={metric === "receita" ? "#1E3A8A" : "#D97706"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, idx) => {
            const isActive =
              hoveredIndex === idx ||
              (hoveredIndex === null && idx === points.length - 1);
            return (
              <g
                key={p.item.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={p.x - 24}
                  y={padTop}
                  width={48}
                  height={plotH + padBottom}
                  fill="transparent"
                />
                {isActive && (
                  <line
                    x1={p.x}
                    y1={padTop}
                    x2={p.x}
                    y2={padTop + plotH}
                    stroke="#CBD5E1"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 6 : 4}
                  fill={isActive ? "#FFD900" : "#FFFFFF"}
                  stroke={metric === "receita" ? "#1E3A8A" : "#D97706"}
                  strokeWidth="2.5"
                />
                <text
                  x={p.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px] font-medium"
                >
                  {p.item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--color-bg-light)] px-4 py-3 text-xs text-slate-600">
        <span>
          Período selecionado:{" "}
          <strong className="text-[var(--color-navy)]">
            {activePoint.item.label}
          </strong>
        </span>
        <div className="flex flex-wrap gap-4">
          <span>
            Serviços:{" "}
            <strong className="text-[var(--color-navy)]">
              {activePoint.item.servicos}
            </strong>
          </span>
          <span>
            Receita:{" "}
            <strong className="text-[var(--color-navy)]">
              {formatCurrency(activePoint.item.receita)}
            </strong>
          </span>
          <span>
            Novos cadastros:{" "}
            <strong className="text-[var(--color-navy)]">
              +{activePoint.item.novosUsuarios}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProposalStatusDonut = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const total = proposalStatusBreakdown.reduce(
    (acc, item) => acc + item.value,
    0,
  );
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const segments = proposalStatusBreakdown.reduce<
    Array<{
      label: string;
      value: number;
      color: string;
      dashLength: number;
      dashOffset: number;
      nextOffset: number;
    }>
  >((acc, item) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].nextOffset : 0;
    const fraction = item.value / total;
    const dashLength = fraction * circumference;
    const dashOffset = -prevOffset * circumference;
    acc.push({
      ...item,
      dashLength,
      dashOffset,
      nextOffset: prevOffset + fraction,
    });
    return acc;
  }, []);

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Saúde das propostas
      </p>
      <h2 className="mt-1 text-xl font-bold text-[var(--color-navy)]">
        Distribuição de status
      </h2>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
          <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
            {segments.map((item, idx) => {
              const isSelected = selectedIdx === idx;

              return (
                <circle
                  key={item.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isSelected ? 22 : 18}
                  strokeDasharray={`${item.dashLength} ${circumference - item.dashLength}`}
                  strokeDashoffset={item.dashOffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onMouseLeave={() => setSelectedIdx(null)}
                />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-[var(--color-navy)]">
              {selectedIdx !== null
                ? `${proposalStatusBreakdown[selectedIdx].value}%`
                : "91%"}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {selectedIdx !== null
                ? proposalStatusBreakdown[selectedIdx].label
                : "Conversão útil"}
            </span>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          {proposalStatusBreakdown.map((item, idx) => (
            <div
              key={item.label}
              onMouseEnter={() => setSelectedIdx(idx)}
              onMouseLeave={() => setSelectedIdx(null)}
              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                selectedIdx === idx
                  ? "bg-[var(--color-bg-light)]"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="font-bold text-[var(--color-navy)]">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CategoryDemandChart = () => {
  const maxChamados = Math.max(
    ...categoryPerformanceMock.map((c) => c.chamados),
    1,
  );

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-7">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Demanda & SLA
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--color-navy)]">
            Volume por categoria
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Últimos 30 dias
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {categoryPerformanceMock.map((cat) => {
          const widthPct = Math.round((cat.chamados / maxChamados) * 100);
          const lowCompletion = cat.conclusao < 85;
          return (
            <div key={cat.nome} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--color-navy)]">
                  {cat.nome}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Ticket: {formatCurrency(cat.ticketMedio)}</span>
                  <span
                    className={`font-semibold ${
                      lowCompletion ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    {cat.conclusao}% conclusão
                  </span>
                  <span className="font-bold text-[var(--color-navy)]">
                    {cat.chamados}
                  </span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    lowCompletion ? "bg-amber-400" : "bg-[var(--color-navy)]"
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
