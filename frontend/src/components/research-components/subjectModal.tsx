"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'

type Props = { item: any }

export default function SubjectTaughtModal({ item }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [projectData, setProjectData] = useState(item)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProjectData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }
    const location = window.location

    return (
        <div>
            {/* <button className=' 	place-content-center   text-center text-[#fff]     border-[#dde2e6] rounded-md pl-4 pr-4'>
                                        Details
                                    </button> */}
            <Dialog>
                <DialogTrigger className='items-center'>
                    <div className=' place-content-center justify-center'>
                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] pl-4 pr-4 text-base font-medium text-nowrap  '>
                            Details
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='bg-[#d8f5d8] text-[#0f376f] text-2xl text-center pt-2 pb-2 font-semibold '>
                            Complete Course Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Course Code 
                                                </div>
                                                <div className='text-[#202529] w-2/3 md:w-4/5 md:pl-4  '>
                                                    {item?.courseCode}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Course Name
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.courseName}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Semester
                                                </div>
                                                <div className='text-[#202529] md:pl-4 '>
                                                    {item?.semester}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Course Level
                                                </div>
                                                <div className='text-[#202529] md:pl-4 '>
                                                    {item?.courseLevel}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Lecture Hours
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.lectureHours}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Tutorial Hours
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.tutorialHours}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5  text-base font-semibold'>
                                                    Practical Hours
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.practicalHours}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                   Academic Year
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {
                                                        item?.academicYear
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/3 md:w-1/5 text-base font-semibold'>
                                                    Faculties Assigned
                                                </div>
                                                <div className='text-[#202529] md:pl-4'>
                                                    {item?.faculty_detail?.length > 0 ?
                                                        item?.faculty_detail?.map((faculty: any, index: number) => (
                                                            <span key={index}>
                                                                {faculty?.name}
                                                                {index < item?.faculty_detail?.length - 1 ? ', ' : ''}
                                                            </span>
                                                        )):(<span className='text-red-500'>No Faculty Assigned</span>)
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Title:
                                </div>
                                <div className='text-[#202529] md:pl-4  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Authors:
                                </div>
                                <div className='text-[#202529] md:pl-2  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Volume:
                                </div>
                                <div className='text-[#202529] md:pl-2  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Page No.:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Date:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Link:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div> */}
                        </DialogDescription>
                        {/* <div className='flex justify-end gap-2 mt-4'>
                            {isEditing ? (
                                <>
                                    <Button
                                        className='bg-[#00b84c] hover:bg-[#2ca75f] text-base'
                                        onClick={handleSave}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        className='bg-gray-500 hover:bg-gray-600 text-base'
                                        onClick={toggleEdit}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                !location.pathname.includes('people') && (
                                    <Button
                                        className='bg-[#00b84c] hover:bg-[#2ca75f] text-base'
                                        onClick={toggleEdit}
                                    >
                                        Update
                                    </Button>
                                )
                            )}
                        </div> */}
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
