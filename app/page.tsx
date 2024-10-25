import { signFernJWT, createCallbackUrl } from '@/auth/utils'
import { redirect } from 'next/navigation'
import { use } from 'react'

const audiences = ['internal', 'beta']

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function Home(props: HomeProps) {
  const searchParams = use(props.searchParams)

  // This is a server action that mocks the login process.
  // please see `app/api/login/route.ts` for a full implementation.
  async function handleSubmit(formData: FormData) {
    'use server'
    const audience = formData
      .getAll('audience')
      .filter((audience): audience is string =>
        audiences.includes(String(audience))
      )
    const fern_token = await signFernJWT({
      audience: audience.length > 0 ? audience : undefined,
    })
    const state =
      typeof searchParams['state'] === 'string' ? searchParams['state'] : null
    const url = createCallbackUrl(fern_token, state)
    redirect(url.toString())
  }

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <form
          className="flex min-w-[300px] flex-col gap-8"
          action={handleSubmit}
        >
          <h1 className="text-center text-2xl font-bold">Audience Demo</h1>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <input
                id="everyone"
                checked
                disabled
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              />
              <label htmlFor="orphaned" className="ms-2">
                Orphaned
              </label>
            </div>

            {audiences.map((audience) => (
              <div key={audience} className="flex items-center justify-center">
                <input
                  id={audience}
                  type="checkbox"
                  name="audience"
                  value={audience}
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label htmlFor={audience} className="ms-2">
                  {audience}
                </label>
              </div>
            ))}
          </div>

          <button
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-solid border-transparent bg-foreground px-4 text-sm text-background transition-colors hover:bg-[#383838] sm:h-12 sm:px-5 sm:text-base dark:hover:bg-[#ccc]"
            type="submit"
          >
            Login
          </button>
        </form>
      </main>
    </div>
  )
}
