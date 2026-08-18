"use client"
type Props = {}
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page({}: Props) {
    const router = useRouter();
    useEffect(() => {
        router.replace('/faculty/analytics');
    }, [router]);
    return (
        <>
            
        </>
    )
}
