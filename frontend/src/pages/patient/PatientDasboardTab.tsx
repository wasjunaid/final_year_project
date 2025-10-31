import { useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePerson } from "../../hooks/usePerson";
import { usePatient } from "../../hooks/usePatient";
import { useAppointment } from "../../hooks/useAppointment";
import DashboardCard from "../../components/DashboardCard";
import Card from "../../components/Card";

// Patient Dashboard Component - Updated and optimized
function PatientDashboardTab() {
  const { personId } = useAuth();
  const { person, getPerson } = usePerson();
  const { patient, getPatient } = usePatient();
  const { 
    appointments, 
    loading: appointmentsLoading, 
    getAllPatient 
  } = useAppointment();

  useEffect(() => {
    if (personId) {
      getPerson();
      getPatient();
  getAllPatient();
    }
  }, [personId, getPerson, getPatient, getAllPatient]);

  // Memoize dashboard statistics
  const dashboardStats = useMemo(() => {
    const upcomingAppointments = appointments?.filter(apt => 
      apt.status === 'APPROVED' && new Date(apt.date) > new Date()
    ) || [];
    
    const pendingAppointments = appointments?.filter(apt => 
      apt.status === 'PROCESSING'
    ) || [];

    return {
      upcomingCount: upcomingAppointments.length,
      pendingCount: pendingAppointments.length,
      profileComplete: person?.is_person_profile_complete && patient?.is_patient_profile_complete,
    };
  }, [appointments, person, patient]);

  const loading = appointmentsLoading;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {person?.first_name || 'Patient'}!
        </h1>
        <p className="text-gray-600">Here's your health dashboard overview</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard
          label="Upcoming Appointments"
          value={dashboardStats.upcomingCount.toString()}
          icon={null}
        />
        <DashboardCard
          label="Pending Requests"
          value={dashboardStats.pendingCount.toString()}
          icon={null}
        />
        <DashboardCard
          label="Profile Status"
          value={dashboardStats.profileComplete ? "Complete" : "Incomplete"}
          icon={null}
        />
        <DashboardCard
          label="Health Records"
          value="Available"
          icon={null}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              📅 Book New Appointment
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              👤 Update Profile
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              📄 View Documents
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Health Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Blood Group:</span>
              <span className="font-medium">{patient?.blood_group || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Emergency Contact:</span>
              <span className="font-medium">
                {patient?.emergency_contact_number || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profile Status:</span>
              <span className={`font-medium ${dashboardStats.profileComplete ? 'text-green-600' : 'text-orange-600'}`}>
                {dashboardStats.profileComplete ? 'Complete' : 'Needs Update'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PatientDashboardTab;
