import { useState, useEffect } from 'react'
import LabeledInputField from '../../components/LabeledInputField'
import Button from '../../components/Button'
import { useSystemAdmin } from '../../hooks/useSystemAdmin'

function CreateAdminsPage() {
  const [email, setEmail] = useState('')
  
  const { 
    loading, 
    success, 
    error, 
    createSystemAdmin, 
    clearMessages 
  } = useSystemAdmin();

  const handleCreate = async () => {
    clearMessages();
    if (!email) {
      return
    }

    try {
      await createSystemAdmin({ email });
      // Reset form on success
      setEmail('')
    } catch (err) {
      // Error handled by hook
    }
  }

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearMessages]);

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