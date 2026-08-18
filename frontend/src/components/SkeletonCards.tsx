import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

function SkeletonCard({ bg, bgInner }) {
    return (
        <Card //@ts-ignore
            className={`w-[20rem] ${bg} h-[30rem] border-none shadow transition-all duration-500`}
        >
            <CardContent className='h-[27rem] p-6'>
                <div
                    className={`h-[15rem] ${bgInner} animate-pulse rounded-xl`}
                ></div>

                <div className='line-clamp-4 overflow-hidden mt-4'>
                    <div
                        className={`h-[2rem] ${bgInner} animate-pulse rounded-xl`}
                    ></div>
                    <div
                        className={`h-[1rem] w-[5rem] ${bgInner} animate-pulse rounded-xl mt-2`}
                    ></div>
                    <div
                        className={`h-[1rem] w-[13rem] ${bgInner} animate-pulse rounded-xl mt-2`}
                    ></div>
                    <div
                        className={`h-[1rem] w-[13rem] ${bgInner} animate-pulse rounded-xl mt-2`}
                    ></div>
                    <div
                        className={`h-[1rem] w-[13rem] ${bgInner} animate-pulse rounded-xl mt-2`}
                    ></div>
                </div>
            </CardContent>

            <CardFooter className='flex justify-end px-6'>
                <div
                    className={`w-[120px] h-[25px] ${bgInner} animate-pulse rounded-xl`}
                ></div>
            </CardFooter>
        </Card>
    )
}

export default SkeletonCard
