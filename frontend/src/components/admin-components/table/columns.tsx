'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

import { ArrowUpDown } from 'lucide-react'

export type Payment = {
    id: string
    amount: number
    status: 'pending' | 'processing' | 'success' | 'failed'
    email: string
}
export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: 'rollno',
        header: ({ column }) => {
            return (
                <Button
                    variant='ghost'
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    RollNo
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            )
        },
    },
    {
        accessorKey: 'name',
        header: 'first_name',
    },
    // {
    //     accessorKey: 'last_name',
    //     header: 'last_name',
    // },
    // {
    //     accessorKey: 'gender',
    //     header: 'gender',
    // },
    // {
    //     accessorKey: 'Phone_Number',
    //     header: 'Phone_Number',
    // },
    {
        accessorKey: 'email',
        header: 'Email',
    },
]
