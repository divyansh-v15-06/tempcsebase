'use client'

import { Inter as FontSans } from 'next/font/google'
import './globals.css'
import { cn } from '../lib/utils'
import { Toaster } from 'react-hot-toast'
import NavBar from '@/components/navbar/NavBar'
import Footer from '@/components/footer'
import Header from '@/components/Header'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react' // For state and effect management

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const isAdminRoute = pathname.startsWith('/admin')

    // Correcting the route check for login and reset routes
    const isLoginRoute = [
        '/login',
        '/reset-password',
        '/forgotpassword',
        '/forgotpasswordadmin',
        '/admin/login',
    ].includes(pathname)
    const isFacultyRoute = pathname.startsWith('/faculty')

    const [showWelcome, setShowWelcome] = useState(false)
    const [showTransition, setShowTransition] = useState(false) // For transition screen
    const [showHome, setShowHome] = useState(false)

    // Show the welcome screen on first visit
    useEffect(() => {
        const hasVisited = sessionStorage.getItem('hasVisited')
        if (!hasVisited) {
            setShowWelcome(true)
            sessionStorage.setItem('hasVisited', 'true')
        } else {
            setShowHome(true) // Show home page if already visited
        }
    }, [])

    // Close the Welcome screen and show the Transition screen
    const closeWelcomeScreen = () => {
        setShowWelcome(false)
        setShowTransition(true) // Show the Transition page next
    }

    // Close the Transition screen and show the Home page
    const closeTransitionPage = () => {
        setShowTransition(false)
        setShowHome(true) // Finally, show the home page
    }

    return (
        <html lang='en'>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased ',
                    fontSans.variable,
                )}
            >
                {!isFacultyRoute && !isLoginRoute && <Header />}

                <div className='relative z-[2]'>
                    {!isFacultyRoute && !isLoginRoute && <NavBar />}
                </div>
                {children}
                {!isAdminRoute && !isLoginRoute && !isFacultyRoute && (
                    <Footer />
                )}

                <Toaster />
            </body>
        </html>
    )
}
