import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

// ─── Service-role client (server only, bypasses RLS) ─────────────────────────

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// ─── Browser client (PKCE flow via @supabase/ssr) ────────────────────────────

export function createBrowserClient() {
  return createSSRBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Workspace (v2: join_code based) ─────────────────────────────────────────

export interface WorkspaceConfig {
  id: string
  labName: string
  joinCode: string
}

export async function createWorkspace(labName: string): Promise<WorkspaceConfig> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ lab_name: labName })
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to create workspace: ${error?.message}`)

  return { id: data.id, labName: data.lab_name, joinCode: data.join_code }
}

export async function getWorkspaceByJoinCode(
  code: string
): Promise<WorkspaceConfig | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('join_code', code.toUpperCase().trim())
    .single()

  if (error || !data) return null

  return { id: data.id, labName: data.lab_name, joinCode: data.join_code }
}

export const getWorkspaceById = unstable_cache(
  async (id: string): Promise<WorkspaceConfig | null> => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return { id: data.id, labName: data.lab_name, joinCode: data.join_code }
  },
  ['workspace'],
  { tags: ['workspace'], revalidate: 300 }
)

// ─── User profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  workspaceId: string | null
  role: 'professor' | 'student'
  name: string | null
  email: string | null
  status: 'pending' | 'approved'
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status ?? 'approved',
  }
}

export async function createUserProfile(params: {
  userId: string
  workspaceId: string
  role: 'professor' | 'student'
  name: string | null
  email: string | null
  status?: 'pending' | 'approved'
}): Promise<UserProfile> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: params.userId,
      workspace_id: params.workspaceId,
      role: params.role,
      name: params.name,
      email: params.email,
      status: params.status ?? 'approved',
    })
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to create user profile: ${error?.message}`)

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status ?? 'approved',
  }
}

// ─── Student approval ─────────────────────────────────────────────────────────

export interface PendingStudent {
  id: string
  name: string | null
  email: string | null
  createdAt: string | null
}

export async function getPendingStudents(workspaceId: string): Promise<PendingStudent[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) return []
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  }))
}

export async function approveStudent(userId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('users')
    .update({ status: 'approved' })
    .eq('id', userId)
  if (error) throw new Error(`Failed to approve student: ${error.message}`)
}

export async function rejectStudent(userId: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
  if (error) throw new Error(`Failed to reject student: ${error.message}`)
}

export async function regenerateJoinCode(workspaceId: string): Promise<string> {
  const supabase = createServerClient()

  // Generate a new random 6-char code (same format DB trigger uses: [A-Z0-9])
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let newCode = ''
  for (let i = 0; i < 6; i++) {
    newCode += chars[Math.floor(Math.random() * chars.length)]
  }

  const { data, error } = await supabase
    .from('workspaces')
    .update({ join_code: newCode })
    .eq('id', workspaceId)
    .select('join_code')
    .single()

  if (error || !data) throw new Error(`Failed to regenerate join code: ${error?.message}`)
  return data.join_code
}

// ─── Storage: upload file ─────────────────────────────────────────────────────

const BUCKET = 'lab-files'

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<string> {
  const supabase = createServerClient()
  const ext = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : ''
  const storageKey = `${crypto.randomUUID()}${ext}`
  const path = `${folder}/${storageKey}`
  console.log('[storage] 업로드 시작 — bucket:', BUCKET, 'path:', path, 'size:', buffer.length)

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    console.error('[storage] 업로드 실패:', error)
    throw new Error(`Supabase storage upload failed: ${error.message}`)
  }

  console.log('[storage] ✓ 업로드 성공, path:', data?.path ?? path)
  return data?.path ?? path
}

export async function createSignedUploadUrl(
  storagePath: string
): Promise<{ signedUrl: string; token: string; path: string }> {
  const supabase = createServerClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(storagePath)
  if (error || !data) throw new Error(`Failed to create signed upload URL: ${error?.message}`)
  return { signedUrl: data.signedUrl, token: data.token, path: data.path }
}

// ─── Storage: delete file ─────────────────────────────────────────────────────

export async function deleteFile(storagePath: string): Promise<void> {
  const supabase = createServerClient()
  await supabase.storage.from(BUCKET).remove([storagePath])
}

// ─── Storage: get signed URL ──────────────────────────────────────────────────

export async function getSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`)
  }

  return data.signedUrl
}
