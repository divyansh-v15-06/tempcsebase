import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// const InputField = ({ label, value, onChange, id }) => (
//     <div className='flex flex-col my-2'>
//         <label htmlFor={label} className='text-lg mb-1'>
//             {label}:
//         </label>
//         <input
//             type='text'
//             id={id}
//             className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
//             value={value}
//             onChange={onChange}
//         />
//     </div>
// )

const InputField = ({
    label,
    value,
    onChange,
    id,
    type = 'text',
    disabled = false,
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
        ) : (
            <DatePicker
                selected={value as Date}
                onChange={(date: Date | null) =>
                    onChange({ target: { id, value: date || '' } })
                }
                dateFormat='dd/MM/yyyy'
                disabled={disabled}
                placeholderText='dd/mm/yyyy'
                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                showYearDropdown
                scrollableYearDropdown
            />
        )}
    </div>
)

const AdminModalPersonalinfo = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        dateOfJoining: '',
        phoneNo: '',
        educationalQualification: '',
        teachingExperience: '',
        administrativeExperience: '',
        honorsRecognitions: '',
        googleScholar: '',
        scopus: '',
        publons: '',
        orcid: '',
        researchGate: '',
        vidwan: '',
        linkedIn: '',
        rgLink: '',
    })

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form Data:', formData)
        onSubmit(formData)
    }

    return (
        // @ts-ignore
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            {/* @ts-ignore */}
            <DialogOverlay className='z-[1000]'>
                {/* @ts-ignore */}
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
                        Add New Personal Info
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 gap-4'>
                            <div className='flex items-end space-x-2'>
                                <InputField
                                    type='date'
                                    label='Date of Birth'
                                    id='dateOfBirth'
                                    value={formData.dateOfBirth}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value);
                                        
                                        // Convert Date object back to YYYY-MM-DD format
                                        const formattedDate = selectedDate.toISOString().split("T")[0];
                                
                                        console.log(formattedDate); // Logs: "2025-01-31"
                                
                                        setFormData((prev) => ({
                                            ...prev,
                                            [e.target.id]: formattedDate, // Store as "YYYY-MM-DD"
                                        }));
                                    }}
                                />
                            </div>
                            <div className='flex items-end space-x-2'>
                                <InputField
                                    type='date'
                                    label='Date of Joining'
                                    id='dateOfJoining'
                                    value={formData.dateOfJoining}
                                    onChange={(e) => {
                                        const selectedDate = new Date(e.target.value);
                                        
                                        // Convert Date object back to YYYY-MM-DD format
                                        const formattedDate = selectedDate.toISOString().split("T")[0];
                                
                                        console.log(formattedDate); // Logs: "2025-01-31"
                                
                                        setFormData((prev) => ({
                                            ...prev,
                                            [e.target.id]: formattedDate, // Store as "YYYY-MM-DD"
                                        }));
                                    }}
                                />
                            </div>
                            <InputField
                                type='text'
                                label='Phone'
                                id='phoneNo'
                                value={formData.phoneNo}
                                onChange={handleChange}
                            />
                            
                            <InputField
                                type='text'
                                label='Google Scholar'
                                id='googleScholar'
                                value={formData.googleScholar}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='Scopus'
                                id='scopus'
                                value={formData.scopus}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='Publons'
                                id='publons'
                                value={formData.publons}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='ORCID'
                                id='orcid'
                                value={formData.orcid}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='ResearchGate'
                                id='researchGate'
                                value={formData.researchGate}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='Vidwan'
                                id='vidwan'
                                value={formData.vidwan}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='LinkedIn'
                                id='linkedIn'
                                value={formData.linkedIn}
                                onChange={handleChange}
                            />
                            <InputField
                                type='text'
                                label='RG Link'
                                id='rgLink'
                                value={formData.rgLink}
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
                    </form>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default AdminModalPersonalinfo
