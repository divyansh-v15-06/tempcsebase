import HomeCarousel from '@/components/home-components/Carousel/homeCarousel'
import Achievements from '@/components/Achievements'
import AnnouncementTicker from '@/components/home-components/Ticker/AnnouncementTiker'
import CseStats from '@/components/home-components/CseStats'
import AnnouncementSection from '@/components/home-components/AnnouncementSection'
import ResearchSection from '@/components/home-components/ResearchSection'
import MessageDirector from '@/components/home-components/MessageDirector'

export default function Home() {
    return (
        <main>
            <AnnouncementTicker />
            <div className='hidden lg:flex items-center '>
                <AnnouncementSection />
                <HomeCarousel />
                <ResearchSection />
            </div>
            <div className=' lg:hidden '>
                <HomeCarousel />
                <div className='flex flex-wrap justify-center'>
                    <div>
                        <AnnouncementSection />
                    </div>
                    <div>
                        <ResearchSection />
                    </div>
                </div>
            </div>
            <Achievements />
            <CseStats />
            <MessageDirector />
        </main>
    )
}