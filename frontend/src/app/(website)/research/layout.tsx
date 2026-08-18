import { Suspense } from "react"

export default function Page( {children}: { children: React.ReactNode }) {
    return (
        <div>
            <Suspense fallback={<div>Loading filters...</div>}>
                {children}
            </Suspense>
        </div>
    );
}
