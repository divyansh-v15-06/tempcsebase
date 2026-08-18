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

interface Event {
  year: number
  facultyIds: number[]
  type: string
}

interface EventsChartProps {
  data: Event[]
  facfilter?: number
  startYear?: number
  endYear?: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function EventsChart({ data, facfilter, startYear, endYear }: EventsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("pie")
  const router = useRouter()

  // Aggregate by year, counting each event as 1
  const aggregatedData = data.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.year === item.year)
    if (existingItem) {
      if (item.type === "E-/STC") {
        existingItem.STC += 1
      } else if (item.type === "conference") {
        existingItem.conference += 1
      }
      else if (item.type === "GIAN") {
        existingItem.GIAN += 1
      } else if (item.type === "workshop") {
        existingItem.workshop += 1
      }
    } else {
      acc.push({
        year: item.year,
        STC: item.type === "E-/STC" ? 1 : 0,
        conference: item.type === "conference" ? 1 : 0,
        GIAN: item.type === "GIAN" ? 1 : 0,
        workshop: item.type === "workshop" ? 1 : 0,
      })
    }
    return acc
  }, [] as { year: number; conference:number,STC:number,GIAN:number,workshop:number  }[])

  aggregatedData.sort((a, b) => a.year - b.year)

   const pieData = [
    { name: "E-STC/STC", value: data.filter((item) => item.type === "E-/STC").length },
    { name: "Conference", value: data.filter((item) => item.type === "conference").length },
    { name: "GIAN", value: data.filter((item) => item.type === "GIAN").length },
    { name: "Workshop", value: data.filter((item) => item.type === "workshop").length },
  ]

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for the selected filters.</p>
      </div>
    )
  }
  const CustomClickableDot = ({ cx, cy, payload, stroke,type }: any) => {
    const handleClick = () => {
      const year = payload.year
      router.push(
        `/research/events?startYear=${year}&&endYear=${year}&&facultyName=${facfilter}&&type=${type}`)
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
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="conference" name="Conference" fill="#0088FE" radius={[4, 4, 0, 0]} onClick={(data, index) => {
                const year = aggregatedData[index].year
                router.push(`/research/events?startYear=${year}&&endYear=${year}&&facultyName=${facfilter}&&type=conference`)
              }}>
                <LabelList dataKey="conference" position="center" fill="#fff" />
              </Bar>
              <Bar dataKey="STC" name="E-STC/STC" fill="#00C49F" radius={[4, 4, 0, 0]} onClick={(data, index) => {
                const year = aggregatedData[index].year
                router.push(`/research/events?startYear=${year}&&endYear=${year}&&facultyName=${facfilter} &&type=E-/STC`)
              }}>
                <LabelList dataKey="STC" position="center" fill="#fff" />
              </Bar>
              <Bar dataKey="GIAN" name="GIAN" fill="#FFBB28" radius={[4, 4, 0, 0]} onClick={(data, index) => {
                const year = aggregatedData[index].year
                router.push(`/research/events?startYear=${year}&&endYear=${year}&&facultyName=${facfilter} &&type=GIAN`)
              }}>
                <LabelList dataKey="GIAN" position="center" fill="#fff" />
              </Bar>
              <Bar dataKey="workshop" name="Workshop" fill="#FF8042" radius={[4, 4, 0, 0]} onClick={(data, index) => {
                const year = aggregatedData[index].year
                router.push(`/research/events?startYear=${year}&&endYear=${year}&&facultyName=${facfilter}&&type=workshop`)
              }}>
                <LabelList dataKey="workshop" position="center" fill="#fff" />
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
                label={({ name, percent, value }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}
                    onClick={() => {
    
                      const type = pieData[index].name==="E-STC/STC" ? "STC" : pieData[index].name==="GIAN"?"GIAN": pieData[index].name.toLowerCase()
                      router.push(`/research/events?facultyName=${facfilter}&&startYear=${startYear}&&endYear=${endYear}&&type=${type}`)
                    }} />
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
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="conference"
                name="Conference"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#0088FE" type="conference" />}
              />
              <Line
                type="monotone"
                dataKey="STC"
                name="E-STC/STC"
                stroke="#00C49F"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#00C49F" type="STC" />}
              />
              <Line
                type="monotone"
                dataKey="GIAN"
                name="GIAN"
                stroke="#FFBB28"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#FFBB28" type="GIAN"/>} 
              />
              <Line
                type="monotone"
                dataKey="workshop"
                name="Workshop"
                stroke="#FF8042"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#FF8042" type="workshop"/>}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
