"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { type ChartType, ChartTypeSelector } from "../chart-type-selector"
import { useRouter } from "next/navigation"

interface Patent {
  year: number
  status: string
  id: number
  facultyIds: number[]
}

interface PatentsChartProps {
  data: Patent[]
  facfilter?: number
  startYear?: number
  endYear?: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function PatentsChart({ data ,facfilter,startYear,endYear}: PatentsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("bar")
  const router = useRouter()

  // Aggregate data by year
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existingItem = acc.find((i) => i.year === item.year)
      if (existingItem) {
        if (item.status === "Published") {
          existingItem.published += 1
        } else if (item.status === "Granted") {
          existingItem.granted += 1
        }
      } else {
        acc.push({
          year: item.year,
          published: item.status === "Published" ? 1 : 0,
          granted: item.status === "Granted" ? 1 : 0,
        })
      }
      return acc
    },
    [] as { year: number; published: number; granted: number }[],
  )

  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, we need different data structure
  const pieData = [
    { name: "Published", value: data.filter((item) => item.status === "Published").length },
    { name: "Granted", value: data.filter((item) => item.status === "Granted").length },
  ]

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    )
  }
   const CustomClickableDot = ({ cx, cy, payload, stroke, publicationType }: any) => {
  const handleClick = () => {
    const year = payload.year
    router.push(
      `/research/patents?startYear=${year}&&endYear=${year}&&type=${publicationType}&&facultyName=${facfilter}`)
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={stroke}
      stroke="#fff"
      strokeWidth={2}
      style={{ cursor: "pointer" }}
      onClick={handleClick}
    />
  )
}

  return (
    <div>
      <ChartTypeSelector value={chartType} onValueChange={setChartType} />
      <div className="h-[300px] w-full">
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={aggregatedData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="published" name="Published" fill="#e8c468" radius={[4, 4, 0, 0]} barSize={20}
              onClick={(data, index) => {
                  const year = aggregatedData[index].year
                  router.push(`/research/patents?startYear=${year}&&endYear=${year}&&type=Published&&facultyName=${facfilter}`)
                }}>
                <LabelList dataKey="published" position="center" fill="#fff" />
              </Bar>
              <Bar dataKey="granted" name="Granted" fill="#f4a462" radius={[4, 4, 0, 0]} barSize={20}
              onClick={(data, index) => {
                  const year = aggregatedData[index].year
                  router.push(`/research/patents?startYear=${year}&&endYear=${year}&&type=Granted&&facultyName=${facfilter}`)
                }}>
                <LabelList dataKey="granted" position="center" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                  onClick={() => {
                      const type = pieData[index].name.replace(" ", "")
                      router.push(`/research/patents?type=${type}&&facultyName=${facfilter}&&startYear=${startYear}&&endYear=${endYear}`)
                    }}  />
                ))}
              </Pie>
              <Legend />
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartType === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={aggregatedData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="published"
                name="published"
                stroke="#e8c468"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#e8c468" publicationType="Published" />}
              />
              <Line
                type="monotone"
                dataKey="granted"
                name="Granted"
                stroke="#2a9d90"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#2a9d90" publicationType="Granted" />}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
