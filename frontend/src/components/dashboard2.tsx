"use client"

import { useState, useMemo, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PublicationsChart from "./charts/publications-chart"
import ProjectsChart from "./charts/projects-chart"
import PatentsChart from "./charts/patents-chart"
import EventsChart from "./charts/events-chart"
import { FacultyFilter } from "./faculty-filter"
import { FundingFilter } from "./funding-filter"
import { useRouter, useSearchParams } from "next/navigation";
import ProjectsAdmin from "./Faculty/facultyinfocomp"
export default function Dashboard2() {
  const [Data, setData] = useState<any>(null)
  const [startYear, setStartYear] = useState<number | null>(null)
  const [endYear, setEndYear] = useState<number | null>(null)
  const [projectStatus, setProjectStatus] = useState("all")
  const [eventType, setEventType] = useState("all")
  const [patentStatus, setPatentStatus] = useState("all")
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null)
  const [publicationType, setPublicationType] = useState("all")
  const [fundingRange, setFundingRange] = useState<[number, number]>([0, 0])
  const [username, setUsername] = useState<string>(sessionStorage.getItem('facultyName') || '')
  const [userId, setUserId] = useState<string>(sessionStorage.getItem('userId') || '')



  // These need to be derived from the data
  const [allYears, setAllYears] = useState<number[]>([])
  const [minFunding, setMinFunding] = useState<number>(0)
  const [maxFunding, setMaxFunding] = useState<number>(0)
  const handleGenerateResume = () => {
    if (!username || !userId) {
      alert("Please log in to generate your resume.")
      return
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/resume/download-resume?uniqueId=${userId}`
    window.open(url, "_blank")
  }
  const handleGenerateResumepdf = () => {
    if (!username || !userId) {
      alert("Please log in to generate your resume.")
      return
    }
    const url = `${process.env.NEXT_PUBLIC_API_URL}/resume/download-resume?uniqueId=${userId}&format=pdf`
    window.open(url, "_blank")
  }

  useEffect(() => {
    setUsername(sessionStorage.getItem('facultyName') || '')
    setUserId(sessionStorage.getItem('userId') || '')
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/get?name=${username}&&id=${userId}`)
        if (!response.ok) throw new Error("Network error")

        const json = await response.json()
        const data = json.data

        const allYears = Array.from(
          new Set([
            ...data.publicationsData.map((i) => i.year),
            ...data.projectsData.map((i) => i.year),
            ...data.patentsData.map((i) => i.year),
            ...data.eventsData.map((i) => i.year),
          ]),
        ).sort((a, b) => a - b)

        const minYear = Math.min(...allYears)
        const maxYear = Math.max(...allYears)
        const defaultStartYear = minYear

        const fundingValues = data.projectsData.map((p) => p.funding)
        const minF = Math.min(...fundingValues)
        const maxF = Math.max(...fundingValues)

        setData(data)
        setAllYears(allYears)
        setStartYear(defaultStartYear)
        setEndYear(maxYear)
        setFundingRange([minF, maxF])
        setMinFunding(minF)
        setMaxFunding(maxF)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])



  const { publicationsData = [], projectsData = [], patentsData = [], eventsData = [], facultyData = [] } = Data || {}

  const filteredPublications = useMemo(() => {
    if (!Data || startYear === null || endYear === null) return []
    return publicationsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      const typeMatch = publicationType === "all" ? true : item.type === publicationType
      return yearMatch && facultyMatch && typeMatch
    })
  }, [publicationsData, startYear, endYear, selectedFaculty, publicationType])

  const filteredProjects = useMemo(() => {
    if (!Data || startYear === null || endYear === null) return []
    return projectsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const statusMatch = projectStatus === "all" ? true : item.status === projectStatus
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      const fundingMatch = item.funding >= fundingRange[0] && item.funding <= fundingRange[1]
      return yearMatch && statusMatch && facultyMatch && fundingMatch
    })
  }, [projectsData, startYear, endYear, projectStatus, selectedFaculty, fundingRange])

  const filteredPatents = useMemo(() => {
    if (!Data || startYear === null || endYear === null) return []
    return patentsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const statusMatch = patentStatus === "all" ? true : item.status === patentStatus
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      return yearMatch && statusMatch && facultyMatch
    })
  }, [patentsData, startYear, endYear, patentStatus, selectedFaculty])

  const filteredEvents = useMemo(() => {
    if (!Data || startYear === null || endYear === null) return []
    return eventsData.filter((item) => {
      const yearMatch = item.year >= startYear && item.year <= endYear
      const statusMatch = eventType === "all" ? true : item.type === eventType
      const facultyMatch = selectedFaculty ? item.facultyIds.includes(selectedFaculty) : true
      return yearMatch && facultyMatch && statusMatch
    })
  }, [eventsData, startYear, endYear, selectedFaculty, eventType])

  const facultyName = selectedFaculty ? facultyData.find((f) => f.id === selectedFaculty)?.name : "All Faculty"

  if (!Data || startYear === null || endYear === null) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>
  }

  return (
    <div className=" bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">

          <div className="flex items-center justify-between mb-6">

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white ">Dashboard</h1>
            <div className="flex items-center space-x-4">
            <button
              onClick={handleGenerateResume}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
            >
              Generate Resume (Docx)
            </button>
            <button
              onClick={handleGenerateResumepdf}
              className="bg-green-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
            >
              Generate Resume (PDF)
            </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 grid-flow-row items-stretch md:items-center justify-between mb-6">

            <div className="grid gap-6 bg-white dark:bg-gray-800  p-6 rounded-lg shadow">
              <Tabs defaultValue="filters" className="w-full">


                <TabsContent value="filters" className="space-y-4 mt-4">
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Year Range</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Start Year</label>
                          <Select
                            value={startYear.toString()}
                            onValueChange={(value) => {
                              const year = Number.parseInt(value)
                              setStartYear(year)
                              if (year > endYear) {
                                setEndYear(year)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Start Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {allYears.map((year) => (
                                <SelectItem key={`start-${year}`} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">End Year</label>
                          <Select
                            value={endYear.toString()}
                            onValueChange={(value) => {
                              const year = Number.parseInt(value)
                              setEndYear(year)
                              if (year < startYear) {
                                setStartYear(year)
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="End Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {allYears.map((year) => (
                                <SelectItem key={`end-${year}`} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Publication Type</h2>
                      <ToggleGroup
                        type="single"
                        value={publicationType}
                        onValueChange={(value) => value && setPublicationType(value)}
                      >
                        <ToggleGroupItem value="all" aria-label="All publications">
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="journal" aria-label="Journal publications">
                          Journal
                        </ToggleGroupItem>
                        <ToggleGroupItem value="conference" aria-label="Conference publications">
                          Conf.
                        </ToggleGroupItem>
                        <ToggleGroupItem value="book" aria-label="Book publications">
                          Book
                        </ToggleGroupItem>
                        <ToggleGroupItem value="bookchapter" aria-label="Book chapter publications">
                          Chapter
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Project Status</h2>
                      <ToggleGroup
                        type="single"
                        value={projectStatus}
                        onValueChange={(value) => value && setProjectStatus(value)}
                      >
                        <ToggleGroupItem value="all" aria-label="All projects">
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Ongoing" aria-label="Ongoing projects">
                          Ongoing
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Completed" aria-label="Completed projects">
                          Completed
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Event Type</h2>
                      <ToggleGroup
                        type="single"
                        value={eventType}
                        onValueChange={(value) => value && setEventType(value)}
                      >
                        <ToggleGroupItem value="all" aria-label="All events">
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="E-/STC" aria-label="Ongoing projects">
                          STC/E-STC
                        </ToggleGroupItem>
                        <ToggleGroupItem value="GIAN" aria-label="Ongoing projects">
                          GIAN
                        </ToggleGroupItem>
                        <ToggleGroupItem value="workshop" aria-label="Completed projects">
                          Workshop
                        </ToggleGroupItem>
                        <ToggleGroupItem value="conference" aria-label="Completed projects">
                          Conference
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    <div>
                      <h2 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Patent Status</h2>
                      <ToggleGroup
                        type="single"
                        value={patentStatus}
                        onValueChange={(value) => value && setPatentStatus(value)}
                      >
                        <ToggleGroupItem value="all" aria-label="All patents">
                          All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Published" aria-label="Published patents">
                          Published
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Granted" aria-label="Granted patents">
                          Granted
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <ProjectsAdmin />
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Publications` : "Research Publications"}</CardTitle>
            </CardHeader>
            <CardContent>
              <PublicationsChart data={filteredPublications} facfilter={facultyName ?? undefined} startYear={startYear} endYear={endYear} isJ={publicationType === "journal"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Projects` : "Research Projects"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectsChart data={filteredProjects} facfilter={facultyName ?? undefined} startYear={startYear} endYear={endYear} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Patents` : "Patents Published/Granted"}</CardTitle>
            </CardHeader>
            <CardContent>
              <PatentsChart data={filteredPatents} facfilter={facultyName ?? undefined} startYear={startYear} endYear={endYear} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{selectedFaculty ? `${facultyName}'s Events` : "Faculty Events"}</CardTitle>
            </CardHeader>
            <CardContent>
              <EventsChart data={filteredEvents} facfilter={facultyName ?? undefined} startYear={startYear} endYear={endYear} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
