"use client"
import React, { useEffect, useState } from 'react'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import './carousel.css'
import axios from 'axios'

function HomeCarousel() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true) // Loading state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/carousel/get`,
                )
                console.log('Response:', response)

                // Handle response if it contains just one photo or an array
                const photos = Array.isArray(response.data.data)
                    ? response.data.data.map((item) => item.photo)
                    : [response.data.data.photo]

                setData(photos)
                setLoading(false) // Stop loading after data is fetched
            } catch (error) {
                console.error('Error fetching carousel data:', error)
                // setLoading(false) // Stop loading even if there's an error
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        console.log('Carousel Data:', data)
    }, [data])

    return (
        <div className='select-none flex justify-center items-center '>
            {loading ? (
                <div className='w-full m-4 lg:w-[50vw] h-[300px] bg-gray-100 flex justify-center items-center rounded-xl'>
                    {/* Skeleton loader */}
                </div>
            ) : (
                <Carousel
                    showIndicators={false}
                    emulateTouch={true}
                    swipeable={true}
                    autoPlay={true}
                    infiniteLoop={true}
                    showArrows={true}
                    showThumbs={false}
                    showStatus={false}
                    useKeyboardArrows={true}
                    stopOnHover={false}
                    interval={5000}
                    transitionTime={1000}

                >
                    {data.map((item, index) => (
                        <div key={index} className='relative bg-[#f6f0ea]'>
                            <img
                                alt={`Carousel Image ${index + 1}`}
                                src={item}
                                className='w-full  h-auto object-cover' // Added responsive classes
                            />
                        </div>
                    ))}
                </Carousel>
            )}

            <style jsx>{`
                .loader {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background-color: #f9c3c1; /* Light pink */
                    box-shadow: 32px 0 #f9c3c1, -32px 0 #f9c3c1;
                    position: relative;
                    animation: flash 0.55s ease-out infinite alternate;
                }

                @keyframes flash {
                    0% {
                        background-color: #f9c3c1; /* Light pink */
                        box-shadow: 32px 0 #f4a6a5, -32px 0 #f4a6a5;
                    }
                    50% {
                        background-color: #fff; /* White */
                        box-shadow: 32px 0 #f4a6a5, -32px 0 #f4a6a5;
                    }
                    100% {
                        background-color: #f9c3c1; /* Light pink */
                        box-shadow: 32px 0 #f4a6a5, -32px 0 #f4a6a5;
                    }
                }
            `}</style>
        </div>
    )
}

export default HomeCarousel
