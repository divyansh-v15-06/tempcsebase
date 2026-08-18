// @ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { set } from 'react-datepicker/dist/date_utils'
import PreviousMap_ from 'postcss/lib/previous-map'
import { on } from 'node:events'
import { start } from 'node:repl'

type Faculty = {
    uniqueFacultyId: string
    name: string
}

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = 'text',
    disabled = false,
    minDate,
    options,
}) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={id} className='text-lg mb-1'>
            {label}:
        </label>
        {type === 'text' ? (
            <input
                type='text'
                id={id}
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                value={value}
                onChange={onChange}
            />
        ) : type === 'select' ? (
            <Select
                id={id}
                value={options.find((option) => option.value === value)} // Ensure the selected option is passed correctly
                onChange={(selectedOption) =>
                    onChange({ target: { id, value: selectedOption.value } })
                }
                options={options}
                className='basic-single'
                classNamePrefix='select'
            />
        ) : type === 'year' ? (
            <DatePicker
                minDate={minDate}
                selected={value as Date}
                onChange={(date: Date) =>
                    onChange({ target: { id, value: date } })
                }
                showYearPicker
                dateFormat='yyyy'
                disabled={disabled}
                placeholderText='yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : type === 'month' ? (
            <DatePicker
                minDate={minDate}
                selected={value}
                onChange={(date) => onChange({ target: { id, value: date } })}
                showMonthYearPicker
                dateFormat='MMM'
                disabled={disabled}
                placeholderText='Select Month'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : (
            <DatePicker
                selected={value as Date}
                onChange={(date: Date) =>
                    onChange({ target: { id, value: date } })
                }
                dateFormat='dd/MM/yyyy'
                disabled={disabled}
                placeholderText='dd/mm/yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        )}
    </div>
)
const SelectField = ({ label, value, onChange, id, options }) => (
    <div className="flex flex-col my-2">
        <label htmlFor={id} className="text-lg mb-1">
            {label}:
        </label>
        <Select
            options={options}
            value={options.find(option => option.value === value)}
            onChange={(selectedOption) => onChange({ target: { id, value: selectedOption.value } })}
            className="basic-select"
            classNamePrefix="select"
        />
    </div>
);

function ResearchSuperVisionUpdateModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null, // New prop to provide initial values
}) {
    const [formData, setFormData] = useState({
        // program: req.body.program,
        //             scholarName: req.body.scholarName,
        //             rollNo: req.body.rollNo,
        //             researchTopic: req.body.researchTopic,
        //             status: req.body.status,
        //             year: req.body.year,
        //             academicSession: req.body.academicSession,
        //             coSupervisior: req.body.coSupervisior,
        //             associatedFaculty: req.body.associatedFaculty

        program: '',
        scholarName: '',
        rollNo: '',
        researchTopic: '',
        status: '',
        year: '',
        academicSession: '',
        coSupervisior: '',
        associatedFaculty: '',
        facarry: [],
    })

    const [faculties, setFaculties] = useState<Faculty[]>([])
    const facultyOptions = faculties.map((faculty) => ({
        value: faculty.uniqueFacultyId,
        label: faculty.name,
    }))
    console.log('facultyOptions', facultyOptions);


    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        // Join selected authors into a comma-separated string
        formData.facarry = selectedAuthors
        const associatedFacultyString = selectedAuthors.join(', ')
        setFormData((prev) => ({
            ...prev,
            associatedFaculty: associatedFacultyString,
        }))
    }

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?parmanent=true`,
                )
                if (Array.isArray(response.data.data)) {
                    setFaculties(response.data.data)
                } else {
                    console.error('Unexpected response format:', response.data)
                }
            } catch (error) {
                console.error('Error fetching faculties:', error)
            }
        }

        fetchFaculties()
    }, [])

    useEffect(() => {
        console.log('initialData', initialData)

        if (initialData) {
            const faculitesarry = initialData.faculty_detail.map((faculty) => {
                return faculty.uniqueFacultyId
            }
            )
            setFormData({
                program: initialData.program,
                scholarName: initialData.scholarName,
                rollNo: initialData.rollNo,
                researchTopic: initialData.researchTopic,
                status: initialData.status,
                year: initialData.year,
                academicSession: initialData.academicSession,
                coSupervisior: initialData.coSupervisior,
                facarry: faculitesarry,
                associatedFaculty: faculitesarry.join(', '),
                coSupervisior: initialData.coSupervisior,
            })
        }
    }, [initialData])
    console.log('formdata', formData)

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // const requiredFields = [
        //     { field: 'program', name: 'Program' },
        //     { field: 'scholarName', name: 'Scholar Name' },
        //     { field: 'rollNo', name: 'Roll No' },
        //     { field: 'researchTopic', name: 'Research Topic' },
        //     { field: 'status', name: 'Status' },
        //     { field: 'year', name: 'Year' },
        //     { field: 'academicSession', name: 'Academic Session' },
        //     { field: 'coSupervisior', name: 'Co-Supervisor' },
        //     { field: 'associatedFaculty', name: 'Associated Faculty' },
        // ]

        // for (let { field, name } of requiredFields) {
        //     if (!formData[field]) {
        //         ;`alert(Please fill in the required field: ${name})`
        //         return
        //     }
        // }

        const updatedFormData = {
            ...formData,
        }
        onSubmit(updatedFormData, initialData.id)
        onClose()
    }
    const programOptions = [
        { value: '1', label: 'M.Tech' },
        { value: '2', label: 'Ph.D' },
    ]
    const handleSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta
        if (selectedOption) {
            setFormData((prev) => ({ ...prev, [name]: selectedOption.value }))
        }
    }
    const statusOptions = [
        { value: 'Ongoing', label: 'Ongoing' },
        { value: 'Completed', label: 'Completed' },
    ]
    const years = [
        {value : "", label : "Select Academic Session"},
        { value: '2010-2011', label: '2010-2011' },
        { value: '2011-2012', label: '2011-2012' },
        { value: '2012-2013', label: '2012-2013' },
        { value: '2013-2014', label: '2013-2014' },
        { value: '2014-2015', label: '2014-2015' },
        { value: '2015-2016', label: '2015-2016' },
        { value: '2016-2017', label: '2016-2017' },
        { value: '2017-2018', label: '2017-2018' },
        { value: '2018-2019', label: '2018-2019' },
        { value: '2019-2020', label: '2019-2020' },
        { value: '2020-2021', label: '2020-2021' },
        { value: '2021-2022', label: '2021-2022' },
        { value: '2022-2023', label: '2022-2023' },
        { value: '2023-2024', label: '2023-2024' },
        { value: '2024-2025', label: '2024-2025' },
        { value: '2025-2026', label: '2025-2026' },
    ];

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative'
                >
                    <button
                        onClick={onClose}
                        className='absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800'
                        aria-label='Close'
                    >
                        &times;
                    </button>
                    <h2 id='dialog-title' className='text-2xl mb-4'>
                        {initialData
                            ? 'Update Publication'
                            : 'Add New Publication'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Program:</label>
                                <Select
                                    options={programOptions}
                                    onChange={handleSelectChange}
                                   value={programOptions.find((option) => option.value == formData.program)}
                                    name='program'
                                    className='basic-select'
                                    classNamePrefix='select'
                                />
                            </div>
                            <InputField
                                label='Scholar Name'
                                value={formData.scholarName}
                                onChange={handleChange}
                                id='scholarName'
                                type='text'
                            />
                            <InputField
                                label='Roll No'
                                value={formData.rollNo}
                                onChange={handleChange}
                                id='rollNo'
                                type='text'
                            />
                            <InputField
                                label='Research Topic'
                                value={formData.researchTopic}
                                onChange={handleChange}
                                id='researchTopic'
                                type='text'
                            />
                            <SelectField
                                label='Status'
                                id='status'
                                value={formData.status}
                                onChange={handleChange}
                                options={statusOptions}
                            />
                            <InputField
                                label='Year'
                                value={formData.year}
                                onChange={handleChange}
                                id='year'
                                type='year'
                            />
                            <SelectField
                                label='Academic session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                                options={years}
                            />
                            <InputField
                                label='Co Supervisors'
                                id='coSupervisior'
                                value={formData.coSupervisior}
                                onChange={handleChange}
                                minDate={undefined}
                                disabled={undefined}
                                required={undefined}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated Faculties:
                                </label>
                                <Select
                                    isMulti
                                    value={facultyOptions.filter((option) =>
                                        formData.facarry.includes(
                                            option.value,
                                        )
                                    )}
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div>
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button
                                type='submit'
                                className='bg-blue-500 text-white mr-2'
                            >
                                {initialData ? 'Update' : 'Submit'}
                            </Button>
                            <Button
                                onClick={onClose}
                                className='bg-gray-500 text-white'
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default ResearchSuperVisionUpdateModal
