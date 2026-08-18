import React from 'react'
import Marquee from 'react-fast-marquee'

type Props = {}
//@ts-ignore
const logoList: Logo[] = [
    {
        url: 'https://www.oracle.com',
        imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/1280px-Oracle_logo.svg.png',
    },
    {
        url: 'https://www.samsung.com',
        imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1280px-Samsung_Logo.svg.png',
    },
    {
        url: 'https://www.ibm.com',
        imgSrc: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    },
]

export default function Recruiters() {
    return (
        <div className='py-8 '>
            <div className='bg-[#f2ebe7] p-4  flex flex-col items-center'>
                <div className=' text-2xl lg:py-4 lg:text-3xl font-bold underline'>
                    Our Top Recruiters
                </div>
                <div className='w-[85vw] '>
                    <Marquee
                        className='h-[150px]  '
                        pauseOnHover={false}
                        speed={60}
                        loop={0}
                        autoFill={true}
                    >
                        <div className='flex gap-8 max-'>
                            {logoList.map((logo, index) => (
                                <a
                                    key={index}
                                    className='mx-4 hover:cursor-pointer'
                                    href={logo.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    <img
                                        src={logo.imgSrc}
                                        alt={`Logo ${index}`}
                                        className='h-[60px] w-auto hover:opacity-75 transition-opacity duration-300'
                                    />
                                </a>
                            ))}
                        </div>
                    </Marquee>
                </div>
            </div>

            <div className='p-4'>
                <div className='text-center text-2xl lg:py-10 lg:text-4xl font-bold'>
                    List Of Past Recruiters
                </div>
                <div className='flex flex-col lg:flex-row justify-center items-center gap-4 p-4 text-xl text-red-800 font-bold'>
                    <a
                        href='https://nith.ac.in/uploads/topics/pastrecruiters212216375755506770.pdf'
                        target='_blank'
                        className='hover:text-red-400'
                    >
                        Recruiters for 2021-22
                    </a>
                    <a
                        href='https://nith.ac.in/uploads/topics/pastrecruiters202116375755784330.pdf'
                        target='_blank'
                        className='hover:text-red-400'
                    >
                        Recruiters for 2020-21
                    </a>
                    <a
                        href='https://nith.ac.in/uploads/topics/16376417798134.pdf'
                        target='_blank'
                        className='hover:text-red-400'
                    >
                        Recruiters for 2019-20
                    </a>
                </div>
            </div>
        </div>
    )
}
