'use client'
import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react'

// Define the context type to include both username and userId
interface UserContextType {
    username: string | null
    userId: string | null
}

// Create the context with an initial undefined value
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component for user data
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        // Read the username and userId from sessionStorage
        const storedUsername = sessionStorage.getItem('facultyName')
        const storedUserId = sessionStorage.getItem('userId')
        setUsername(storedUsername)
        setUserId(storedUserId)
    }, [])

    return (
        <UserContext.Provider value={{ username, userId }}>
            {children}
        </UserContext.Provider>
    )
}

// Custom hook for using the User context
export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
