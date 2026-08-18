'use client'
import React, { useEffect, useState } from 'react'
import CsvDownloader from 'react-csv-downloader'

interface Student {
    id: number
    name: string
    age: number
    grade: string
}

type Props = {
    studentData: Student[]
}

export default function exportCSV({ studentData }: Props) {
    
    const formattedData = studentData.map(student => ({
        // Map each student object to an array of their properties
        id: student.id.toString(), // Convert to string as CsvDownloader expects string values
        name: student.name,
        age: student.age.toString(), // Convert to string as CsvDownloader expects string values
        grade: student.grade
    }));

    return (
        <div>
            {' '}
            <CsvDownloader
                datas={formattedData}
                text='Export csv file'
                filename={`StudentData` + new Date().toLocaleString()}
                extension='.csv'
                className='border-2 border-neutral-700  px-2 bg-[#efefef]'
            />
        </div>
    )
}
