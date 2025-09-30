import { useState } from 'react'
import LabeledInputField from '../../components/LabeledInputField'
import LabeledDropDownField from '../../components/LabeledDropDownField'
import Button from '../../components/Button'
import api from '../../services/api'
import EndPoints from '../../constants/endpoints'

const ADMIN_ROLES = [
  { label: 'Admin', value: 'admin' },
//   { label: 'Super Admin', value: 'super admin' },
]

function CreateAdminsPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    setSuccess('')
    if (!email || !role) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post(EndPoints.systemAdmin.create, {
        email,
        role,
      })

      if (res.data.success) {
        setSuccess('Administrator created successfully!')
        // Reset form
        setEmail('')
        setRole('')
      } else {
        setError(res.data.message || 'Failed to create administrator.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create administrator.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-6">Create Administrator</h2>

      <div className="flex items-center justify-between gap-10">
        <LabeledInputField
          title="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="w-full"></div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <LabeledDropDownField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ADMIN_ROLES}
          required
        />
        <div className="w-full"></div>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}

      <div>
        <Button
          className="max-w-xs mt-4"
          label={loading ? 'Creating...' : 'Create Administrator'}
          onClick={handleCreate}
          disabled={loading}
        />
      </div>
    </div>
  )
}

export default CreateAdminsPage