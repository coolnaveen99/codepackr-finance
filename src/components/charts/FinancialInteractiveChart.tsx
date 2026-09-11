import React, { useState, useRef, useMemo } from 'react';
import { useCurrency } from '../../lib/CurrencyContext';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Layers, 
  ChevronDown, 
  Download, 
  Check, 
  Info
} from 'lucide-react';

export type ChartType = 'line' | 'area' | 'donut' | 'bar';

export interface ChartDataPoint {
  label: string; // e.g. "Year 0", "Year 1", "Age 30"
  year: number;
  series1: number; // e.g. Future Value / Total Wealth / Maturity Corpus
  series2: number; // e.g. Total Contributions / Principal
  breakdown?: {
    interest?: number;
    principal?: number;
    [key: string]: number | undefined;
  };
}

export interface CircularSegment {
  label: string;
  value: number;
  color: string;
  percentage?: number;
  sublabel?: string;
}

export interface FinancialInteractiveChartProps {
  title?: string;
  series1Name?: string; // Default: "Future Value"
  series2Name?: string; // Default: "Total Contributions"
  series1Color?: string; // Default: #B83A24 (Investor.gov terracotta red)
  series2Color?: string; // Default: #388E8E (Investor.gov teal)
  data: ChartDataPoint[];
  donutSegments?: CircularSegment[];
  centerLabel?: string;
  centerValue?: string;
  centerSub?: string;
  yAxisLabel?: string;
  sourceNote?: string;
  defaultChartType?: ChartType;
  id?: string;
  subtitle?: string;
  className?: string;
}

