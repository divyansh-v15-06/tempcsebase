import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
interface props {
    name: string
    position: string
    contact: number
    email: string
    photo: string
    portfolio: string
    researchInterest: string
    uniqueFacultyId:string
}
function StaffCards({
    name,
    position,
    contact,
    email,
    photo,
    portfolio,
    researchInterest,
    uniqueFacultyId
}: props) 
{
    return (
        <>
        {/* <Link href={position==="Temporary Faculty"?'':window.location+`/${uniqueFacultyId}/facultyInfo`}> */}
        <Card className='w-72 h-100 m-2 hover:shadow-lg '>
                <CardHeader className='h-52 w-full flex justify-center items-center overflow-hidden'>
                    <img
                        alt='profileImage'
                        className='rounded-full h-44 w-40'
                        src={photo}
                    />
                </CardHeader>
                <CardContent className='h-36 flex items-center flex-col gap-1 pb-6 '>
                    <div className='text-center  h-24 overflow-hidden'>
                        <p className='font-bold text-lg h-14 flex items-center justify-center'>
                            {name}
                        </p>
                        <p className='h-5'>{position}</p>
                    </div>
                    {/* <div className=' border border-[#c1361d] my-2 w-6' /> */}
                    <div className='text-center text-[#717576] h-8'>
                        {/* <p className=' text-sm font-semibold'> {contact}</p> */}
                        <p className=' text-sm font-semibold'> {email} </p>
                        {/* <p className=' text-sm font-semibold'>
                            Research Interests: {researchInterest}
                        </p> */}
                    </div>
                </CardContent>
                {/* <CardFooter className='h-auto w-full flex flex-col items-end mt-2'>
                    <a
                        className=' text-orange-900 text-sm underline  hover:cursor-pointer hover:text-orange-950 mb-1'
                        target='_blank'
                        href={portfolio}
                    >
                        View Profile
                    </a>
                </CardFooter> */}
            </Card>
        {/* </Link> */}
            
        </>
    )
}

export default StaffCards
