'use client'

import { useOptimistic } from 'react'

import ReservationCard from '@/app/_components/ReservationCard'
import { deleteReservation } from '@/app/_lib/actions'

export default function ReservationList({ bookings }) {

    const [ optimisticBookings, optimisticDelete ] = useOptimistic(bookings,
        (curBookings, bookingId) => {
            return curBookings.filter(booking => booking.id !== bookingId)
        }
    )

    async function handleDelete(bookingId) {
        optimisticDelete(bookingId)
        await deleteReservation(bookingId)
    }

    return (
        <ul className='space-y-6'>
            {optimisticBookings.map((booking) => (
                <ReservationCard onDelete={handleDelete} booking={booking} key={booking.id}/>
            ))}
        </ul>
    )
}

