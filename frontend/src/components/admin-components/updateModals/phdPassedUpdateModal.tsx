//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'


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
                required={required}

            />
        ) :
            type === 'number' ? (
                <input
                    type="number"
                    id={id}
                    className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={value}
                    onChange={onChange}
                    required={required}
                    inputMode="numeric"
                    pattern="[0-9]*"

                />
            )
                : type === 'select' ? (
                    <Select
                        id={id}
                        required={required}
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
                        required={required}
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
                )
                    // ) : type === 'month' ? (
                    //     <Select
                    //         id={id}
                    //         value={options.find(option => option.value === value)}
                    //         onChange={(selectedOption) => onChange({ target: { id, value: selectedOption.value } })}
                    //         className="basic-single"
                    //         options={options}
                    //         classNamePrefix="select"
                    //     />
                    // ) :
                    : type === 'month' ? (
                        <DatePicker
                            required={required}
                            minDate={minDate}
                            selected={value}
                            onChange={(date) => onChange({ target: { id, value: date } })}
                            showMonthYearPicker

                            dateFormat='MMM'
                            disabled={disabled}
                            placeholderText='Select Month'

                            className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                    ) :
                        (
                            <DatePicker
                                required={required}

                                selected={value as Date}
                                dateFormat='dd/MM/yyyy'
                                onChange={(date: Date) =>
                                    onChange({ target: { id, value: date } })
                                }
                                disabled={disabled}
                                placeholderText='dd/mm/yyyy'
                                className='border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        )
        }
    </div>
)

const UpdatePhdPassedScholar = ({ isOpen, onClose, onSubmit,InitalData }) => {
    const [formData, setFormData] = useState({
        Supervisor: '',
        rollNo: '',
        title: '',
        endDate: '',
        CoSupervisor: '',
        researchArea: '',
        name: '',
        LinkedIn: '',
        email: '',
        photo: '',
        status:'passed',
        GoogleScholar:'',
        Scopus:''
    })
    
    
    const [image, setImage] = useState()
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (InitalData) {
            setFormData({
                Supervisor: InitalData.Supervisor||'',
                rollNo: InitalData.rollNo||'',
                title: InitalData.title||'',
                endDate: InitalData.endDate,
                CoSupervisor: InitalData.CoSupervisor||'',
                researchArea: InitalData.researchArea||'',
                name: InitalData.name||'',
                LinkedIn: InitalData.LinkedIn||'',
                email: InitalData.email||'',
                photo: InitalData.photo||'',
                status:'passed',
                GoogleScholar:InitalData.GoogleScholar||'',
                Scopus:InitalData.Scopus||''
            })
        }
    }
        , [InitalData])
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
        let updatedFormData = {  }
        const data = new FormData();
        if (image) {
        data.append("file", image);
        data.append("upload_preset", "trials");
        setLoading(true)
        const res = await axios.post("https://api.cloudinary.com/v1_1/dvnrlqqpq/image/upload", data)

        
        updatedFormData = { ...formData, photo: res.data.secure_url }
        }
        else {
            updatedFormData = { ...formData }
        }
        onSubmit(updatedFormData,InitalData.id)
        setFormData({
            rollNo: '',
            title: '',
            endDate:'',
            Supervisor: '',
            CoSupervisor: '',
            name: '',
            LinkedIn: '',
            email: '',
            photo: '',
            status:'passed',
            GoogleScholar:'',
            Scopus:''
        })
        setLoading(false)
        onClose()
    }

    return (
        <Dialog isOpen={isOpen} onDismiss={onClose}>
            <DialogOverlay className='z-[1000]'>
                <DialogContent
                    aria-labelledby='dialog-title'
                    className='bg-white p-6 rounded-lg shadow-lg w-96'
                >
                    {isLoading?(<h1>Uploading Data ...</h1>): (<><h2 id='dialog-title' className='text-2xl mb-4'>
                        Update Passed Phd Scholar
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <InputField
                            label='Name'
                            id='name'
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Roll No.'
                            id='rollNo'
                            value={formData.rollNo}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Supervisor'
                            id='Supervisor'
                            value={formData.Supervisor}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Co-Supervisor'
                            id='CoSupervisor'
                            value={formData.CoSupervisor}
                            onChange={handleChange}
                        />
                        <InputField
                            label='Thesis Title'
                            id='title'
                            value={formData.title}
                            onChange={handleChange}
                        />
                        <InputField
                        type='date'
                            label='Date of Passing'
                            id='endDate'
                            value={formData.endDate}
                            onChange={(e)=>{
                                setFormData((prev) => ({ ...prev, endDate: new Date(e.target.value) }))
                            }}
                        />
                        

                        <InputField
                            label='Email'
                            id='email'
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {formData.photo&&<img
                            src={formData.photo}
                            alt="Scholar"
                            className='w-24 h-24 mb-2'
                        />}
                        <label htmlFor="image" className='text-lg mb-2 block'>
                            Image(Upload New) If Required:
                            </label>
                            <input
                                type="file"
                                label="image"
                                id="image"
                                className='mb-2'
                                value={formData.image}
                                onChange={handleChange}
                            />
                    
                        
                        <div className='mt-4'>
                            <Button
                                type='submit'
                                className='bg-blue-500 text-white'
                            >
                                Update
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

export default UpdatePhdPassedScholar
