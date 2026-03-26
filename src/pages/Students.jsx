import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Students() {
  const [students, setStudents] = useState([])
  const [centerName, setCenterName] = useState('')
  const [form, setForm] = useState({ name: '', parent_phone: '', grade: '', monthly_fee: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchStudents()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCenterName(user?.user_metadata?.center_name || '')
    })
  }, [])

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setStudents(data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('students').insert({
      ...form,
      monthly_fee: parseFloat(form.monthly_fee),
      user_id: user.id
    })
    if (error) setError(error.message)
    else {
      setForm({ name: '', parent_phone: '', grade: '', monthly_fee: '' })
      fetchStudents()
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return
    await supabase.from('students').delete().eq('id', id)
    fetchStudents()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar centerName={centerName} />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Students</h2>

        {/* Add Student Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="font-semibold mb-4 text-lg">Add New Student</h3>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <input className="border p-3 rounded-lg" placeholder="Student Name"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              required />
            <input className="border p-3 rounded-lg" placeholder="Parent Phone e.g 03001234567"
              value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })}
              required />
            <input className="border p-3 rounded-lg" placeholder="Grade e.g Class 8"
              value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} />
            <input className="border p-3 rounded-lg" placeholder="Monthly Fee (Rs.)"
              type="number" value={form.monthly_fee}
              onChange={e => setForm({ ...form, monthly_fee: e.target.value })}
              required />
            <button type="submit"
              className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-semibold"
              disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm text-gray-600">Name</th>
                <th className="text-left p-4 text-sm text-gray-600">Grade</th>
                <th className="text-left p-4 text-sm text-gray-600">Phone</th>
                <th className="text-left p-4 text-sm text-gray-600">Fee/Month</th>
                <th className="text-left p-4 text-sm text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan="5" className="text-center p-6 text-gray-400">
                  No students yet. Add one above.
                </td></tr>
              )}
              {students.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 text-gray-600">{s.grade || '—'}</td>
                  <td className="p-4 text-gray-600">{s.parent_phone}</td>
                  <td className="p-4 text-gray-600">Rs. {s.monthly_fee}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(s.id)}
                      className="text-red-500 text-sm hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}