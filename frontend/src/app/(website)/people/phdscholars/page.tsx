// @ts-nocheck
'use client'

import PhdScholarsCards from '@/components/people-components/PhdScholarsCards'
import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'

const Page = ({ params }) => {
    const [filter1, setFilter1] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [oldPhd, setOldPhd] = useState([])
    const [currentPhd, setCurrentPhd] = useState([])
    const [view, setView] = useState('new') // 'new' or 'old' to manage the toggle

    const fetchNewPhd = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/get?query=pursuing`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log(response)
                setCurrentPhd(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }
    const fetchOldPhd = () => {
        setIsLoading(true)
        const urlWithParams = `${process.env.NEXT_PUBLIC_API_URL}/phdScholar/get?query=passed`

        axios
            .get(urlWithParams)
            .then((response) => {
                console.log(response)
                setOldPhd(response.data.data)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchNewPhd()
        fetchOldPhd()
    }, [])

    return (
        <>
            <div id='peoplesPage' className='my-4 min-h-[50vh]'>
                <div className='text-center text-2xl lg:my-4 lg:text-3xl font-bold'>
                    Ph.D. Scholars
                </div>

                {/* Toggle Buttons */}
                <div className='flex justify-center space-x-4 mb-6'>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold ${
                            view === 'new'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                        onClick={() => setView('new')}
                    >
                        Current Ph.D. Scholars
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg font-semibold ${
                            view === 'old'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                        onClick={() => setView('old')}
                    >
                        Former Ph.D. Scholars
                    </button>
                </div>

                {/* Conditional Rendering */}
                {isLoading ? (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                        }}
                    >
                        <CircularProgress color='inherit' />
                    </div>
                ) : (
                    <>
                        {view === 'new' ? (
                            // New PhD Scholars (Card View)
                            <div
                                id='facultyDataTable'
                                className='flex flex-wrap gap-4 justify-center items-center'
                            >
                                {currentPhd.map((facultyCard, index) => (
                                    <div key={index}>
                                        <PhdScholarsCards
                                            // @ts-ignore
                                            name={facultyCard.name}
                                            qualification={
                                                // @ts-ignore
                                                facultyCard.lastQualification
                                            }
                                            // @ts-ignore
                                            researchArea={
                                                //@ts-ignore
                                                facultyCard.researchArea
                                            }
                                            // @ts-ignore
                                            researchGuide={
                                                facultyCard.Supervisor
                                            }
                                            // @ts-ignore
                                            photo={facultyCard.photo}
                                            // @ts-ignore
                                            LinkedIn={facultyCard.LinkedIn}
                                            GoogleScholar={
                                                facultyCard.GoogleScholar
                                            }
                                            Scopus={facultyCard.Scopus}
                                            // @ts-ignore
                                            email={facultyCard.email}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Old PhD Scholars (Table View)
                            <div className='my-8 mx-8'>
                                {/* <h2 className='text-center text-2xl font-bold pb-4'>
                                    Former Ph.D. Scholars
                                </h2> */}
                                <div className='overflow-x-auto'>
                                    <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                        <thead>
                                            <tr className='text-lg bg-[#f7dcdd]'>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Sr. no.
                                                </th>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Roll No
                                                </th>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Name
                                                </th>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Thesis Title
                                                </th>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Supervisor
                                                </th>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Co-supervisor
                                                </th>
                                                <th className='text-nowrap p-2 text-center bg-[#272e3f] text-[#fff] border border-1 border-[#dde2e6]'>
                                                    Passing Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {oldPhd.map((scholar, index) => (
                                                <tr
                                                    key={index}
                                                    className={`${
                                                        index % 2 === 0
                                                            ? ''
                                                            : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <td className='p-2 border-b border-r border-l border-solid border-black text-center'>
                                                        {index + 1}
                                                    </td>
                                                    <td className='p-2 border-b border-r border-l border-solid border-black text-center text-nowrap'>
                                                        {scholar.rollNo}
                                                        {console.log(
                                                            'scholar',
                                                            scholar,
                                                        )}
                                                    </td>
                                                    <td className='p-2 border-b border-1 border-r border-solid border-black text-left'>
                                                        {scholar.name}
                                                    </td>
                                                    <td className='p-2 border-b border-1 border-r border-solid border-black text-left'>
                                                        {scholar.title || 'N/A'}
                                                    </td>
                                                    <td className='p-2 border-b border-1 border-r border-solid border-black text-left'>
                                                        {scholar.Supervisor ||
                                                            'N/A'}
                                                    </td>
                                                    <td className='p-2 border-b border-1 border-r border-solid border-black text-left'>
                                                        {scholar.CoSupervisor ||
                                                            'N/A'}
                                                    </td>
                                                    <td className='p-2 border-b border-1 border-r border-solid border-black text-left'>
                                                        {new Date(scholar.endDate).toLocaleDateString('en-GB') ||
                                                            'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

export default Page