export const FinancialInteractiveChart: React.FC<FinancialInteractiveChartProps> = ({
  title = 'Total Savings',
  series1Name = 'Future Value',
  series2Name = 'Total Contributions',
  series1Color = '#B83A24',
  series2Color = '#388E8E',
  data,
  donutSegments,
  centerLabel = 'Total Value',
  centerValue,
  centerSub,
  yAxisLabel,
  sourceNote = 'finance.codepackr.com',
  defaultChartType = 'line',
  id = 'financial-interactive-chart',
  subtitle,
  className = '',
}) => {
  const { formatAmount, currency } = useCurrency();
  const [activeChartType, setActiveChartType] = useState<ChartType>(defaultChartType);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback if data is empty
  const validData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  // Derived calculations for scaling
  const chartMetrics = useMemo(() => {
    if (validData.length === 0) {
      return {
        minVal: 0,
        maxVal: 100,
        yTicks: [0, 25, 50, 75, 100],
      };
    }

    const allValues = validData.flatMap((d) => [d.series1, d.series2]);
    let minVal = Math.min(...allValues);
    let maxVal = Math.max(...allValues);

    // If minVal and maxVal are equal
    if (minVal === maxVal) {
      minVal = Math.max(0, minVal * 0.8);
      maxVal = maxVal * 1.2 || 100;
    }

    // Add padding to top and bottom for institutional look like investor.gov
    const range = maxVal - minVal;
    const paddedMax = maxVal + range * 0.08;
    const paddedMin = Math.max(0, minVal - range * 0.05);

    // Calculate 5-6 clean round ticks
    const tickCount = 6;
    const step = (paddedMax - paddedMin) / (tickCount - 1);
    const yTicks: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      yTicks.push(paddedMin + i * step);
    }

    return {
      minVal: paddedMin,
      maxVal: paddedMax,
      yTicks,
    };
  }, [validData]);

  // Dimensions for SVG Coordinate Space
  const svgWidth = 720;
  const svgHeight = 400;
  const margin = {
    top: 30,
    right: 35,
    bottom: 60,
    left: 95,
  };

  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Scale functions
  const getX = (index: number) => {
    if (validData.length <= 1) return margin.left + plotWidth / 2;
    return margin.left + (index / (validData.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const { minVal, maxVal } = chartMetrics;
    if (maxVal === minVal) return margin.top + plotHeight / 2;
    const normalized = (val - minVal) / (maxVal - minVal);
    // Invert SVG Y (0 is top)
    return margin.top + (1 - Math.max(0, Math.min(1, normalized))) * plotHeight;
  };

  // Build SVG Paths for Line and Area
  const linePaths = useMemo(() => {
    if (validData.length === 0) return { line1: '', line2: '', area1: '', area2: '' };

    const pts1 = validData.map((d, i) => `${getX(i).toFixed(1)},${getY(d.series1).toFixed(1)}`);
    const pts2 = validData.map((d, i) => `${getX(i).toFixed(1)},${getY(d.series2).toFixed(1)}`);

    const line1 = `M ${pts1.join(' L ')}`;
    const line2 = `M ${pts2.join(' L ')}`;

    const baselineY = margin.top + plotHeight;
    const firstX = getX(0).toFixed(1);
    const lastX = getX(validData.length - 1).toFixed(1);

    const area1 = `M ${firstX},${baselineY} L ${pts1.join(' L ')} L ${lastX},${baselineY} Z`;
    const area2 = `M ${firstX},${baselineY} L ${pts2.join(' L ')} L ${lastX},${baselineY} Z`;

    return { line1, line2, area1, area2 };
  }, [validData, chartMetrics]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['Period / Year', series1Name, series2Name, 'Difference'];
    const rows = validData.map((d) => [
      `"${d.label}"`,
      d.series1,
      d.series2,
      d.series1 - d.series2,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_chart_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2000);
  };

  // Mouse move handler for interactive crosshair & tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (validData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * svgWidth;

    // Determine closest data point
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < validData.length; i++) {
      const xPos = getX(i);
      const diff = Math.abs(svgX - xPos);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Active point for tooltip
  const activePoint = hoveredIndex !== null && validData[hoveredIndex] ? validData[hoveredIndex] : validData[validData.length - 1];

  // Helper for tick format (Investor.gov style: formatted currency)
  const formatTickAmount = (amt: number) => {
    if (Math.abs(amt) >= 1000000) {
      return `${currency.symbol}${(amt / 1000000).toFixed(amt % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (Math.abs(amt) >= 10000) {
      return `${currency.symbol}${Math.round(amt).toLocaleString()}`;
    }
    return `${currency.symbol}${Math.round(amt)}`;
  };

  // Donut chart fallback segments if not explicitly passed
  const resolvedDonutSegments = useMemo(() => {
    if (donutSegments && donutSegments.length > 0) return donutSegments;
    if (validData.length === 0) return [];
    const last = validData[validData.length - 1];
    const principal = last.series2;
    const gain = Math.max(0, last.series1 - last.series2);
    const total = principal + gain || 1;

    return [
      {
        label: series2Name,
        value: principal,
        color: series2Color,
        percentage: (principal / total) * 100,
        sublabel: 'Total invested principal',
      },
      {
        label: `${series1Name} (Returns)`,
        value: gain,
        color: series1Color,
        percentage: (gain / total) * 100,
        sublabel: 'Compounded wealth gain',
      },
    ];
  }, [donutSegments, validData, series1Name, series2Name, series1Color, series2Color]);

  // Donut calculations
  const donutMetrics = useMemo(() => {
    const total = resolvedDonutSegments.reduce((sum, s) => sum + s.value, 0) || 1;
    const radius = 68;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const segmentsWithDash = resolvedDonutSegments.map((s) => {
      const frac = Math.max(0, s.value) / total;
      const dash = frac * circumference;
      const offset = accumulatedOffset;
      accumulatedOffset += dash;
      return {
        ...s,
        dash,
        offset,
        circumference,
      };
    });

    return { total, radius, circumference, segmentsWithDash };
  }, [resolvedDonutSegments]);

  return (
    <div
      id={id}
      ref={containerRef}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--line)',
      }}
    >
      {/* Top Header: Title, Chart Selector Dropdown, Export */}
      <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--brand)]/10 text-[var(--brand)]">
            {activeChartType === 'line' && <TrendingUp className="w-4 h-4" />}
            {activeChartType === 'area' && <Layers className="w-4 h-4" />}
            {activeChartType === 'donut' && <PieChart className="w-4 h-4" />}
            {activeChartType === 'bar' && <BarChart3 className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--ink)] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-[var(--muted)] font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Chart Switcher Dropdown & CSV Export */}
        <div className="flex items-center gap-2 relative">
          {/* Chart Type Dropdown */}
          <div className="relative">
            <button
              id={`${id}-chart-type-btn`}
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer hover:border-[var(--brand)]"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--line)',
                color: 'var(--ink)',
              }}
              aria-expanded={dropdownOpen}
              aria-label="Select financial chart type"
            >
              <span className="flex items-center gap-1.5">
                {activeChartType === 'line' && (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-[#B83A24]" />
                    <span>Growth Trend (Default)</span>
                  </>
                )}
                {activeChartType === 'area' && (
                  <>
                    <Layers className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <span>Area Projection</span>
                  </>
                )}
                {activeChartType === 'donut' && (
                  <>
                    <PieChart className="w-3.5 h-3.5 text-[#388E8E]" />
                    <span>Circular Breakdown</span>
                  </>
                )}
                {activeChartType === 'bar' && (
                  <>
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Annual Bars</span>
                  </>
                )}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  className="absolute right-0 mt-1.5 w-56 rounded-xl border shadow-xl z-30 p-1.5 space-y-1 transition-all"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--line)',
                  }}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Chart Display Mode
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChartType('line');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition ${
                      activeChartType === 'line'
                        ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-bold'
                        : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#B83A24]" />
                      <div>
                        <div>Growth Trend (Line)</div>
                        <div className="text-[10px] text-[var(--muted)]">Investor.gov comparison</div>
                      </div>
                    </div>
                    {activeChartType === 'line' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChartType('area');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition ${
                      activeChartType === 'area'
                        ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-bold'
                        : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[var(--brand)]" />
                      <div>
                        <div>Area Projection</div>
                        <div className="text-[10px] text-[var(--muted)]">Compounded volume gap</div>
                      </div>
                    </div>
                    {activeChartType === 'area' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChartType('donut');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition ${
                      activeChartType === 'donut'
                        ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-bold'
                        : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PieChart className="w-3.5 h-3.5 text-[#388E8E]" />
                      <div>
                        <div>Circular Breakdown</div>
                        <div className="text-[10px] text-[var(--muted)]">Donut distribution & ratio</div>
                      </div>
                    </div>
                    {activeChartType === 'donut' && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveChartType('bar');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition ${
                      activeChartType === 'bar'
                        ? 'bg-[var(--brand)]/10 text-[var(--brand)] font-bold'
                        : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                      <div>
                        <div>Annual Bar Growth</div>
                        <div className="text-[10px] text-[var(--muted)]">Year-by-year comparison</div>
                      </div>
                    </div>
                    {activeChartType === 'bar' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Export Data Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-1.5 rounded-xl border text-[var(--muted)] hover:text-[var(--ink)] transition hover:border-[var(--brand)] cursor-pointer"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--line)',
            }}
            title="Download Chart Data (CSV)"
            aria-label="Download Chart Data CSV"
          >
            {copiedCsv ? <Check className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="p-4 sm:p-6">
        {/* VIEW 1: LINE CHART (DEFAULT - MATCHING INVESTOR.GOV STYLE IN UPLOADED IMAGE) */}
        {activeChartType === 'line' && (
          <div className="space-y-4">
            {/* Centered Chart Title matching user image */}
            <div className="text-center">
              <h4 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight">
                {title}
              </h4>
            </div>

            {/* Interactive SVG Chart Container */}
            <div className="relative w-full overflow-x-auto select-none">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto max-h-[380px] overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                role="img"
                aria-label={`${title} Growth Trend Chart`}
              >
                {/* Horizontal Gridlines & Y-Axis Scale */}
                {chartMetrics.yTicks.map((tickVal, idx) => {
                  const y = getY(tickVal);
                  return (
                    <g key={idx} className="transition-all duration-200">
                      {/* Grid Line */}
                      <line
                        x1={margin.left}
                        y1={y}
                        x2={svgWidth - margin.right}
                        y2={y}
                        stroke="var(--line)"
                        strokeWidth="1"
                        strokeDasharray={idx === 0 ? undefined : '2,3'}
                        className="opacity-70 dark:opacity-40"
                      />
                      {/* Y-Axis Value Label */}
                      <text
                        x={margin.left - 12}
                        y={y + 4}
                        textAnchor="end"
                        className="font-mono text-[11px] font-medium"
                        fill="var(--ink-muted)"
                      >
                        {formatTickAmount(tickVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Y-Axis Vertical Title */}
                <text
                  x={18}
                  y={margin.top + plotHeight / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 18 ${margin.top + plotHeight / 2})`}
                  className="text-xs font-semibold"
                  fill="var(--ink-muted)"
                >
                  {yAxisLabel || `Currency (${currency.code})`}
                </text>

                {/* X-Axis Baseline & Ticks */}
                <line
                  x1={margin.left}
                  y1={margin.top + plotHeight}
                  x2={svgWidth - margin.right}
                  y2={margin.top + plotHeight}
                  stroke="var(--line)"
                  strokeWidth="1.5"
                />

                {validData.map((d, i) => {
                  const x = getX(i);
                  const isHovered = hoveredIndex === i;
                  return (
                    <g key={i}>
                      {/* Vertical Tick Mark below line */}
                      <line
                        x1={x}
                        y1={margin.top + plotHeight}
                        x2={x}
                        y2={margin.top + plotHeight + 6}
                        stroke="var(--line)"
                        strokeWidth="1.5"
                      />
                      {/* X-Axis Milestone Label */}
                      <text
                        x={x}
                        y={margin.top + plotHeight + 20}
                        textAnchor="middle"
                        className={`text-[11px] font-mono transition-colors ${
                          isHovered ? 'font-bold fill-[var(--brand)]' : 'fill-[var(--ink-muted)]'
                        }`}
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}

                {/* Crosshair guide line on Hover */}
                {hoveredIndex !== null && validData[hoveredIndex] && (
                  <line
                    x1={getX(hoveredIndex)}
                    y1={margin.top}
                    x2={getX(hoveredIndex)}
                    y2={margin.top + plotHeight}
                    stroke="var(--brand)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    className="opacity-75"
                  />
                )}

                {/* Series 2 Line (Total Contributions / Principal) - Teal */}
                <path
                  d={linePaths.line2}
                  fill="none"
                  stroke={series2Color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Series 1 Line (Future Value / Total Wealth) - Terracotta Red */}
                <path
                  d={linePaths.line1}
                  fill="none"
                  stroke={series1Color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Series 2 Diamond Markers (matching Investor.gov screenshot) */}
                {validData.map((d, i) => {
                  const x = getX(i);
                  const y = getY(d.series2);
                  const isHovered = hoveredIndex === i;
                  const sz = isHovered ? 6 : 4.5;
                  return (
                    <polygon
                      key={`s2-mark-${i}`}
                      points={`${x},${y - sz} ${x + sz},${y} ${x},${y + sz} ${x - sz},${y}`}
                      fill={series2Color}
                      stroke="var(--surface)"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-transform duration-150 hover:scale-125"
                    />
                  );
                })}

                {/* Series 1 Circle Markers (matching Investor.gov screenshot) */}
                {validData.map((d, i) => {
                  const x = getX(i);
                  const y = getY(d.series1);
                  const isHovered = hoveredIndex === i;
                  return (
                    <circle
                      key={`s1-mark-${i}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4.5}
                      fill={series1Color}
                      stroke="var(--surface)"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-transform duration-150 hover:scale-125"
                    />
                  );
                })}

                {/* Invisible Hover Hitboxes for better UX */}
                {validData.map((_, i) => {
                  const x = getX(i);
                  const w = validData.length > 1 ? plotWidth / (validData.length - 1) : plotWidth;
                  return (
                    <rect
                      key={`hitbox-${i}`}
                      x={x - w / 2}
                      y={margin.top}
                      width={w}
                      height={plotHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                    />
                  );
                })}
              </svg>

              {/* Interactive Tooltip Card */}
              {activePoint && hoveredIndex !== null && (
                <div
                  className="absolute top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 pointer-events-none p-3 rounded-xl border shadow-lg backdrop-blur-md z-10 transition-all text-xs"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--line)',
                  }}
                >
                  <div className="font-bold text-[var(--ink)] border-b pb-1 mb-1.5 flex items-center justify-between gap-4"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <span>{activePoint.label}</span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      Net Gain: +{formatAmount(Math.max(0, activePoint.series1 - activePoint.series2))}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-[var(--muted)]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: series1Color }} />
                        {series1Name}:
                      </span>
                      <span className="font-mono font-bold text-[var(--ink)]">
                        {formatAmount(activePoint.series1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5 text-[var(--muted)]">
                        <span className="w-2 h-2 rotate-45" style={{ backgroundColor: series2Color }} />
                        {series2Name}:
                      </span>
                      <span className="font-mono font-bold text-[var(--ink)]">
                        {formatAmount(activePoint.series2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Legend & Watermark matching Investor.gov screenshot */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              {/* Centered Legend */}
              <div className="flex-1 flex flex-wrap items-center justify-center gap-6 font-medium text-[var(--ink)]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="w-4 h-0.5" style={{ backgroundColor: series1Color }} />
                    <span className="w-2.5 h-2.5 rounded-full -ml-3" style={{ backgroundColor: series1Color }} />
                  </div>
                  <span className="text-xs font-semibold">{series1Name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="w-4 h-0.5" style={{ backgroundColor: series2Color }} />
                    <span className="w-2 h-2 rotate-45 -ml-3" style={{ backgroundColor: series2Color }} />
                  </div>
                  <span className="text-xs font-semibold">{series2Name}</span>
                </div>
              </div>

              {/* Watermark in bottom right */}
              <span className="text-[11px] font-mono text-[var(--muted)] shrink-0 opacity-80">
                {sourceNote}
              </span>
            </div>
          </div>
        )}

        {/* VIEW 2: AREA PROJECTION CHART */}
        {activeChartType === 'area' && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight">
                {title} (Cumulative Volume)
              </h4>
            </div>

            <div className="relative w-full overflow-x-auto select-none">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto max-h-[380px] overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="area-grad-s1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={series1Color} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={series1Color} stopOpacity="0.03" />
                  </linearGradient>
                  <linearGradient id="area-grad-s2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={series2Color} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={series2Color} stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines */}
                {chartMetrics.yTicks.map((tickVal, idx) => {
                  const y = getY(tickVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={margin.left}
                        y1={y}
                        x2={svgWidth - margin.right}
                        y2={y}
                        stroke="var(--line)"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                        className="opacity-70 dark:opacity-40"
                      />
                      <text
                        x={margin.left - 12}
                        y={y + 4}
                        textAnchor="end"
                        className="font-mono text-[11px] font-medium"
                        fill="var(--ink-muted)"
                      >
                        {formatTickAmount(tickVal)}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Baseline & Ticks */}
                <line
                  x1={margin.left}
                  y1={margin.top + plotHeight}
                  x2={svgWidth - margin.right}
                  y2={margin.top + plotHeight}
                  stroke="var(--line)"
                  strokeWidth="1.5"
                />

                {validData.map((d, i) => (
                  <g key={i}>
                    <line
                      x1={getX(i)}
                      y1={margin.top + plotHeight}
                      x2={getX(i)}
                      y2={margin.top + plotHeight + 6}
                      stroke="var(--line)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={getX(i)}
                      y={margin.top + plotHeight + 20}
                      textAnchor="middle"
                      className="text-[11px] font-mono fill-[var(--ink-muted)]"
                    >
                      {d.label}
                    </text>
                  </g>
                ))}

                {/* Areas */}
                <path d={linePaths.area1} fill="url(#area-grad-s1)" />
                <path d={linePaths.area2} fill="url(#area-grad-s2)" />

                {/* Lines */}
                <path d={linePaths.line2} fill="none" stroke={series2Color} strokeWidth="2.5" />
                <path d={linePaths.line1} fill="none" stroke={series1Color} strokeWidth="2.5" />

                {/* Markers */}
                {validData.map((d, i) => (
                  <circle
                    key={`c-${i}`}
                    cx={getX(i)}
                    cy={getY(d.series1)}
                    r={hoveredIndex === i ? 6 : 4}
                    fill={series1Color}
                    stroke="var(--surface)"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <div className="flex-1 flex items-center justify-center gap-6 font-medium text-[var(--ink)]">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md" style={{ backgroundColor: series1Color }} />
                  {series1Name} (Total Corpus)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md" style={{ backgroundColor: series2Color }} />
                  {series2Name} (Base Contribution)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--muted)]">
                {sourceNote}
              </span>
            </div>
          </div>
        )}

        {/* VIEW 3: CIRCULAR DONUT BREAKDOWN (THE ORIGINAL CIRCULAR CHART) */}
        {activeChartType === 'donut' && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight">
                {title} (Distribution & Split)
              </h4>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-around gap-8 pt-2">
              {/* Circular SVG Donut */}
              <div className="relative flex items-center justify-center">
                <svg width="210" height="210" viewBox="0 0 210 210" className="transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx="105"
                    cy="105"
                    r={donutMetrics.radius}
                    fill="transparent"
                    stroke="var(--line)"
                    strokeWidth="28"
                  />

                  {/* Arcs */}
                  {donutMetrics.segmentsWithDash.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="105"
                      cy="105"
                      r={donutMetrics.radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="28"
                      strokeDasharray={`${seg.dash} ${seg.circumference - seg.dash}`}
                      strokeDashoffset={-seg.offset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  ))}
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {centerLabel}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold font-mono text-[var(--ink)] leading-tight mt-0.5">
                    {centerValue || formatAmount(donutMetrics.total)}
                  </span>
                  {centerSub && (
                    <span className="text-[10px] font-mono font-medium text-[var(--brand)] mt-1">
                      {centerSub}
                    </span>
                  )}
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="flex-1 w-full max-w-sm space-y-3">
                {resolvedDonutSegments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border flex items-center justify-between transition-all"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--line)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <div>
                        <span className="text-xs font-bold block text-[var(--ink)]">
                          {seg.label}
                        </span>
                        <span className="text-[11px] text-[var(--muted)]">
                          {seg.percentage?.toFixed(1)}% {seg.sublabel ? `• ${seg.sublabel}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-[var(--ink)]">
                      {formatAmount(seg.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-[var(--muted)] pt-2 border-t"
              style={{ borderColor: 'var(--line)' }}
            >
              {sourceNote}
            </div>
          </div>
        )}

        {/* VIEW 4: ANNUAL BAR COMPARISON */}
        {activeChartType === 'bar' && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight">
                {title} (Annual Progression)
              </h4>
            </div>

            <div className="space-y-2.5 pt-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {validData.slice(0, 15).map((row, idx) => {
                const maxVal = Math.max(...validData.map((d) => d.series1), 1);
                const p1 = (row.series2 / maxVal) * 100;
                const pTotal = (row.series1 / maxVal) * 100;
                const pGrowth = Math.max(0, pTotal - p1);

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-16 text-[var(--muted)] font-semibold truncate shrink-0">
                      {row.label}
                    </span>
                    <div className="flex-1 h-5 rounded-lg overflow-hidden flex relative bg-[var(--surface)] border border-[var(--line)]">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${Math.min(100, p1)}%`, backgroundColor: series2Color }}
                        title={`${series2Name}: ${formatAmount(row.series2)}`}
                      />
                      <div
                        className="h-full transition-all"
                        style={{ width: `${Math.min(100, pGrowth)}%`, backgroundColor: series1Color }}
                        title={`${series1Name}: ${formatAmount(row.series1)}`}
                      />
                    </div>
                    <span className="w-24 text-right font-bold text-[var(--ink)] shrink-0 truncate">
                      {formatAmount(row.series1)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between text-xs border-t"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="flex items-center gap-4 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: series2Color }} />
                  {series2Name}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded" style={{ backgroundColor: series1Color }} />
                  {series1Name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--muted)]">
                {sourceNote}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
