import React from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
// import { Card } from '../ui/card'
// import { CardContent } from '../ui/card'
const newsData = [
    {
        title: 'IIT Mandi Researchers Develop Biodegradable Polymeric Microgels for Sustainable Agriculture',
        date: '2024-04-18',
        image: '/path/to/image1.jpg',
    },
    {
        title: "IIT Mandi's HPC Bootcamp in Collaboration with CDAC : Accelerating Knowledge",
        date: '2024-02-28',
        image: '/path/to/image2.jpg',
    },
    {
        title: 'IIT Mandi Launches Startup Practicum Program to Promote Entrepreneurship',
        date: '2024-02-08',
        image: '/path/to/image3.jpg',
    },
    {
        title: 'IIT Mandi Receives ‘Green University’ Award at COP28 UAE',
        date: '2023-12-07',
        image: '/path/to/image4.jpg',
    },
]

const NewsActivities = () => {
    return (
        <Card className='w-full'>
            <CardHeader className='bg-yellow-400 p-4 text-xl font-semibold'>
                News & Activities
            </CardHeader>
            <CardContent className='p-4'>
                {newsData.map((news, index) => (
                    <div key={index} className='mb-4'>
                        <img
                            src={news.image}
                            alt={news.title}
                            className='w-full h-32 object-cover mb-2'
                        />
                        <h3 className='text-blue-600 text-lg font-medium'>
                            {news.title}
                        </h3>
                        <p className='text-gray-600'>{news.date}</p>
                    </div>
                ))}
                <button className='mt-4 px-4 py-2 bg-black text-white rounded-md'>
                    View All
                </button>
            </CardContent>
        </Card>
    )
}

export default NewsActivities
