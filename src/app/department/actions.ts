// src/app/department/actions.ts
'use server'; // Mark this module as Server Actions

import connectDB from '@/lib/db';
import Request from '@/models/Request';
import { revalidatePath } from 'next/cache';

interface CreateRequestInput {
    name: string;
    position: string;
    qualifications: string;
}

export async function createRequestAction(
    data: CreateRequestInput
): Promise<{ success: boolean; error?: string }> {
    await connectDB();

    try {
        const newRequest = new Request({
            name: data.name,
            position: data.position,
            qualifications: data.qualifications,
            status: 'pending', // Default status
        });

        await newRequest.save();
        console.log('Request saved:', newRequest);
        revalidatePath('/hr'); // Update the HR dashboard cache

        return { success: true };
    } catch (error) {
        console.error('Error saving request:', error);
        return { success: false, error: 'Failed to submit request.' };
    }
}