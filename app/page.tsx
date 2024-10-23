import Link from 'next/link'
import { Button } from './components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to HealthCare App</h1>
      <div className="flex gap-4">
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
        <Link href="/auth/signup">
          <Button variant="outline">Sign Up</Button>
        </Link>
      </div>
    </main>
  )
}
