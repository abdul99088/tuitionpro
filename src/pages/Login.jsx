import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">TuitionPro Login</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full border p-3 rounded-lg" type="email"
            placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border p-3 rounded-lg" type="password"
            placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold">
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          No account? <Link to="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </div>
    </div>
  )
}