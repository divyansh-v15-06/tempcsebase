//@ts-nocheck
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import Image from 'next/image'

const InputField = ({ label, id, value, onChange ,required}) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={id} className='text-lg mb-1'>
            {label}:
        </label>
        <input
            type='text'
            id={id}
            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={value}
            required={required}
            onChange={onChange}
        />
    </div>
)

const AchievementsUpdateModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData = {},
}) => {
    console.log(initialData);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        authors: [],
        volume: '',
        photo: '',
        month: '',
        year: '',
        issue: '',
        link: '',
        type: '',
    })
    const [faculties, setFaculties] = useState([])
    const [image, setImage] = useState()

    useEffect(() => {
        if (isOpen) {
            // Pre-fill form with initial data if modal is open
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                authors: initialData.faculty_detail
                    ? initialData.faculty_detail.map(
                        (faculty) => faculty.uniqueFacultyId,
                    )
                    : [],
                volume: initialData.volume || '',
                photo: initialData.photo || '',
                month: initialData.month || '',
                date: new Date(initialData.date).toISOString().split('T')[0] || '',
                year: initialData.year || '',
                issue: initialData.issue || '',
                pdfLink: initialData.pdfLink || '',
                type: initialData.research_detail
                    ? initialData.research_detail.name
                    : '',
            })
        }
    }, [isOpen, initialData])

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get`,
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

    const handleChange = (e) => {
        const { id, value,files } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
        files&&setImage(files[0])
    }

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        setFormData((prev) => ({ ...prev, authors: selectedAuthors }))
    }

    const handleTypeChange = (option) => {
        setFormData((prev) => ({ ...prev, type: option.value }))
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        const data = new FormData();
        let updatedFormData=formData
        if(image){

            data.append("file", image);
            data.append("upload_preset", "trials");
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
            updatedFormData = { ...formData, photo: res.data.secure_url,date:new Date()}
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
                        {initialData.id
                            ? 'Update Achievements'
                            : 'Add New Achievements'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                        <InputField
                                label='1. Title'
                                id='title'
                                value={formData.title}
                                onChange={handleChange}
                                required={true}
                            />
                            <InputField
                                label='2. Description'
                                id='description'
                                value={formData.description}
                                onChange={handleChange}
                                required={true}
                            />
                           <Image src={formData.photo} width={60} height={60} alt='photo'></Image>
                            <input
                                type="file"
                                label="3. Photo"
                                id="image"
                                value={formData.image}
                                onChange={handleChange}
                                
                            />
                            <InputField
                                label='4. PDF Link'
                                id='pdfLink'
                                required={true}
                                value={formData.pdfLink}
                                onChange={handleChange}
                            />
                            <label htmlFor='date' className='text-lg mb-1'>
                                5. Date:
                            </label>
                            <input
                                type='date'
                                id='date'
                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={formData.date}
                                required={true}
                                onChange={(e)=>
                                    setFormData((prev) => ({
                                        ...prev,
                                        date: e.target.value,
                                    }))
                                }
                            />
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    3. Authors:
                                </label>
                                <Select
                                    isMulti
                                    value={facultyOptions.filter((option) =>
                                        formData.authors.includes(option.value),
                                    )}
                                    options={facultyOptions}
                                    onChange={handleAuthorChange}
                                    className='basic-multi-select'
                                    classNamePrefix='select'
                                />
                            </div> */}
                            
                            {/* <div className='flex flex-col my-2'>
                                <label className='text-lg mb-1'>
                                    9. Select Type of Research:
                                </label>
                                <Select
                                    value={{
                                        value: formData.type,
                                        label: formData.type,
                                    }}
                                    onChange={handleTypeChange}
                                    options={[
                                        { value: 'Journal', label: 'Journal' },
                                        { value: 'Book', label: 'Book' },
                                        {
                                            value: 'Book Chapter',
                                            label: 'Book Chapter',
                                        },
                                        { value: 'Patent', label: 'Patent' },
                                    ]}
                                    className='basic-single'
                                    classNamePrefix='select'
                                />
                            </div> */}
                        </div>
                        <div className='mt-4 flex justify-end'>
                            <Button
                                type='submit'
                                className='bg-blue-500 text-white mr-2'
                            >
                                {initialData.id ? 'Update' : 'Submit'}
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

export default AchievementsUpdateModal
