import prisma from '@/lib/prisma';
import BookingForm from './BookingForm';
import { notFound } from 'next/navigation';

export default async function BookingPage({ params }) {
    const { doctorId } = await params;

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: { hospital: true }
    });

    if (!doctor) notFound();

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <BookingForm doctor={doctor} />
        </div>
    );
}
