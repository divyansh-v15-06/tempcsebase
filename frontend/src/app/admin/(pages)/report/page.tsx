"use client"

import { useState } from "react"

export default function ReportPage() {
  const currentYear = new Date().getFullYear()
  const [startYear, setStartYear] = useState(currentYear - 5)
  const [endYear, setEndYear] = useState(currentYear)
  const [format, setFormat] = useState("docx") // default format

  const handleGenerateReport = () => {
    if (startYear > endYear) {
      alert("Start year must be less than or equal to end year.")
      return
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/report/download-report?startYear=${startYear}&endYear=${endYear}&format=${format}`
    window.open(url, "_blank")
  }

  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i).sort((a, b) => a - b)

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Academic Report</h1>
      <p className="mb-6 text-gray-600">
        Select a year range and file format to download the academic report.
      </p>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block mb-1 font-medium text-sm text-gray-700">Start Year</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {yearOptions.map((year) => (
              <option key={`start-${year}`} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-1 font-medium text-sm text-gray-700">End Year</label>
          <select
            value={endYear}
            onChange={(e) => setEndYear(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {yearOptions.map((year) => (
              <option key={`end-${year}`} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-1 font-medium text-sm text-gray-700">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="docx">DOCX</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerateReport}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
      >
        Generate Report
      </button>
    </div>
  )
}
