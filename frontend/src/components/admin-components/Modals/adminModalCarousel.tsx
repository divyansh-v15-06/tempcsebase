//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import Select from 'react-select'
import toast from 'react-hot-toast'

const InputField = ({ label, value, onChange, id }) => (
    <div className='flex flex-col my-2'>
        <label htmlFor={label} className='text-lg mb-1'>
            {label}:
        </label>
        <input
            type='text'
            id={id}
            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={value}
            onChange={onChange}
        />
    </div>
)

const AdminModalCarousel = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        photo: '',

    })
    const [faculties, setFaculties] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const imageRef = useRef<HTMLInputElement>(null)
    const [image, setImage] = useState<File | null>(null)

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/faculty/get`,
                )
                console.log('response.data', response.data)
                if (Array.isArray(response.data.data)) {
                    setFaculties(response.data.data)
                } else {
                    console.error('Unexpected response format:', response.data)
                }
            } catch (error) {
                console.error('Error fetching Carousal', error)
            }
        }

        fetchFaculties()
    }, [])

    const handleChange = (e) => {
        const { id, value, files } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
        if (id === 'image' && files && files.length > 0) {
            // @ts-ignore
            if (files[0].size > 8 * 1024 * 1024) { // 2MB limit
                toast.error('Image size should be less than 8MB')
                return;
            }
            // @ts-ignore
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type)) {
                toast.error('Only JPEG, PNG, and GIF images are allowed')
                return;
            }
            // @ts-ignore

            setImage(files[0]);
        }
    }

    const handleAuthorChange = (selectedOptions) => {
        const selectedAuthors = selectedOptions.map((option) => option.value)
        setFormData((prev) => ({ ...prev, authors: selectedAuthors }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "trials");
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
            const updatedFormData = { ...formData, photo: res.data.secure_url }
            onSubmit(updatedFormData)
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Error uploading image')
        }
        setFormData({})
        setIsLoading(false)
    }

    const facultyOptions = faculties.map((faculty) => ({
        // @ts-ignore

        value: faculty.uniqueFacultyId,
        // @ts-ignore

        label: faculty.name,
    }))
    console.log('facultyOptions', facultyOptions)

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
                        Add new Photo
                    </h2>
                    {isLoading ? <h1 className='text-blue-400 '>Image Uploading ...</h1> : <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <input
                                type="file"
                                label="image"
                                id="image"
                                value={formData.image}
                                required={true}
                                onChange={handleChange}

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
                    </form>}
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default AdminModalCarousel
