// @ts-nocheck
import axios from 'axios'
import { on } from 'node:events'
import Select from 'react-select'
import '@reach/dialog/styles.css'
import DatePicker from 'react-datepicker'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import PreviousMap_ from 'postcss/lib/previous-map'
import 'react-datepicker/dist/react-datepicker.css'
import { set } from 'react-datepicker/dist/date_utils'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
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

function AdminModalPublications({
    isOpen,
    onClose,
    onSubmit,
    addonFaculty = '',
    initialData = null,
    // New prop to provide initial values
}) {
    const publicationTypeMap = [
        "Journal",
        "Conference", 
        "Book",
        "BookChapter"
    ];
    const typeoptions=[
        { value: 'Journal', label: 'Journal' },
        { value: 'Book', label: 'Book' },
        {
            value: 'BookChapter',
            label: 'Book Chapter',
        },
        {
            value: 'Conference',
            label: 'Conference',
        },
    ]
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
        type: '',
        authorName: [],
        indexing: '',
        academicSession: '',
        yeartemp:'',
        journalQuartile: 'T',
    })
    const [faculties, setFaculties] = useState([])
    const [indexingOptions, setIndexingOptions] = useState([])
    const [isCustomIndexing, setIsCustomIndexing] = useState(false)
    useEffect(() => {
        const fetchIndexingOptions = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/publication/getIndexing`,
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
    }, [])

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

    // Populate form data with initial values when initialData changes
    // useEffect(() => {
    //     if (isOpen) {
    //         // Pre-fill form with initial data if modal is open
    //         setFormData({
    //             title: initialData.title || '',
    //             name: initialData.name || '',
    //             authors: initialData.faculty_detail
    //                 ? initialData.faculty_detail.map(
    //                       (faculty) => faculty.uniqueFacultyId,
    //                   )
    //                 : [],
    //             volume: initialData.volume || '',
    //             pageNo: initialData.pageNo || '',
    //             month: initialData.month || '',
    //             year: initialData.year || '',
    //             issue: initialData.issue || '',
    //             link: initialData.doi || '',
    //             type: initialData.research_detail
    //                 ? initialData.research_detail.name
    //                 : '',
    //         })
    //     }
    // }, [isOpen, initialData])

    // console.log('initialData', initialData)
    // useEffect(() => {
    //     if (initialData) {
    //         const authors = initialData.faculty_detail
    //             ? initialData.faculty_detail.map((faculty) => faculty.name)
    //             : []
    //         // console.log('initialData', initialData, authors)
    //         setFormData({ ...initialData })
    //     }
    // }, [initialData])

    useEffect(() => {
        console.log('initialData', initialData)
        console.log('sem', initialData.faculty_detail)
        if (initialData) {
            const authors = initialData.faculty_detail
                ? initialData.faculty_detail.map((faculty) => faculty.name)
                : []
            setFormData({
                title: initialData.title || '',
                name: initialData.name || '',
                associatedFaculty: authors.join(',') || '',
                volume: initialData.volume || '',
                pageNo: initialData.pageNo || '',
                month: initialData.month || '',
                year: initialData.year || '',
                issue: initialData.issue || '',
                doi: initialData.doi || '',
                type: publicationTypeMap[initialData.type-1]|| '',
                authorName: initialData.authorName || [],
                indexing: initialData.indexing || '',
                academicSession: initialData.academicSession || '',
                yeartemp:initialData.year || '',
                isbn: initialData.isbn || '',
                journalQuartile: initialData.journalQuartile || 'T',

            })
        }
    }, [initialData])
    console.log("formdata",formData)

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        const associatedFacultyString = selectedAuthors.join(',')
        console.log('selectedAuthors', selectedAuthors);
        
        setFormData((prev) => ({
            ...prev,
            associatedFaculty: associatedFacultyString,
        }))
    }

    useEffect(() => {
        if (initialData && initialData.faculty_detail) {
            const associatedFacultyString = initialData.faculty_detail
                .map((faculty) => faculty.uniqueFacultyId)
                .join(',')
            setFormData((prev) => ({
                ...prev,
                associatedFaculty: associatedFacultyString,
            }))
        }
    }, [initialData])

    const years = [
        { value: '', label: 'Select Academic Session' },
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

    const academicSessionOptions = [
        {
            value: '2014-2015',
            label: '2014-2015',
        },
        {
            value: '2015-2016',
            label: '2015-2016',
        },
        {
            value: '2016-2017',
            label: '2016-2017',
        },
        {
            value: '2017-2018',
            label: '2017-2018',
        },
        {
            value: '2018-2019',
            label: '2018-2019',
        },
        {
            value: '2019-2020',
            label: '2019-2020',
        },
        {
            value: '2020-2021',
            label: '2020-2021',
        },
        {
            value: '2021-2022',
            label: '2021-2022',
        },
        {
            value: '2022-2023',
            label: '2022-2023',
        },
        {
            value: '2023-2024',
            label: '2023-2024',
        },
        {
            value: '2024-2025',
            label: '2024-2025',
        },
        {
            value: '2025-2026',
            label: '2025-2026',
        },
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        const requiredFields = [
            { field: 'title', name: 'Title' },
            { field: 'name', name: 'Journal Name' },
            { field: 'authorName', name: 'Authors' },
            { field: 'indexing', name: 'Indexing' },
            { field: 'year', name: 'Year' },
            { field: 'doi', name: 'Link (Doi)' },
            { field: 'academicSession', name: 'Academic Session' },
            { field: 'type', name: 'Type of Research' },
        ]

        for (let { field, name } of requiredFields) {
            if (!formData[field]) {
                ;`alert(Please fill in the required field: ${name})`
                return
            }
        }

        /*   i need payload data like this 
  "name": "4th International Conference on Data Analytics Management (ICDAM-2023)",
    "title": "Analyzing The Impact Of Extractive Summarization Techniques On Legal Text",
    "volume": "785",
    "pageNo": "585-602",
    "issue": null,
    "year": "2024",
    "academicSession": "2023-24",
    "doi": "10.1007/978-981-99-6544-1_44",
    "month": null,
    "type": 2,
    "indexing": "Scopus",
     "associatedFaculty": "CS01,CS012",
    "authorName": "Utkarsh Dixit, Sonam Gupta, Arun Kumar Yadav, Divakar Yadav"
}
// */
        //  console.log(initialData)
        //         console.log('formattedAssociatedFaculty', formData)
        const updatedFormData = {
            name: formData.name,
            title: formData.title,
            volume: formData.volume,
            pageNo: formData.pageNo,
            issue: formData.issue,
            year: formData.year,
            academicSession: formData.academicSession,
            doi: formData.doi,
            month: formData.month,
            type: formData.type,
            indexing: formData.indexing,
            authorName: Array.isArray(formData.authorName)
                ? formData.authorName.join(', ')
                : formData.authorName,
            associatedFaculty: formData.associatedFaculty,
            journalQuartile: formData.journalQuartile,
        }
        onSubmit(updatedFormData, initialData.id)
        onClose()
    }

    const facultyOptions = faculties.map((faculty) => ({
        value: faculty.uniqueFacultyId,
        label: faculty.name,
    }))

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
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Type of Research:
                                </label>
                                <Select
                                    onChange={(option) => {
                                        setFormData((prev) => ({
                                            ...prev,
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
                                    value={
                                        formData.type

                                            ? {
                                                  value: formData.type,
                                                  label: formData.type,
                                              }
                                            : null
                                    }
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div> */}
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Type of Research:
                                </label>
                                <Select
                                    onChange={(option) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            // @ts-ignore
                                            type: option.value,
                                        }))
                                    }}
                                    options={typeoptions}
                                    value={
                                        formData.type
                                            ? {
                                                  value: formData.type,
                                                  label: formData.type,
                                              }
                                            : null
                                    }
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div> */}

                            <InputField
                                label='Name'
                                id='name'
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <InputField
                                label={publicationTypeMap[initialData.type-1]=="Book"?"Book Title":publicationTypeMap[initialData.type-1]=="BookChapter"?"Book Chapter Title":publicationTypeMap[initialData.type-1]=="Conference"?"Conference Title":"Journal Title"}
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                            />
                            {/* <InputField
                                label='Name of publisher'
                                id='name'
                                value={formData.authorName}
                                onChange={handleChange}
                            /> */}
                            <InputField
                                label='Volume'
                                id='volume'
                                value={formData.volume}
                                onChange={handleChange}
                            />
                            <InputField
                                label='Issue'
                                id='issue'
                                value={formData.issue}
                                onChange={handleChange}
                            />
                            {/* <InputField
                                label='Year'
                                id='year'
                                value={formData.year}
                                onChange={handleChange}
                            /> */}
                            <InputField
                                type='year'
                                label='Select Year'
                                id='year'
                                value={formData.yeartemp}
                                onChange={(e)=>{
                                    const date = new Date(e.target.value)
                                    setFormData((prev) => ({
                                        ...prev,
                                        year: date.getFullYear(),
                                        yeartemp:e.target.value
                                    }))
                                }}
                                required
                            />
                            {formData.type === 'Book' && (
                                <InputField
                                    label='ISBN Number'
                                    id='isbn'
                                    value={formData.isbn}
                                    onChange={handleChange}
                                />
                            )}
                            {formData.type === 'Book Chapter' && (
                                <InputField
                                    label='ISBN Number'
                                    id='isbn'
                                    value={formData.isbn}
                                    onChange={handleChange}
                                />
                            )}
                            {['Conference', 'Journal'].includes(
                                formData.type,
                            ) && (
                                // <InputField
                                //     label='Month'
                                //     id='month'
                                //     value={formData.month}
                                //     onChange={handleChange}
                                // />
                                <>
                                    <InputField
                                        type='month' // Use the month calendar
                                        label='Select Month'
                                        id='month'
                                        value={formData.month}
                                        onChange={handleChange}
                                        required
                                    />
                                    {formData.type === 'Journal' && (
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
                                    )}
                                </>
                            )}
                            <InputField
                                label='Page Number'
                                id='pageNo'
                                value={formData.pageNo}
                                onChange={handleChange}
                            />
                            {/* /* here add a dropdown menu for indexing field with options
                            coming from the indexingOptions array and when the
                            user selects the other option he or she should be able to write their own index which then can further go to the payload dont use prompt instead create a new input field for it */}
                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Indexing:
                                </label>
                                <Select
                                    value={formData.indexing
                                        ? {
                                              value: formData.indexing,
                                              label: formData.indexing,
                                          }
                                        : null}
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
                                />
                                {isCustomIndexing && (
                                    <input
                                        type='text'
                                        className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2'
                                        placeholder='Enter custom indexing'
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
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>Authors:</label>
                                <Select
                                    isMulti
                                    options={facultyOptions}
                                    onChange={(selectedOptions) => {
                                        const selectedAuthors =
                                            selectedOptions.map(
                                                (option) => option.label,
                                            )
                                        setFormData((prev) => ({
                                            ...prev,
                                            authorName: selectedAuthors,
                                        }))
                                    }}
                                    value={formData.authorName?.map(
                                        (author) => ({
                                            value: author,
                                            label: author,
                                        }),
                                    )}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div> */}
                            <InputField
                                label='Authors'
                                id='authorName'
                                value={formData.authorName}
                                onChange={handleChange}
                            />

                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Associated Faculty:
                                </label>

                                <Select
                                    isMulti
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
                                    value={formData.associatedFaculty
                                        ?.split(',')
                                        .map((facultyId) => {
                                            const faculty = faculties.find(
                                                (obj) =>
                                                    obj.uniqueFacultyId ===
                                                    facultyId,

                                            )
                                            
                                            return faculty
                                                ? {
                                                      value: faculty.uniqueFacultyId,
                                                      label: faculty.name,
                                                  }
                                                : null
                                        })
                                        .filter(Boolean)}
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
                            {/* <InputField
                                label='Academic Session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                            /> */}

                            <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    Academic Session:
                                </label>
                                <Select
                                    value={formData.academicSession
                                        ? {
                                              value: formData.academicSession,
                                              label: formData.academicSession,
                                          }
                                        : null}
                                    onChange={(option) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            // @ts-ignore
                                            academicSession: option.value,
                                        }))
                                    }}
                                    options={academicSessionOptions}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div>

                            {/* <InputField
                                type='select'
                                options={years}
                                label='Academic session'
                                id='academicSession'
                                value={formData.academicSession}
                                onChange={handleChange}
                                required
                            /> */}
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

export default AdminModalPublications
