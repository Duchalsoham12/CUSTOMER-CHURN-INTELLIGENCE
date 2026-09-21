import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "../../types";

const colors = ["#2e9d86", "#e4a84d", "#df765f", "#a94653"];

export function TrendChart({ data, type = "line", suffix = "" }: { data: ChartPoint[]; type?: "line" | "bar"; suffix?: string }) {
  return <ResponsiveContainer width="100%" height={230}><LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
    <CartesianGrid stroke="#e4e9e6" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#8a9996", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8a9996", fontSize: 11 }} /><Tooltip formatter={(value) => [`${value}${suffix}`, "Value"]} />
    {type === "bar" ? <Bar dataKey="value" fill="#2e9d86" radius={[3, 3, 0, 0]} /> : <Line type="monotone" dataKey="value" stroke="#217c6c" strokeWidth={3} dot={{ r: 3, fill: "#217c6c" }} activeDot={{ r: 5 }} />}
  </LineChart></ResponsiveContainer>;
}

export function RiskDonut({ data }: { data: ChartPoint[] }) {
  return <ResponsiveContainer width="100%" height={230}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>{data.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, "Customers"]} /></PieChart></ResponsiveContainer>;
}