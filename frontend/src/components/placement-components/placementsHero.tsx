// import React from 'react'

// type Props = {}

// export default function PlacementsHero({}: Props) {
//     return <div>placementsHero
//         {/* replicate same as gov tech here */}

//     </div>
// }
// 'use client'
// import React from 'react'
// import { Typewriter } from 'react-simple-typewriter'
// import { useEffect, useRef } from 'react'
// import ImageCarousel from './imageCarousel'
// import Marquee from 'react-fast-marquee'
// const logoList = [
//     {
//         imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/14.png',
//     },
//     {
//         imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/34.png',
//     },
//     {
//         imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/14.png',
//     }, // Added IBM logo
// ]
// export default function PlacementsHero() {
//     const handleType = (count: number) => {
//         console.log(count)
//     }

//     const handleDone = () => {
//         console.log(`Done after 100 loops!`)
//     }

//     return (
//         <div className='flex overflow-hidden'>
//             <div className='xl:min-w-[50vw] min-w-full relative  h-screen flex flex-col items-center justify-center text-center '>
//                 <div className='App'>
//                     <h1 className='pt-8 pl-4 my-0 mx-auto text-5xl font-bold'>
//                         Discover your path to{' '}
//                     </h1>
//                     <span className='text-red-700 text-5xl font-bold'>
//                         <Typewriter
//                             words={[
//                                 'Success',
//                                 'Innovation',
//                                 'Internships',
//                                 'Leadership',
//                                 'Placement',
//                             ]}
//                             loop={100}
//                             cursor
//                             cursorStyle='|'
//                             typeSpeed={70}
//                             deleteSpeed={50}
//                             delaySpeed={1000}
//                             onLoopDone={handleDone}
//                             onType={handleType}
//                         />
//                     </span>
//                     <h1 className='pt-4 pl-4 my-0 mx-auto text-5xl font-bold'>
//                         Opportunity Knocks!!
//                     </h1>
//                     <p className=' py-8 text-slate-700 mx-auto text-center text-xl leading-9 font-inherit'>
//                         The Computer Science Department empowers<br/> students to achieve their dreams.
//                      Our placement cell, industry ties,<br/> and support services ensure graduates excel in the job market.
//                     </p>
//                 </div>
//                 <div className='flex items-center justify-center mt-4'>
//                 <img decoding="async" width="130" height="130" src="https://www.codeforgovtech.in/wp-content/uploads/2024/03/Pattern-1.svg" className="attachment-thumbnail size-thumbnail wp-image-10694 ml-4" alt=""/>
//             </div>
//             </div>

//             <div className='  transform rotate-90 hidden xl:flex justify-center items-center min-w-[50vw] h-screen '>
//                 <ImageCarousel />
//             </div>
//         </div>
//     )}
'use client'
import React from 'react'
import { Typewriter } from 'react-simple-typewriter'
import ImageCarousel from './imageCarousel'

const logoList = [
    {
        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/14.png',
    },
    {
        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/34.png',
    },
    {
        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/14.png',
    },
]

export default function PlacementsHero() {
    const handleType = (count: number) => {
        console.log(count)
    }

    const handleDone = () => {
        console.log(`Done after 100 loops!`)
    }

    return (
        <div className='flex overflow-hidden'>
            <div className='xl:min-w-[50vw] min-w-full relative h-screen flex flex-col justify-center items-center text-center p-8'>
                <div className=''>
                    <div className='flex justify-end w-full'>
                        <img
                            decoding='async'
                            width='130'
                            height='130'
                            src='https://www.codeforgovtech.in/wp-content/uploads/2024/03/Pattern.svg'
                            className='attachment-thumbnail size-thumbnail wp-image-10694'
                            alt='Pattern'
                        />
                    </div>
                    <h1 className='text-5xl font-bold'>
                        Discover your path to{' '}
                    </h1>

                    <span className='text-red-700 text-5xl font-bold'>
                        <Typewriter
                            words={[
                                'Success',
                                'Innovation',
                                'Internships',
                                'Leadership',
                                'Placement',
                            ]}
                            loop={100}
                            cursor
                            cursorStyle='|'
                            typeSpeed={80}
                            deleteSpeed={50}
                            delaySpeed={1000}
                            onLoopDone={handleDone}
                            onType={handleType}
                        />
                    </span>
                    <br />
                    <br />
                    <h1 className='text-5xl font-bold'>Opportunity Knocks!!</h1>
                    <p className='py-8 text-slate-700 text-xl leading-9 font-inherit'>
                        The Computer Science Department empowers
                        <br /> students to achieve their dreams. Our placement
                        cell, industry ties,
                        <br /> and support services ensure graduates excel in
                        the job market.
                    </p>
                </div>
                <div className='flex justify-start w-full'>
                    <img
                        decoding='async'
                        width='130'
                        height='130'
                        src='https://www.codeforgovtech.in/wp-content/uploads/2024/03/Pattern-1.svg'
                        className='attachment-thumbnail size-thumbnail wp-image-10694'
                        alt='Pattern'
                    />
                </div>
            </div>

            <div className='transform rotate-90 hidden xl:flex justify-center items-center min-w-[50vw] h-screen'>
                <ImageCarousel />
            </div>
        </div>
    )
}
