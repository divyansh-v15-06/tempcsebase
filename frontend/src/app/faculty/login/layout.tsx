
export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className='flex flex-col h-screen '>
            <main className='flex-1 p-4 overflow-auto'>{children}</main>
        </div>
    )
}
