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
const InputField = ({
    label,
    value,
    onChange,
    id,
    type = 'text',
    disabled = false,
    minDate,
    options,
    required = false,
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
                disabled={disabled}
                required={required}
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
                required={required}
            />
        ) : type === 'year' ? (
            <DatePicker
                minDate={minDate}
                required={required} 
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
                required={required}
                onChange={(date) => onChange({ target: { id, value: date } })}
                showMonthYearPicker
                dateFormat='MMM               '
                disabled={disabled}
                placeholderText='Select Month'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
        ) : (
            <DatePicker
                selected={value as Date}
                required={required}
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

const AdminModalPublications = ({
    isOpen,
    onClose,
    onSubmit,
    type
}) => {
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        associatedFaculty: '',
        volume: '',
        pageNo: '',
        month: '',
        year: '',
        issue: '',
        doi: '',
        type: type ||'',
        authorName: [],
        indexing: '',
        academicSession: '',
        yeartemp: '',
        isbn:'',
        journalQuartile: 'T',
    })
    const [faculties, setFaculties] = useState([])
    const [indexingOptions, setIndexingOptions] = useState([])
    const [isCustomIndexing, setIsCustomIndexing] = useState(false)

    //indexing options
    useEffect(() => {

        setFormData((prev) => ({
            ...prev,
            type: type || prev.type,
        }))
        const fetchIndexingOptions = async () => {
            try {
                const response = await axios.get(
                    ` ${process.env.NEXT_PUBLIC_API_URL}/publication/getIndexing`,
                )
                if (Array.isArray(response.data.data)) {
                    const options = response.data.data.map((indexing) => ({
                        value: indexing,
                        label: indexing,
                    }))
                    setIndexingOptions(options)
                } else {
                    console.error('Unexpected response format:', response.data)
                }
            } catch (error) {
                console.error('Error fetching indexing options:', error)
            }
        }

        fetchIndexingOptions()
    }, [type])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get?parmanent=true`,
                )
                // console.log('response.data', response.data)
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
    useEffect(() => {}, [])

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }
    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        // Join selected authors into a comma-separated string
        const associatedFacultyString = selectedAuthors.join(',')
        setFormData((prev) => ({
            ...prev,
            associatedFaculty: associatedFacultyString,
        }))
    }

    // const handleSubmit = (e) => {
    //     e.preventDefault()
    //     // Include addonFaculty in the associatedFaculty string if it is provided
    //     const updatedFormData = {
    //         ...formData,
    //         associatedFaculty: formData.associatedFaculty
    //             ? ${formData.associatedFaculty}, ${addonFaculty}.trim() // Append addonFaculty
    //             : addonFaculty, // If no existing faculty, just set addonFaculty
    //     }
    //     onSubmit(updatedFormData)
    // }
    const handleSubmit = (e) => {
        const addonFaculty = sessionStorage.getItem('userId')
        e.preventDefault()
        // Required fields
        const requiredFields = [
            { field: 'title', name: 'Title' },
            { field: 'name', name: 'Journal Name' },
            { field: 'authorName', name: 'Authors' },
            { field: 'indexing', name: 'Indexing' },
            { field: 'academicSession', name: 'Academic Session' },
            // { field: 'month', name: 'Month' },
            { field: 'year', name: 'Year' },
            { field: 'doi', name: 'Link (Doi)' },
        ]

        // Check for empty required fields
        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                alert(`Please fill in the required field: ${name}`)
                return
            }
        }

        // Include addonFaculty in the associatedFaculty string if it is provided
        const updatedFormData = {
            ...formData,
            associatedFaculty: formData.associatedFaculty
                ? `${formData.associatedFaculty}, ${addonFaculty}` // Append addonFaculty
                : addonFaculty, // If no existing faculty, just set addonFaculty
        }
        onSubmit(updatedFormData)
        setFormData({
            title: '',
            name: '',
            associatedFaculty: '',
            volume: '',
            pageNo: '',
            month: '',
            year: '',
            issue: '',
            doi: '',
            type: '',
            authorName: [],
            indexing: '',
            academicSession: '',
            yeartemp: '',
            isbn:'',
            journalQuartile: 'T',
        });
    }

    const facultyOptions = faculties.map((faculty) => ({
        // @ts-ignore
        value: faculty.uniqueFacultyId,
        // @ts-ignore
        label: faculty.name,
    }))
    // console.log('facultyOptions', facultyOptions)
    const years = [
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
    ]

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
                        Add New Publication
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Type of Research:
                                </label>
                                <Select
                                value={
                                    formData.type
                                        ? {
                                              value: formData.type,
                                              label: formData.type,
                                          }
                                        : null
                                }
                                    onChange={(option) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            // @ts-ignore
                                            type: option.value,
                                        }))
                                    }}
                                    options={[
                                        { value: 'Journal', label: 'Journal' },
                                        { value: 'Book', label: 'Book' },
                                        {
                                            value: 'Book Chapter',
                                            label: 'Book Chapter',
                                        },
                                        {
                                            value: 'Conference',
                                            label: 'Conference',
                                        },
                                    ]}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div> */}
                            <InputField
                                label={type=="Book"?"Book Title":type=="Book Chapter"?"Book Chapter Title":type=="Conference"?"Paper Title":"Paper Title"}
                                id='title'
                                value={formData.title}
                                required={true}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Name of Journal/Publisher'
                                id='name'
                                value={formData.name}
                                required={true}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Volume'
                                id='volume'
                                // required={true}
                                value={formData.volume}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Issue'
                                id='issue'
                                // required={true}
                                value={formData.issue}
                                onChange={handleChange}
                            />
                            <InputField
                                type='year'
                                label='Select Year'
                                id='yeartemp'
                                // minDate={new Date('2010-01-01')}\
                                required={true}
                                value={formData.yeartemp}
                                onChange={(e)=>{
                                    if(e.target.value){
                                        const date = new Date(e.target.value)
                                        setFormData((prev) => ({
                                            ...prev,
                                            yeartemp:e.target.value,
                                            year: date.getFullYear() 
                                        }))
                                }

                                }}  
                                
                            />
                            {formData.type === 'Book' && (
                                <InputField
                                    label='ISBN Number'
                                    id='isbn'
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    required={true}
                                />
                            )}
                            {formData.type === 'Book Chapter' && (
                                <InputField
                                    label='ISBN Number'
                                    id='isbn'
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    required={true}
                                />
                            )}
                            {formData.type === 'Conference' && (
                                // <InputField
                                //     label='Month'
                                //     id='month'
                                //     value={formData.month}
                                //     onChange={handleChange}
                                // />
                                <InputField
                                    type='month' // Use the month calendar
                                    label='Select Month'
                                    id='month'
                                    value={formData.month}
                                    
                                    onChange={handleChange}
                                    required={true}
                                />
                            )}
                            {formData.type === 'Journal' && (
                                <>
                                    <InputField
                                        type='month' // Use the month calendar
                                        label='Select Month'
                                        id='month'
                                        value={formData.month}
                                        onChange={handleChange}
                                        required={true}
                                    />
                                    <div className='flex flex-col my-2'>
                                        <label htmlFor='journalQuartile' className='text-lg mb-1'>
                                            Journal Quartile:
                                        </label>
                                        <Select
                                            id='journalQuartile'
                                            value={{
                                                value: formData.journalQuartile,
                                                label: formData.journalQuartile === 'T' ? 'T (Temporary)' : formData.journalQuartile
                                            }}
                                            onChange={(selectedOption) =>
                                                setFormData((prev) => ({ ...prev, journalQuartile: selectedOption.value }))
                                            }
                                            options={[
                                                { value: 'T', label: 'T (Temporary)' },
                                                { value: 'Q1', label: 'Q1' },
                                                { value: 'Q2', label: 'Q2' },
                                                { value: 'Q3', label: 'Q3' },
                                                { value: 'Q4', label: 'Q4' }
                                            ]}
                                            className='basic-single'
                                            classNamePrefix='select'
                                        />
                                    </div>
                                </>
                            )}
                            <InputField
                                label='Page Number'
                                id='pageNo'
                                value={formData.pageNo}
                                onChange={handleChange}
                                // required={true}
                            />
                            {/* <InputField
                                label='Indexing'
                                id='indexing'
                                value={formData.indexing}
                                onChange={handleChange}
                            /> */}
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Indexing:
                                </label>
                                <Select
                                    options={indexingOptions}
                                    onChange={(option) => {
                                        const selectedValue =
                                            option?.value || ''
                                        setFormData((prev) => ({
                                            ...prev,
                                            indexing:
                                                selectedValue === 'Other'
                                                    ? ''
                                                    : selectedValue, // Reset for "Other"
                                        }))
                                        setIsCustomIndexing(
                                            selectedValue === 'Other',
                                        )
                                    }}
                                    className='basic-single'
                                    classNamePrefix='select'
                                    required={true}
                                />
                                {isCustomIndexing && (
                                    <input
                                        type='text'
                                        className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2'
                                        placeholder='Enter custom indexing'
                                        required={true}
                                        value={formData.indexing}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                indexing: e.target.value,
                                            }))
                                        }
                                    />
                                )}
                            </div>
                            <InputField
                                label='Authors'
                                id='authorName'
                                required={true}
                                value={formData.authorName}
                                onChange={handleChange}
                            />
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated Faculty:
                                </label>
                                <div>
                                    {/* {console.log('Associated Faculty', )} */}
                                </div>
                                <Select
                                    isMulti
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div>
                            <InputField
                                label='Link (Doi)'
                                id='doi'
                                value={formData.doi}
                                onChange={handleChange}
                            />
                            <InputField
                                type='select'
                                options={years}
                                label='Academic session'
                                id='academicSession'

                                value={formData.academicSession}
                                onChange={handleChange}
                                required={true}
                            />
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button
                                type='submit'
                                className='bg-blue-500 text-white mr-2'
                            >
                                Submit
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

export default AdminModalPublications
