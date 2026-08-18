'use client'
import React from 'react'
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SelectItem } from '@/components/ui/select'

interface FilterOptionsProps {
    filterName: string
    setFilterValue: React.Dispatch<React.SetStateAction<string>>
    options: {
        value: string
        title?: string
    }[]
    selected?: string
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
    filterName,
    setFilterValue,
    options,
    selected,
}) => {
    const handleChange = (newValue: string) => {
        setFilterValue(newValue)
    }
    const selectedLabel = options.find(opt => {
        return (opt.value === selected&& selected !== "" && selected !== " ")
    })?.title || filterName

    return (
        <div className='px-4 flex lg:flex-col gap-1 justify-center items-center '>
            <div className=''>
                <Select onValueChange={handleChange}>
                    <SelectTrigger className=' w-[180px]'>
                        <SelectValue placeholder={selectedLabel} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((obj) => (
                            <SelectItem key={obj.value} value={obj.value}>
                                {obj.title || obj.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default FilterOptions
