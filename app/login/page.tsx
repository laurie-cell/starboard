import LoginPageContent from '@/components/LoginPageContent'
import { getSession } from '@/lib/auth-server'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirmed?: string; signup?: string }>
}) {
  const { session } = await getSession()
  const params = await searchParams

  // Skip redirect in test mode
  if (session && process.env.NEXT_PUBLIC_TEST_MODE !== 'true') {
    redirect('/')
  }

  return (
    <LoginPageContent
      initialSignUp={params?.signup === 'true'}
      confirmed={params?.confirmed === 'true'}
      error={params?.error}
    />
  )
}
