"use client"
import AdminNavbar from '@/components/admin-components/adminNavbar'
import withAuth2 from '@/components/withAuth2'

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode
}>)=> {
    return (
        <div className='flex '>
            {' '}
            <AdminNavbar />
            <div className='w-full h-full '>
                <div className=''>{children}</div>
            </div>
        </div>
    )
}


export default withAuth2(Layout)