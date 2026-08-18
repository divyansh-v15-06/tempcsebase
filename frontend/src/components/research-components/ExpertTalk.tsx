import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import Link from 'next/link'

type Props = { item: any }

export default function ExpertTalkModal({ item }: Props) {
    const link = `https://${item?.link}`

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
                            Complete Expert Talk Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    {item?.title && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Title:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.title}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.venue && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Venue:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.venue}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.startDate && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        Start Date:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.startDate}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {item?.endDate && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 md:w-1/5 text-base font-semibold'>
                                                        End Date:
                                                    </div>
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.endDate}
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
                                                    <div className='text-[#202529] w-3/4 md:w-4/5 place-items-center flex'>
                                                        {item.academicSession}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
