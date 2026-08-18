// import React from 'react'
// import Marquee from 'react-fast-marquee'
// type Props = {}

// const logoList = [
//     {
//         imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/14.png',
//     },
//     {
//         imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/34.png',
//     },
//     {
//         imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/14.png',
//     },

//     {
//        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/38.png',
//     },
//     {
//        imgSrc:'https://img.freepik.com/free-photo/handsome-young-man-with-arms-crossed-white-background_23-2148222620.jpg'
//     },
//     {
//         imgSrc:'https://exchange4media.gumlet.io/news-photo/118923-JuhiSnap.jpg?w=400&dpr=2.6',
//      },
//      // Added IBM logo
// ]

// export default function ImageCarousel({}: Props) {
//     return (
//         <div>
//             <div className=''>
//                 <Marquee
//                     className=' overflow-hidden h-[200px]  '
//                     pauseOnHover={false}
//                     speed={60}
//                     loop={0}
//                     autoFill={true}
//                     direction={'left'}
//                 >
//                     {logoList.map((logo, index) => (
//                         <div
//                             key={index}
//                             className='transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'
//                         >
//                             <img
//                                 src={logo.imgSrc}
//                                 alt={`Logo ${index}`}
//                                 className=''
//                             />
//                         </div>
//                     ))}
//                 </Marquee>{' '}
//                 <Marquee
//                     className=' h-[200px] overflow-hidden  hidden'
//                     pauseOnHover={false}
//                     speed={80}
//                     loop={0}
//                     autoFill={true}
//                     direction={'right'}
//                 >
//                     {logoList.map((logo, index) => (
//                         <div
//                             key={index}
//                             className=' transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'
//                         >
//                             <img
//                                 key={index}
//                                 src={logo.imgSrc}
//                                 alt={`Logo ${index}`}
//                                 className=''
//                             />
//                         </div>
//                     ))}
//                 </Marquee>
//                 <Marquee
//                     className=' h-[200px]  overflow-hidden hidden'
//                     pauseOnHover={false}
//                     speed={60}
//                     loop={0}
//                     autoFill={true}
//                     direction={'left'}
//                 >
//                     {logoList.map((logo, index) => (
//                         <div
//                             key={index}
//                             className=' transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'
//                         >
//                             <img
//                                 key={index}
//                                 src={logo.imgSrc}
//                                 alt={`Logo ${index}`}
//                                 className=''
//                             />
//                         </div>
//                     ))}
//                 </Marquee>
//             </div>
//             {/* <div className='xl:hidden'>
//                 <Marquee
//                     className=' h-[200px]  overflow-hidden'
//                     pauseOnHover={false}
//                     speed={60}
//                     loop={0}
//                     autoFill={true}
//                     // direction={'left'}
//                 >
//                     {logoList.map((logo, index) => (
//                         <div className=' transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'>
//                             <img
//                                 key={index}
//                                 src={logo.imgSrc}
//                                 alt={`Logo ${index}`}
//                                 className=''
//                             />
//                         </div>
//                     ))}
//                 </Marquee>
//             </div> */}
//         </div>
//     )
// }
import React from 'react'
import Marquee from 'react-fast-marquee'

type Props = {}

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
    {
        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/05.png',
    },
    {
        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/44.png',
    },
    {
        imgSrc: 'https://www.codeforgovtech.in/wp-content/uploads/2024/03/17.png',
    },
    // Added IBM logo
]

export default function ImageCarousel({}: Props) {
    return (
        <div>
            <div>
                <Marquee
                    className='overflow-hidden h-[200px]'
                    pauseOnHover={false}
                    speed={20}
                    loop={0}
                    autoFill={true}
                    direction={'left'}
                >
                    {logoList.map((logo, index) => (
                        <div
                            key={index}
                            className='transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'
                        >
                            <img
                                src={logo.imgSrc}
                                alt={`Logo ${index}`}
                                className='w-[150px] h-[250px] object-cover'
                            />
                        </div>
                    ))}
                </Marquee>
                <Marquee
                    className='h-[200px] overflow-hidden hidden'
                    pauseOnHover={false}
                    speed={25}
                    loop={0}
                    autoFill={true}
                    direction={'right'}
                >
                    {logoList.map((logo, index) => (
                        <div
                            key={index}
                            className='transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'
                        >
                            <img
                                src={logo.imgSrc}
                                alt={`Logo ${index}`}
                                className='w-[150px] h-[250px] object-cover'
                            />
                        </div>
                    ))}
                </Marquee>
                <Marquee
                    className='h-[200px] overflow-hidden hidden'
                    pauseOnHover={false}
                    speed={20}
                    loop={0}
                    autoFill={true}
                    direction={'left'}
                >
                    {logoList.map((logo, index) => (
                        <div
                            key={index}
                            className='transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'
                        >
                            <img
                                src={logo.imgSrc}
                                alt={`Logo ${index}`}
                                className='w-[150px] h-[250px] object-cover'
                            />
                        </div>
                    ))}
                </Marquee>
            </div>
            {/* <div className='xl:hidden'>
                <Marquee
                    className='h-[200px] overflow-hidden'
                    pauseOnHover={false}
                    speed={60}
                    loop={0}
                    autoFill={true}
                    // direction={'left'}
                >
                    {logoList.map((logo, index) => (
                        <div className='transform rotate-[270deg] border rounded-xl m-16 overflow-hidden'>
                            <img
                                key={index}
                                src={logo.imgSrc}
                                alt={`Logo ${index}`}
                                className='w-[150px] h-[250px] object-cover'
                            />
                        </div>
                    ))}
                </Marquee>
            </div> */}
        </div>
    )
}
