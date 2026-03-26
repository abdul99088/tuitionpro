import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar({ centerName }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold text-blue-600">
        TuitionPro
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/students" className="text-gray-600 hover:text-blue-600 text-sm">
          Students
        </Link>
        <Link to="/fees" className="text-gray-600 hover:text-blue-600 text-sm">
          Fees
        </Link>
        <span className="text-gray-400 text-sm">{centerName}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>
  )
}