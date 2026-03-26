import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Fees() {
  const [students, setStudents] = useState([])
  const [fees, setFees] = useState([])
  const [centerName, setCenterName] = useState('')
  const [form, setForm] = useState({ student_id: '', month: '', amount: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const months = ['Jan 2026','Feb 2026','Mar 2026','Apr 2026',
    'May 2026','Jun 2026','Jul 2026','Aug 2026',
    'Sep 2026','Oct 2026','Nov 2026','Dec 2026']

  useEffect(() => {
    fetchAll()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCenterName(user?.user_metadata?.center_name || '')
    })
  }, [])

  const fetchAll = async () => {
    const { data: s } = await supabase.from('students').select('*')
    const { data: f } = await supabase.from('fees')
      .select('*, students(name)')
      .order('created_at', { ascending: false })
    setStudents(s || [])
    setFees(f || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('fees').insert({
      student_id: form.student_id,
      month: form.month,
      amount: parseFloat(form.amount),
      user_id: user.id,
      paid: false
    })
    if (error) setError(error.message)
    else {
      setForm({ student_id: '', month: '', amount: '' })
      fetchAll()
    }
    setLoading(false)
  }

  const togglePaid = async (fee) => {
    await supabase.from('fees').update({
      paid: !fee.paid,
      paid_at: !fee.paid ? new Date().toISOString() : null
    }).eq('id', fee.id)
    fetchAll()
  }

  const unpaidCount = fees.filter(f => !f.paid).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar centerName={centerName} />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Fees</h2>
          {unpaidCount > 0 && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              {unpaidCount} unpaid
            </span>
          )}
        </div>

        {/* Add Fee Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="font-semibold mb-4 text-lg">Add Fee Record</h3>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
            <select className="border p-3 rounded-lg" value={form.student_id}
              onChange={e => {
                const s = students.find(s => s.id === e.target.value)
                setForm({ ...form, student_id: e.target.value, amount: s?.monthly_fee || '' })
              }} required>
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select className="border p-3 rounded-lg" value={form.month}
              onChange={e => setForm({ ...form, month: e.target.value })} required>
              <option value="">Select Month</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input className="border p-3 rounded-lg" placeholder="Amount (Rs.)"
              type="number" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} required />
            <button type="submit"
              className="col-span-3 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 font-semibold"
              disabled={loading}>
              {loading ? 'Adding...' : 'Add Fee Record'}
            </button>
          </form>
        </div>

        {/* Fees List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm text-gray-600">Student</th>
                <th className="text-left p-4 text-sm text-gray-600">Month</th>
                <th className="text-left p-4 text-sm text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm text-gray-600">Status</th>
                <th className="text-left p-4 text-sm text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 && (
                <tr><td colSpan="5" className="text-center p-6 text-gray-400">
                  No fee records yet.
                </td></tr>
              )}
              {fees.map(f => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{f.students?.name}</td>
                  <td className="p-4 text-gray-600">{f.month}</td>
                  <td className="p-4 text-gray-600">Rs. {f.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      f.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {f.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => togglePaid(f)}
                      className="text-blue-500 text-sm hover:underline">
                      Mark {f.paid ? 'Unpaid' : 'Paid'}
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