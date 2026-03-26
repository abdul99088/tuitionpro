import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const [centerName, setCenterName] = useState('')
  const [stats, setStats] = useState({ students: 0, unpaid: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCenterName(user?.user_metadata?.center_name || 'My Center')
    })
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    const { count: unpaidCount } = await supabase
      .from('fees')
      .select('*', { count: 'exact', head: true })
      .eq('paid', false)

    setStats({ students: studentCount || 0, unpaid: unpaidCount || 0 })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar centerName={centerName} />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.students}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Unpaid Fees</p>
            <p className="text-4xl font-bold text-red-500 mt-2">{stats.unpaid}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/students"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Manage Students
          </Link>
          <Link to="/fees"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Manage Fees
          </Link>
        </div>
      </div>
    </div>
  )
}