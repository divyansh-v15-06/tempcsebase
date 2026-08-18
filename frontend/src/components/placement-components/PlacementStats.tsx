'use client'
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SelectItem } from '@/components/ui/select'
import { Button } from '../ui/button'
import FilterOptions from '../people-components/filterOptions'

type Props = {}
const options = [
    { value: '2021', title: '2021' },
    { value: '2022', title: '2022' },
    { value: '2023', title: '2023' },
    {
        value: '2024',
        title: '2024',
    },
    {
        value: '2025',
        title: '2025',
    },
]
const PlacementStats = ({}: Props) => {
    const [filter1, setFilter1] = useState<string>('')
    const [year, setYear] = useState('')
    return (
        <div className='grid grid-cols-[1fr] grid-rows-[45px] m-12 place-content-center p-0 lg:pt-8 box-border mt-3 mb-3 gap-4'>
            {/* className="header" */}
            <h3 className='text-center text-2xl  lg:text-4xl  font-bold '>
                Placement Stats
            </h3>
            {/* className:container */}
            <div className='  flex  justify-center items-center gap-2'>
                <FilterOptions
                    filterName='Select Type'
                    setFilterValue={setYear}
                    options={options}
                />

                <Button className='mx-4'>Filter</Button>
            </div>
            <div>
                <h3 className='text-center text-2xl  lg:text-3xl  font-semibold '>
                    Batch : {year}
                </h3>
            </div>
            <div className='overflow-x-auto border-black'>
                <Table news={NewsList} />
            </div>
        </div>
    )
}

export default PlacementStats
const NewsList = [
    {
        id: 1,
        branch: 'Computer Science & Engg ',
        eligibleCandidates: '111',
        placed: '88',
        percentPlaced: '79.28',
        TotalJobsOffered: '91',
        percentJobsOfferedToNith: '81.98',
        maxCTC: '173',
    },
    {
        id: 1,
        branch: 'Dual Degree Computer Science & Engg. ',
        eligibleCandidates: '111',
        placed: '88',
        percentPlaced: '79.28',
        TotalJobsOffered: '91',
        percentJobsOfferedToNith: '81.98',
        maxCTC: '173',
    },
    {
        id: 1,
        branch: 'Electronics & Comm. Engg. ',
        eligibleCandidates: '111',
        placed: '88',
        percentPlaced: '79.28',
        TotalJobsOffered: '91',
        percentJobsOfferedToNith: '81.98',
        maxCTC: '173',
    },
    {
        id: 1,
        branch: 'Dual Degree Electronics & Comm. Engg. ',
        eligibleCandidates: '111',
        placed: '88',
        percentPlaced: '79.28',
        TotalJobsOffered: '91',
        percentJobsOfferedToNith: '81.98',
        maxCTC: '173',
    },
    {
        id: 1,
        branch: 'Mechanical Engg. ',
        eligibleCandidates: '111',
        percentPlaced: '79.28',
        placed: '88',
        TotalJobsOffered: '91',
        percentJobsOfferedToNith: '81.98',
        maxCTC: '173',
    },
    {
        id: 1,
        branch: 'Material Sc. & Engg. ',
        eligibleCandidates: '111',
        placed: '88',
        percentPlaced: '79.28',
        TotalJobsOffered: '91',
        percentJobsOfferedToNith: '81.98',
        maxCTC: '173',
    },
]
function Table({ news }) {
    return (
        <div className='font-sans  '>
            <table className='border-1  border-l border-r border-solid border-black w-full'>
                <thead>
                    <tr>
                        {/* className="serialNumber" */}
                        <th className='text-nowrap  p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                            id
                        </th>
                        <th className='text-nowrap  p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                            Branch percentPlaced{' '}
                        </th>
                        {/* className="announcements" */}
                        <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                            Eligible Candidates
                        </th>
                        {/* Date Section */}
                        <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff]'>
                            Placed
                        </th>
                        {/* View Buttons */}
                        <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] '>
                            % Placement
                        </th>
                        <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] '>
                            Total Jobs Offered
                        </th>
                        <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] '>
                            % Jobs offered to NITH
                        </th>
                        <th className='text-nowrap p-3 text-center text-xl font-medium bg-[#272e3f] text-[#fff] '>
                            Max CTC(in lakhs)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {NewsList.map((item, index) => (
                        <tr key={item.id}>
                            {/* className="numbers" */}
                            <td className='p-2 text-center border-b border-r border-1 border-solid border-black  '>
                                {index + 1}
                            </td>
                            {/* className="news" */}
                            <td className='p-2 text-left text-blue-800 border-b border-1 border-solid border-black text-lg'>
                                {item.branch}
                                {/* {item[index].latestNews && newGif} */}
                                {/* {news[index].latestNews ? newGif : ''} */}
                            </td>
                            <td className='p-2 text-center  text-nowrap border-b border-l border-1 border-solid border-black'>
                                {item.eligibleCandidates}
                            </td>
                            <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                {item.placed}
                            </td>
                            <td className='p-2 text-center  text-nowrap border-b border-l border-1 border-solid border-black'>
                                {item.percentPlaced}
                            </td>
                            <td className='p-2 text-center  text-nowrap border-b border-l border-1 border-solid border-black'>
                                {item.TotalJobsOffered}
                            </td>

                            <td className='p-2 text-center  text-nowrap border-b border-l border-1 border-solid border-black'>
                                {item.percentJobsOfferedToNith}
                            </td>
                            <td className='p-2 text-center border-b border-l border-1 border-solid border-black'>
                                {item.maxCTC}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
