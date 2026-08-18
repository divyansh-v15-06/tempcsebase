//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'
import { Select } from '@radix-ui/react-select'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
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

function PhdUpdateStatusModal({
    isOpen,
    onClose,
    onSubmit,
    initialData={}, // New prop to provide initial values
}) {

    const [formData, setFormData] = useState({})
    const imageRef = useRef<HTMLInputElement>()
    const [image, setImage] = useState(null)
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        setFormData({
            rollNo: initialData.rollNo||'',
           endDate: initialData.endDate||'',
           title: initialData.title||'',
        })
    }
        , [])

    const handleChange = (e) => {
        const { id, value, files } = e.target;
        if (files && files[0]) {
            setImage(files[0]);
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = new FormData();
        let updatedFormData = {}
        if (image) {
            data.append("file", image);
            data.append("upload_preset", "trials");
            setLoading(true);
            const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)
            setLoading(false);
            updatedFormData = { ...formData, photo: res.data.secure_url }
        }
        else {

            updatedFormData = { ...formData }
        }

        onSubmit(updatedFormData, initialData.id)
        setFormData({});
        onClose();
        setImage(null);
    }
    console.log(initialData)

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                    {isLoading ? (<h1>Uploading Data ...</h1>) : (<><h2 id='dialog-title' className='text-2xl mb-4'>
                        Update Phd Scholar
                    </h2>
                        <form onSubmit={handleSubmit}>
                        <InputField
                            label='Thesis Title'
                            id='title'
                            value={formData.title}
                            onChange={handleChange}
                        />
                        <label  className='text-lg mb-1 block'>
                            Passing Date:
                        </label>
                        <DatePicker
                            selected={formData.endDate}
                            onChange={(date) => setFormData({ ...formData, endDate: new Date(date) })}
                            placeholderText='dd/mm/yyyy'
                            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            ></DatePicker>
                        <InputField
                            label='Roll No'
                            id='rollNo'
                            value={formData.rollNo}
                            onChange={handleChange}
                        />
                        

                            <div className='mt-4'>
                                <Button
                                    type='submit'
                                    className='bg-blue-500 text-white'
                                >
                                    Submit
                                </Button>
                                <Button
                                    onClick={onClose}
                                    className='ml-2 bg-gray-500 text-white'
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form></>)}
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    )
}

export default PhdUpdateStatusModal;
