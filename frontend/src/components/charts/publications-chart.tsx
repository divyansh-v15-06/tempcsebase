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
import { Value } from "@radix-ui/react-select"
// ...

interface Publication {
  year: number
  facultyIds: number[]
  type: string,
  indexing?: string // Optional, used for journal publications  

}

interface PublicationsChartProps {
  data: Publication[]
  facfilter?: number
  startYear?: number
  endYear?: number
  isJ?: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function PublicationsChart({ data, facfilter, startYear, endYear, isJ }: PublicationsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line")
  const router = useRouter()

  // Aggregate data by year and publication type
  let aggregatedData;
  if (isJ) {
    aggregatedData = data.reduce(
      (acc, item) => {
        const existingItem = acc.find((i) => i.year === item.year)
        if (existingItem) {
          if (item.indexing === "SCI(E)") {
            existingItem.sci += 1
          } else if (item.indexing === "Scopus") {
            existingItem.scopus += 1
          }
          else {
            existingItem.other += 1
          }
          existingItem.total += 1
        } else {
          acc.push({
            year: item.year,
            sci: item.indexing === "SCI(E)" ? 1 : 0,
            scopus: item.indexing === "Scopus" ? 1 : 0,
            other: item.indexing && item.indexing !== "SCI(E)" && item.indexing !== "Scopus" ? 1 : 0,
            total: 1,
          })
        }
        return acc
      },
      [] as {
        year: number
        sci: number
        scopus: number
        other: number
        total: number
      }[],
    )
    console.log("Aggregated Data:", data);

  }
  

  else {
    aggregatedData = data.reduce(
      (acc, item) => {
        const existingItem = acc.find((i) => i.year === item.year)
        if (existingItem) {
          if (item.type === "journal") {
            existingItem.journal += 1
          } else if (item.type === "conference") {
            existingItem.conference += 1
          } else if (item.type === "book") {
            existingItem.book += 1
          } else if (item.type === "bookchapter") {
            existingItem.bookchapter += 1
          }
          existingItem.total += 1
        } else {
          acc.push({
            year: item.year,
            journal: item.type === "journal" ? 1 : 0,
            conference: item.type === "conference" ? 1 : 0,
            book: item.type === "book" ? 1 : 0,
            bookchapter: item.type === "bookchapter" ? 1 : 0,
            total: 1,
          })
        }
        return acc
      },
      [] as {
        year: number
        journal: number
        conference: number
        book: number
        bookchapter: number
        total: number
      }[],
    )
  }





  // Sort by year
  aggregatedData.sort((a, b) => a.year - b.year)

  // For pie chart, we need to transform the data
  let pieData
  if (isJ) {
    pieData = [
      {
        name: "SCI(E)",
        value: data.filter((item) => item.indexing === "SCI(E)").length,
      },
      {
        name: "Scopus",
        value: data.filter((item) => item.indexing === "Scopus").length,
      },
      {
        name: "Others",
        value: data.filter((item) => item.indexing && item.indexing !== "SCI(E)" && item.indexing !== "Scopus").length,

      },
    ]
  }
  else {
    pieData = [
      {
        name: "Journal",
        value: data.filter((item) => item.type === "journal").length,
      },
      {
        name: "Conference",
        value: data.filter((item) => item.type === "conference").length,
      },
      {
        name: "Book",
        value: data.filter((item) => item.type === "book").length,
      },
      {
        name: "Book Chapter",
        value: data.filter((item) => item.type === "bookchapter").length,
      },
    ]
  }

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
        `/research/publications?startYear=${year}&&endYear=${year}&&type=${publicationType}&&facultyName=${facfilter}`)
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
      {isJ ? (<div className="h-[300px] w-full">
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

              <Bar dataKey="sci" name="SCI(E)" fill="#e76e50" radius={[4, 4, 0, 0]} barSize={15}
                onClick={(data, index) => {
                  const year = aggregatedData[index].year
                  router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=journal&&facultyName=${facfilter}`)
                }}>
                <LabelList dataKey="sci" position="center" fill="#fff" fontSize={10} />
              </Bar>
              <Bar dataKey="scopus" name="Scopus" fill="#2a9d90" radius={[4, 4, 0, 0]} barSize={15}
                onClick={(data, index) => {
                  const year = aggregatedData[index].year
                  router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=journal&&facultyName=${facfilter}`)
                }}>
                <LabelList dataKey="scopus" position="center" fill="#fff" fontSize={10} />
              </Bar>
              <Bar dataKey="other" name="Others" fill="#e8c468" radius={[4, 4, 0, 0]} barSize={15}
                onClick={(data, index) => {
                  const year = aggregatedData[index].year
                  router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=journal&&facultyName=${facfilter}`)
                }}>
                <LabelList dataKey="other" position="center" fill="#fff" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>)}


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
                      const type = pieData[index].name.toLowerCase().replace(" ", "")
                      router.push(`/research/publications?type=journal&&facultyName=${facfilter}&&startYear=${startYear}&&endYear=${endYear}`)
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
                dataKey="sci"
                name="SCI(E)"
                stroke="#e76e50"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#e76e50" publicationType="journal" />}

              />
              <Line
                type="monotone"
                dataKey="scopus"
                name="Scopus"
                stroke="#2a9d90"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#2a9d90" publicationType="journal" />}
              />
              <Line
                type="monotone"
                dataKey="other"
                name="Others"
                stroke="#274754"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={(props) => <CustomClickableDot {...props} stroke="#274754" publicationType="journal" />}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>) : (
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

                <Bar dataKey="journal" name="Journal" fill="#e76e50" radius={[4, 4, 0, 0]} barSize={15}
                  onClick={(data, index) => {
                    const year = aggregatedData[index].year
                    router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=journal&&facultyName=${facfilter}`)
                  }}>
                  <LabelList dataKey="journal" position="center" fill="#fff" fontSize={10} />
                </Bar>
                <Bar dataKey="conference" name="Conference" fill="#2a9d90" radius={[4, 4, 0, 0]} barSize={15}
                  onClick={(data, index) => {
                    const year = aggregatedData[index].year
                    router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=conference&&facultyName=${facfilter}`)
                  }}>
                  <LabelList dataKey="conference" position="center" fill="#fff" fontSize={10} />
                </Bar>
                <Bar dataKey="book" name="Book" fill="#274754" radius={[4, 4, 0, 0]} barSize={15}
                  onClick={(data, index) => {
                    const year = aggregatedData[index].year
                    router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=book&&facultyName=${facfilter}`)
                  }}>
                  <LabelList dataKey="book" position="center" fill="#fff" fontSize={10} />
                </Bar>
                <Bar dataKey="bookchapter" name="Book Chapter" fill="#e8c468" radius={[4, 4, 0, 0]} barSize={15}
                  onClick={(data, index) => {
                    const year = aggregatedData[index].year
                    router.push(`/research/publications?startYear=${year}&&endYear=${year}&&type=bookchapter&&facultyName=${facfilter}`)
                  }}>
                  <LabelList dataKey="bookchapter" position="center" fill="#fff" fontSize={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>)}


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
                        const type = pieData[index].name.toLowerCase().replace(" ", "")
                        router.push(`/research/publications?type=${type}&&facultyName=${facfilter}&&startYear=${startYear}&&endYear=${endYear}`)
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
                  dataKey="journal"
                  name="Journal"
                  stroke="#e76e50"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={(props) => <CustomClickableDot {...props} stroke="#e76e50" publicationType="journal" />}

                />
                <Line
                  type="monotone"
                  dataKey="conference"
                  name="Conference"
                  stroke="#2a9d90"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={(props) => <CustomClickableDot {...props} stroke="#2a9d90" publicationType="conference" />}
                />
                <Line
                  type="monotone"
                  dataKey="book"
                  name="Book"
                  stroke="#274754"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={(props) => <CustomClickableDot {...props} stroke="#274754" publicationType="book" />}
                />
                <Line
                  type="monotone"
                  dataKey="bookchapter"
                  name="Book Chapter"
                  stroke="#e8c468"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={(props) => <CustomClickableDot {...props} stroke="#e8c468" publicationType="bookchapter" />}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}
