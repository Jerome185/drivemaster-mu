"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function ProgressChart({ data }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8">
      <h3 className="font-semibold mb-4">
        Score Progression
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="index" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="percentage" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}