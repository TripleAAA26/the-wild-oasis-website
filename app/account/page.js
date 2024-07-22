import { auth } from '@/app/_lib/auth'

export const metadata = {
    title: 'Guests area',
}

export default async function AccountPage() {
    const session = await auth()
    const firstName = session.user.name.split(' ').at(0)

    return (
        <h2 className='font-semibold text-2xl text-accent-400 mb-7'>
            Welcome, {firstName}
        </h2>
    )
}