'use server'

import { revalidatePath } from 'next/cache'
import { updateProjectCardLast4 } from '@/lib/db'

interface ActionState {
  ok: boolean
  error?: string
}

export async function updateCardLast4Action(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const projectId = formData.get('projectId') as string
  const workspaceId = formData.get('workspaceId') as string
  const cardLast4 = (formData.get('card_last4') as string | null)?.trim() ?? ''

  if (!/^\d{4}$/.test(cardLast4)) {
    return { ok: false, error: '4자리 숫자를 입력해주세요.' }
  }

  await updateProjectCardLast4(projectId, workspaceId, cardLast4)
  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}
