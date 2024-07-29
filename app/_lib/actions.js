'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth, signIn, signOut } from '@/app/_lib/auth'
import { supabase } from '@/app/_lib/supabase'
import { getBookings } from '@/app/_lib/data-service'

export async function createBooking( bookingData, formData ) {
    const session = await auth()
    if (!session) throw new Error('You must be logged in')

    const newBooking = {
        ...bookingData,
        guestId: session.user.guestId,
        numGuests: Number(formData.get('numGuests')),
        observations: formData.get('observations').slice(0, 1000),
        extrasPrice: 0,
        totalPrice: bookingData.cabinPrice,
        isPaid: false,
        hasBreakfast: false,
        status: 'unconfirmed',
    }

    const {  error } = await supabase
        .from('bookings')
        .insert([ newBooking ])

    if (error) throw new Error('Booking could not be created')

    revalidatePath(`/cabins/${bookingData.cabinId}`)

    redirect('/cabins/thankyou')
}

export async function updateGuest(formData) {
    const session = await auth()
    if (!session) throw new Error('You must be logged in')

    const nationalID = formData.get('nationalID')
    const [ nationality, countryFlag ] = formData.get('nationality').split('%')

    if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) throw new Error('Please provide a valid national ID')

    const updateData = { nationality, countryFlag, nationalID }

    const { data, error } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', session.user.guestId)

    if (error) throw new Error('Guest could not be updated')

    revalidatePath('/account/profile')
}

export async function deleteReservation(bookingId) {
    const session = await auth()
    if (!session) throw new Error('You must be logged in')

    const guestBookings = await getBookings(session.user.guestId)
    const guestBookingIds = guestBookings.map(booking => booking.id)
    if (!guestBookingIds.includes(bookingId)) throw new Error('You are not allowed to delete this booking')

    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

    if (error) throw new Error('Booking could not be deleted')

    revalidatePath('/account/reservations')
}

export async function updateReservation(formData) {
    const session = await auth()
    if (!session) throw new Error('You must be logged in')

    const bookingId = Number(formData.get('bookingId'))
    const numGuests = Number(formData.get('numGuests'))
    const observations = formData.get('observations').slice(0, 1000)
    const updateData = { numGuests, observations }

    const guestBookings = await getBookings(session.user.guestId)
    const guestBookingIds = guestBookings.map(booking => booking.id)

    if (!guestBookingIds.includes(bookingId)) throw new Error('You are not allowed to update this booking')

    const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single()

    if (error) throw new Error('Booking could not be updated')

    revalidatePath('/account/reservations')
    revalidatePath(`/account/reservations/edit/${bookingId}`)
    redirect('/account/reservations')
}

export async function signInAction() {
    await signIn('google', { redirectTo: '/account' })
}


export async function signOutAction() {
    await signOut({ redirectTo: '/' })
}