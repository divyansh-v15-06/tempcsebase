import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FaLinkedin, FaGoogle } from 'react-icons/fa';
import { SiScopus } from 'react-icons/si';

interface props {
    name: string;
    qualification: string;
    researchArea: string;
    researchGuide: string;
    photo: string;
    email: string;
    LinkedIn: string | null;
    GoogleScholar: string | null;
    Scopus: string | null;
}

function PhdScholarsCards({
    name,
    qualification,
    researchArea,
    researchGuide,
    photo,
    email,
    LinkedIn,
    GoogleScholar,
    Scopus,
}: props) {
    return (
        <>
            <Card className='w-72 h-180 m-2 hover:shadow-lg'>
                <CardHeader className='h-50 w-full flex justify-center items-center overflow-hidden'>
                    <img
                        alt='profileImage'
                        className='rounded-sm h-44 w-40'
                        src={photo}
                    />
                </CardHeader>
                <CardContent className='h-46 flex items-center flex-col gap-1 pb-20'>
                    <div className='text-center h-24 overflow-hidden'>
                        <p className='font-bold text-lg h-14 flex items-center justify-center'>
                            {name}
                        </p>

                        <div className="h-auto w-full flex flex-row gap-2 items-center justify-center">
                            {/* LinkedIn */}
                            <a
                                className={`flex items-center justify-center rounded-full p-2 hover:cursor-pointer hover:text-gray-500 ${
                                    LinkedIn && LinkedIn !== 'NULL' && LinkedIn !== '' ? '' : 'pointer-events-none'
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={LinkedIn && LinkedIn !== 'NULL' && LinkedIn !== '' ? LinkedIn : '#'}
                            >
                                <FaLinkedin size={22} className="text-black" />
                            </a>
                            
                            {/* Google Scholar */}
                            <a
                                className={`flex items-center justify-center rounded-full p-2 hover:cursor-pointer hover:text-gray-500 ${
                                    GoogleScholar && GoogleScholar !== 'NULL' && GoogleScholar !== '' ? '' : 'pointer-events-none'
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={GoogleScholar && GoogleScholar !== 'NULL' && GoogleScholar !== '' ? GoogleScholar : '#'}
                            >
                                <FaGoogle size={22} className="text-black" />
                            </a>
                            
                            {/* Scopus */}
                            <a
                                className={`flex items-center justify-center rounded-full p-2 hover:cursor-pointer hover:text-gray-500 ${
                                    Scopus && Scopus !== 'NULL' && Scopus !== '' ? '' : 'pointer-events-none'
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                href={Scopus && Scopus !== 'NULL' && Scopus !== '' ? Scopus : '#'}
                            >
                                <SiScopus size={22} className="text-black" />
                            </a>
                        </div>
                    </div>
                    <div className='text-left text-[#717576] h-20'>
                        <div className=''>
                            <div className=' text-sm'>
                                <span className='font-bold text-[#111111]'>
                                    <span className='font-bold mr-2'>
                                        Research Area:
                                    </span>
                                </span>
                                {researchArea}
                            </div>
                            <div className=' text-sm'>
                                <span className='font-bold mr-2 text-[#111111]'>
                                    Supervisor:
                                </span>
                                {researchGuide}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

export default PhdScholarsCards;
