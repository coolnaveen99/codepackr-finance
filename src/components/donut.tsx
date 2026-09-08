import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["var(--brand)", "var(--ok)", "var(--warn)", "var(--danger)"];

export function Donut({
  slices,
  center,
}: {
  slices: { name: string; value: number }[];
  center?: { title: string; value: string };
}) {
  const data = slices.filter((s) => s.value > 0);
  return (
    <div className="relative h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, n: string) => [v.toLocaleString(), n]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {center ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {center.title}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">{center.value}</span>
        </div>
      ) : null}
    </div>
  );
}
