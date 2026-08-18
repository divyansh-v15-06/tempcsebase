'use client' // Mark as a client-side component

import AdminNavbar from '@/components/admin-components/adminNavbar'
import Sidebar from '@/components/Faculty/SideBar'
import TopNavbar from '@/components/Faculty/TopNavbar'
import { UserProvider } from '@/app/faculty/(pages)/UsernameProvider'
import withAuth from '@/components/withAuth' // Import the withAuth HOC
import PublicSideBar from '@/components/public-portfoilio/PublicSidebar'
import PublicTopNavbar from '@/components/public-portfoilio/PublicTopNavbar'

const facultyInfo = {
    name: 'Dr. Arun Kumar Yadav',
    email: 'ayadav[at]nith[dot]ac[dot]in',
    designation: 'Assistant Professor Grade-II',
    photoUrl: 'https://portfolios.nith.ac.in/uploads/member_details/334.jpg',
}

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <div className='flex flex-col h-screen'>
            <PublicTopNavbar />
            <div className='flex flex-1 overflow-hidden'>
                <PublicSideBar />
                {children}
            </div>
        </div>
    )
}

// Wrap Layout with withAuth to protect all routes
export default Layout