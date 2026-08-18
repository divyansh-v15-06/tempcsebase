// import React from 'react'

// type Props = {}

// export default function PlacementData({}: Props) {
//     return (
//         <div>
//             PlacementData
//             <div>
//                 {/* add filters same as faculty page */}
//             </div>
//             <div>
//                {/* show data same as faculty page here */}
//             </div>
//         </div>
//     )
// }

'use client'
import React from 'react'
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SelectItem } from '@/components/ui/select'

type Props = {}

const PlacementData = ({}: Props) => {
    const appStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '',
    }

    const cardContainerStyle: React.CSSProperties = {
        width: '15rem',
        borderRadius: '0.5rem',
        boxShadow: '0px 10px 8px #999',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0.5rem',
        backgroundColor: 'white',
        height: 'fit-content',
        textAlign: 'center',
    }

    const cardImgStyle: React.CSSProperties = {
        width: 'calc(80% - 2rem)',
        height: '150px',
        borderRadius: '0.5rem',
        marginLeft: '1rem',
        marginRight: '1rem',
        objectFit: 'cover',
    }

    const textStyle = {
        margin: '0.5rem 5%',
    }

    const darkGrayTextStyle = {
        margin: '0.5rem 5%',
        color: 'black',
    }

    const emailStyle = {
        margin: '0.5rem 5%',
        color: 'maroon',
    }

    const Card = ({
        imgSrc,
        imgAlt,
        name,
        roll_no,
        batch,
        company_name,
        email,
    }: {
        imgSrc: string
        imgAlt: string
        name: string
        roll_no: string
        batch: string
        company_name: string
        email: string
    }) => (
        <div style={cardContainerStyle}>
            {name && <h1 style={textStyle}>{name}</h1>}
            {imgSrc && imgAlt && (
                <img src={imgSrc} alt={imgAlt} style={cardImgStyle} />
            )}
            {roll_no && <h3 style={darkGrayTextStyle}>{roll_no}</h3>}
            {batch && <h3 style={darkGrayTextStyle}>{batch}</h3>}
            {company_name && <h3 style={darkGrayTextStyle}>{company_name}</h3>}
            {email && <h3 style={emailStyle}>{email}</h3>}
        </div>
    )

    interface FilterOptionsProps {
        filterName: string
        setFilterValue: React.Dispatch<React.SetStateAction<string>>
        options: {
            value: string
            title: string
        }[]
    }

    const FilterOptions: React.FC<FilterOptionsProps> = ({
        filterName,
        setFilterValue,
        options,
    }) => {
        const handleChange = (newValue: string) => {
            setFilterValue(newValue)
        }

        return (
            <div className='px-4 flex lg:flex-col gap-1 justify-center items-center'>
                <div>
                    <Select onValueChange={handleChange}>
                        <SelectTrigger className='lg:w-[230px]'>
                            <SelectValue placeholder={filterName} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((obj) => (
                                <SelectItem key={obj.value} value={obj.value}>
                                    {obj.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        )
    }

    const App = () => (
        <div style={appStyle}>
            <div>
                <h1
                    style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        textAlign: 'center',
                    }}
                >
                    Filters
                </h1>
                <FilterOptions
                    filterName='Select Option'
                    setFilterValue={() => {}}
                    options={[
                        { value: 'option1', title: 'Option 1' },
                        { value: 'option2', title: 'Option 2' },
                    ]}
                />
            </div>
            <Card
                imgSrc='https://picsum.photos/300/200'
                imgAlt='Card Image'
                name='Riya'
                roll_no='Roll No.: 123456'
                batch='Batch : 2024'
                company_name='Company Name : Google'
                email='123456@nith.ac.in'
            />
        </div>
    )

    return (
        <div>
            <App />
        </div>
    )
}

export default PlacementData
