import React from 'react'

type Props = {}

export default function BackGround1({}: Props) {
    return (
        <div className='absolute z-[-10] w-full'>
            <svg
                id='visual'
                viewBox='0 0 1920 1080'
                width='1920'
                height='1080'
                xmlns='http://www.w3.org/2000/svg'
                version='1.1'
            >
                <path
                    d='M0 206L192 206L384 120L576 185L768 174L960 163L1152 217L1344 141L1536 206L1728 141L1920 131L1920 0L1728 0L1536 0L1344 0L1152 0L960 0L768 0L576 0L384 0L192 0L0 0Z'
                    fill='#ffffff'
                ></path>
                <path
                    d='M0 498L192 627L384 487L576 498L768 487L960 411L1152 465L1344 455L1536 606L1728 595L1920 541L1920 129L1728 139L1536 204L1344 139L1152 215L960 161L768 172L576 183L384 118L192 204L0 204Z'
                    fill='#fcfaf8'
                ></path>
                <path
                    d='M0 725L192 833L384 681L576 671L768 746L960 681L1152 735L1344 735L1536 768L1728 822L1920 703L1920 539L1728 593L1536 604L1344 453L1152 463L960 409L768 485L576 496L384 485L192 625L0 496Z'
                    fill='#f9f5f1'
                ></path>
                <path
                    d='M0 1081L192 1081L384 1081L576 1081L768 1081L960 1081L1152 1081L1344 1081L1536 1081L1728 1081L1920 1081L1920 701L1728 820L1536 766L1344 733L1152 733L960 679L768 744L576 669L384 679L192 831L0 723Z'
                    fill='#f6f0ea'
                ></path>
            </svg>
        </div>
    )
}
