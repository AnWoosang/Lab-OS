'use server'

import { revalidatePath } from 'next/cache'
import { approveStudent, rejectStudent } from '@/lib/supabase'

export async function approveStudentAction(userId: string): Promise<void> {
  await approveStudent(userId)
  revalidatePath('/dashboard')
}

export async function rejectStudentAction(userId: string): Promise<void> {
  await rejectStudent(userId)
  revalidatePath('/dashboard')
}
