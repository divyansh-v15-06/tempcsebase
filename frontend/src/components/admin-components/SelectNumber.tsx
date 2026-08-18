import * as React from 'react'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export function SelectNumber({ count }) {
    const items = Array.from({ length: count }, (_, index) => index + 1)
    return (
        <Select>
            <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Select' />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Select</SelectLabel>
                    {items.map((item, key) => (
                        <SelectItem key={item} value={item.toString()}>
                            {key}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
