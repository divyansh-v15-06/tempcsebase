import React from 'react'

type Props = {}

export default function PlacementAboutus({}: Props) {
    return (
        <div>
            {' '}
            <div className=' bg-[#f4f0eb] flex justify-center items-center py-8 md:p-[4rem] '>
                <div className='w-full md:w-[65vw] py-2 px-8'>
                    <h2 className='text-3xl font-bold pb-[2rem]'>
                        {' '}
                        <span className='border-l-4 border-[#c1361d] pr-4'></span>
                        AboutUs
                    </h2>
                    <div className='text-lg md:tracking-wider text-justify px-6'>
                        Located in Hamirpur district of Himachal Pradesh, NIT
                        Hamirpur enjoys a really scenic environment and pleasant
                        weather. Established in the year 1986, as REC Hamirpur,
                        NIT Hamirpur has been declared as the Institute of
                        National Importance under the Act of Parliament, 2007.
                        Established in 1989 as the Department of Computer
                        Science & Engineering, we have an excellent & rich
                        history and an outstanding record of contributions to
                        the profession and community. The Department is well
                        recognized for excellence in facilities and teaching.
                    </div>
                </div>
            </div>
        </div>
    )
}
