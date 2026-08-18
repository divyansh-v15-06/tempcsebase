import React from 'react'
import PlacementData from '@/components/placement-components/PlacementData'
import PlacementsHero from '@/components/placement-components/placementsHero'
import Marquee from 'react-fast-marquee'
import Recruiters from '@/components/placement-components/Recruters'
import PlacementAboutus from '@/components/placement-components/PlacementAboutus'
import PlacementStats from '@/components/placement-components/PlacementStats'

export default function PlacementPage() {
    return (
        <div className='min-h-[50vh]'>
            <PlacementsHero />
            <PlacementStats />
            <Recruiters />
            {/* <PlacementData /> */}
            <PlacementAboutus />
        </div>
    )
}
