import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '../../components/ui'

export const CHART_COLORS = {
  primary: '#4f46e5',
  primarySoft: '#c7d2fe',
  green: '#059669',
  amber: '#d97706',
  sky: '#0284c7',
  slate: '#94a3b8',
  rose: '#e11d48',
}

const axisProps = { tickLine: false, axisLine: false, tick: { fill: '#64748b', fontSize: 12 } }
const tooltipStyle = { borderRadius: 10, border: '1px solid #e6e8ef', boxShadow: '0 8px 20px rgba(15,23,42,0.08)', fontSize: 13 }

export function ChartCard({ title, subtitle, children, height = 280 }) {
  return (
    <div className="surface h-100">
      <div className="surface-header">
        <div>
          <h3 className="surface-title">{title}</h3>
          {subtitle && <div className="small text-muted-cp">{subtitle}</div>}
        </div>
      </div>
      <div className="surface-body" style={{ height }}>
        {children}
      </div>
    </div>
  )
}

/**
 * @param {{ data: object[], xKey: string, bars: Array<{ key: string, name: string, color?: string }>,
 *   yDomain?: [number, number], unit?: string, colorFor?: (row) => string }} props
 */
export function SimpleBarChart({ data, xKey, bars, yDomain, unit = '', colorFor }) {
  if (!data?.length) return <EmptyState title="No data yet" />
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="#eef1f6" />
        <XAxis dataKey={xKey} {...axisProps} interval={0} />
        <YAxis {...axisProps} domain={yDomain} unit={unit} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(79,70,229,0.06)' }} formatter={(value) => `${value}${unit}`} />
        {bars.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color ?? CHART_COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={48}>
            {colorFor && data.map((row) => <Cell key={row[xKey]} fill={colorFor(row)} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/** @param {{ data: Array<{ name: string, value: number, color: string }> }} props */
export function DonutChart({ data }) {
  const total = data.reduce((sum, row) => sum + row.value, 0)
  if (!total) return <EmptyState title="No data yet" />
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} stroke="none">
          {data.map((row) => (
            <Cell key={row.name} fill={row.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
