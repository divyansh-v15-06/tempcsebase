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

export default function PublicationsModal({ item }: Props) {
    const link = `https://${item?.link}`
    const location=window.location
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleUpdateClick = () => setIsEditDialogOpen(true)
    const [updatedData, setUpdatedData] = useState({
        title: item?.title || '',
        authorName: item?.authorName || '',
    })
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUpdatedData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // console.log('Updated data:', updatedData)

        // Local update (no API call for now)
        try {
            // setCurrentData(updatedData)

            alert('Publication updated locally')

            // setIsEditDialogOpen(false)

            // API call for updating the backend
            // const response = await fetch(`/api/publications/${item.id}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(updatedData),
            // })

            // If the API call is successful
            // if (response.ok) {
            //     const updatedItem = await response.json()
            //     setCurrentData(updatedItem)
            //     alert('Publication updated successfully')
            // } else {
            //     throw new Error('Failed to update publication')
            // }
        } catch (error) {
            console.error('Error updating publication:', error)
            alert('Failed to update publication')
        }
        setIsEditDialogOpen(false)
    }

    const showUpdate: boolean =
        !location.pathname.includes('people') &&
        !location.pathname.includes('research')

    return (
        <div>
            <Dialog>
                <DialogTrigger className='items-center'>
                    <div className='place-content-center justify-center'>
                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] pl-4 pr-4 text-base font-medium text-nowrap'>
                            Details
                        </Button>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='bg-[#d8f5d8] text-[#0f376f] text-2xl text-center pt-2 pb-2 font-semibold'>
                            Complete Publication Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    {item?.authorName && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Authors:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.authorName}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.title && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Title:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.title}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.name && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Venue:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.volume && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Volume:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.volume}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.issue && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Issue:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.issue}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.journalQuartile && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Journal Quartile:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.journalQuartile}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.pageNo &&
                                        item.pageNo.includes('-') &&
                                        item.pageNo
                                            .split('-')
                                            .every(
                                                (part) => part.trim() !== '',
                                            ) && (
                                            <tr>
                                                <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                    <div className='flex'>
                                                        <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                            Page:
                                                        </div>
                                                        <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                            {item.pageNo}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    {item?.year && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Year:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.year}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.academicSession && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Academic Session:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                        {item.academicSession}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.pdflink && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Link:
                                                    </div>
                                                    <div className='text-[#202529]'>
                                                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] p-2 pl-4 pr-4 text-base'>
                                                            <a
                                                                // @ts-ignore
                                                                href={pdflink}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                view
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.doi && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Doi:
                                                    </div>
                                                    <div className='text-[#01419a] hover:text-[#1d72e9] w-3/4 md:w-4/5'>
                                                        <span className='underline text-base text-nowrap'>
                                                            <a
                                                                href={item?.doi}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                {item?.doi}
                                                            </a>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* <div className='flex justify-end gap-4 mt-4'>
                                {showUpdate && (
                                    <Button
                                        className='bg-[#00b84c] hover:bg-[#2ca75f] text-base font-medium'
                                        onClick={handleUpdateClick}
                                    >
                                        Update
                                    </Button>
                                )}
                            </div> */}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
