import { WeightRecord } from '@/app/lib/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WeightRecordListProps {
  weightRecords: WeightRecord[]
}

export default function WeightRecordList({ weightRecords }: WeightRecordListProps) {
  const sortedRecords = [...weightRecords].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  )

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sortedRecords}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="recorded_at"
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#8884d8"
            name="体重 (kg)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
