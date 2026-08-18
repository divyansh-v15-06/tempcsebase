import React from 'react'

type Props = {}

export default function BackGround2({}: Props) {
    return (
        <div className='absolute z-[-10]'>
            <svg
                id='visual'
                viewBox='0 0 1920 1080'
                width='1920'
                height='1080'
                xmlns='http://www.w3.org/2000/svg'
                version='1.1'
            >
                <path
                    d='M0 271L192 401L384 422L576 465L768 390L960 228L1152 401L1344 390L1536 314L1728 260L1920 260L1920 0L1728 0L1536 0L1344 0L1152 0L960 0L768 0L576 0L384 0L192 0L0 0Z'
                    fill='#f6f0ea'
                ></path>
                <path
                    d='M0 433L192 627L384 573L576 649L768 660L960 498L1152 671L1344 681L1536 563L1728 476L1920 422L1920 258L1728 258L1536 312L1344 388L1152 399L960 226L768 388L576 463L384 420L192 399L0 269Z'
                    fill='#f9f5f1'
                ></path>
                <path
                    d='M0 563L192 843L384 789L576 779L768 854L960 649L1152 822L1344 822L1536 714L1728 681L1920 573L1920 420L1728 474L1536 561L1344 679L1152 669L960 496L768 658L576 647L384 571L192 625L0 431Z'
                    fill='#fcfaf8'
                ></path>
                <path
                    d='M0 1081L192 1081L384 1081L576 1081L768 1081L960 1081L1152 1081L1344 1081L1536 1081L1728 1081L1920 1081L1920 571L1728 679L1536 712L1344 820L1152 820L960 647L768 852L576 777L384 787L192 841L0 561Z'
                    fill='#ffffff'
                ></path>
            </svg>
        </div>
    )
}
