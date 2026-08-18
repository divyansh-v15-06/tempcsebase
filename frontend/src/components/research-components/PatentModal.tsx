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

export default function PatentModal({ item }: Props) {
    const link = `https://${item?.link}`
    console.log('publications', item)
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
                            Complete Patent Details
                        </DialogTitle>

                        <DialogDescription>
                            <table className='border-1 rounded border border-solid border-[#dde2e6] w-full'>
                                <tbody>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Title :
                                                </div>
                                                <div className='text-[#202529] w-3/4 md:w-4/5  '>
                                                    {item?.title}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold '>
                                                    Authors :
                                                </div>
                                                <div className='text-[#202529] w-3/4 md:w-4/5'>
                                                    {item?.faculties.map(
                                                        (author) => {
                                                            return (
                                                                <span
                                                                    key={
                                                                        author.id
                                                                    }
                                                                >
                                                                    {
                                                                        author.name
                                                                    }
                                                                    {','}
                                                                </span>
                                                            )
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Status :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.status}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4  text-base font-semibold'>
                                                    Month :
                                                </div>
                                                <div className='text-[#202529] '>
                                                    {item?.month}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4  text-base font-semibold'>
                                                    Year :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.year}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Place :
                                                </div>
                                                <div className='text-[#202529]'>
                                                    {item?.place}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Reference ID:
                                                </div>
                                                <div className='text-[#202529] pl-2 md:pl-0'>
                                                    {item?.referenceNo}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Created at :
                                                </div>
                                                <div className='text-[#202529] pl-2 md:pl-0'>
                                                    {item?.createdAt}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                            <div className='flex'>
                                                <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                    Updated at :
                                                </div>
                                                <div className='text-[#202529] pl-2 md:pl-0'>
                                                    {item?.updatedAt}
                                                </div>
                                            </div>
                                        </td>
                                    </tr> */}
                                    {item?.link && (
                                        <tr>
                                            <td className='p-2 text-left border-b border-r border-1 border-solid border-[#dde2e6]'>
                                                <div className='flex'>
                                                    <div className='text-[#103870] w-1/4 text-base font-semibold'>
                                                        Link :
                                                    </div>
                                                    <div className='text-[#202529]'>
                                                        <Button className='bg-[#00b84c] hover:bg-[#2ca75f] p-2 pl-4 pr-4 text-base'>
                                                            <a
                                                                href={link}
                                                                target='_blank'
                                                                rel='noopener noreferrer'
                                                            >
                                                                Details
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Title:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Authors:
                                </div>
                                <div className='text-[#202529]  '>
                                    {item?.publication_detail?.title}
                                </div>
                            </div>
                            <div className='flex gap-2'>
                                <div className='text-black text-base font-medium '>
                                    Volume:
                                </div>
                                <div className='text-[#202529]  '>
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
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}
