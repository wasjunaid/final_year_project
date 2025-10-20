import { useEffect, useState } from "react";
import { 
  FaCalendarAlt, 
  FaFileAlt, 
  FaUserMd, 
  FaUsers, 
  FaFlask,
  FaFileMedical,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaRegCircle
} from "react-icons/fa";
import LabeledInputField from "../../components/LabeledInputField";
import Button from "../../components/Button";
import api from "../../services/api";
import EndPoints from "../../constants/endpoints";

interface Hospital {
  hospital_id: number;
  name: string;
  address: string;
  address_id?: number;
  created_at: string;
  updated_at: string;
}

interface HospitalStats {
  appointments: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  documents: {
    total: number;
    verified: number;
    unverified: number;
  };
  staff: {
    total: number;
    doctors: number;
    admins: number;
    frontDesk: number;
  };
  labTests: {
    total: number;
    pending: number;
    completed: number;
  };
  panelMembers: number;
}

function HospitalProfile() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchHospitalData = async () => {
      setLoading(true);
      setError("");
      try {
        // Get staff + hospital details in one call
        const staffRes = await api.get(EndPoints.hospitalStaff.get);
        const hospitalData = staffRes.data.data;

        // Directly set
        setHospital({
          hospital_id: hospitalData.hospital_id,
          name: hospitalData.hospital_name,
          address: hospitalData.hospital_address,
          address_id: hospitalData.address_id,
          created_at: hospitalData.created_at,
          updated_at: hospitalData.updated_at,
        });

        setName(hospitalData.hospital_name);
        setAddress(hospitalData.hospital_address);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load hospital details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!hospital?.hospital_id) return;
      
      setStatsLoading(true);
      try {
        // Fetch all statistics in parallel
        const [
          appointmentsRes,
          documentsRes,
          staffRes,
          labTestsRes,
          panelRes
        ] = await Promise.allSettled([
          api.get(EndPoints.appointments.get),
          api.get(EndPoints.documents.get),
          api.get(`${EndPoints.hospitalStaff.getAll}/${hospital.hospital_id}`),
          api.get(EndPoints.labTest.getAll),
          api.get(EndPoints.hospitalPannel.getAll)
        ]);

        // Process appointments data
        let appointmentStats = { total: 0, pending: 0, completed: 0, cancelled: 0 };
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data?.data) {
          const appointments = appointmentsRes.value.data.data;
          appointmentStats = {
            total: appointments.length,
            pending: appointments.filter((apt: any) => apt.status === 'pending').length,
            completed: appointments.filter((apt: any) => apt.status === 'completed').length,
            cancelled: appointments.filter((apt: any) => apt.status === 'cancelled').length,
          };
        }

        // Process documents data
        let documentStats = { total: 0, verified: 0, unverified: 0 };
        if (documentsRes.status === 'fulfilled' && documentsRes.value.data?.data) {
          const { verified_documents = [], unverified_documents = [] } = documentsRes.value.data.data;
          documentStats = {
            total: verified_documents.length + unverified_documents.length,
            verified: verified_documents.length,
            unverified: unverified_documents.length,
          };
        }

        // Process staff data
        let staffStats = { total: 0, doctors: 0, admins: 0, frontDesk: 0 };
        if (staffRes.status === 'fulfilled' && staffRes.value.data?.data) {
          const staff = staffRes.value.data.data;
          staffStats = {
            total: staff.length,
            doctors: staff.filter((s: any) => s.role === 'doctor').length,
            admins: staff.filter((s: any) => s.role === 'hospital admin' || s.role === 'hospital sub admin').length,
            frontDesk: staff.filter((s: any) => s.role === 'hospital front desk').length,
          };
        }

        // Process lab tests data
        let labTestStats = { total: 0, pending: 0, completed: 0 };
        if (labTestsRes.status === 'fulfilled' && labTestsRes.value.data?.data) {
          const labTests = labTestsRes.value.data.data;
          labTestStats = {
            total: labTests.length,
            pending: labTests.filter((test: any) => test.status === 'pending').length,
            completed: labTests.filter((test: any) => test.status === 'completed').length,
          };
        }

        // Process panel data
        let panelCount = 0;
        if (panelRes.status === 'fulfilled' && panelRes.value.data?.data) {
          panelCount = panelRes.value.data.data.length;
        }

        setStats({
          appointments: appointmentStats,
          documents: documentStats,
          staff: staffStats,
          labTests: labTestStats,
          panelMembers: panelCount,
        });
      } catch (err: any) {
        console.error('Error fetching stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [hospital?.hospital_id]);

  const handleEdit = () => {
    setEditMode(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditMode(false);
    if (hospital) {
      setName(hospital.name);
      setAddress(hospital.address);
    }
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!hospital || !name.trim() || !address.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setError("");
      const res = await api.put(
        `${EndPoints.hospital.update}${hospital.hospital_id}`,
        {
          name: name.trim(),
          address: address.trim(),
        }
      );

      if (res.data.success) {
        setHospital({ ...hospital, name: name.trim(), address: address.trim() });
        setEditMode(false);
        setSuccess("Hospital details updated successfully!");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update hospital details"
      );
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string; 
    subtitle?: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading hospital details...</div>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-6 text-red-500">
        {error || "No hospital data found"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Profile</h1>
          <p className="text-gray-600">Manage hospital information and view statistics</p>
        </div>
        {!editMode ? (
          <Button label="Edit Profile" onClick={handleEdit} />
        ) : (
          <div className="flex gap-2">
            <Button label="Save" onClick={handleSave} />
            <Button label="Cancel" variant="secondary" onClick={handleCancel} />
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 rounded-lg p-4">
          {success}
        </div>
      )}

      {/* Hospital Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hospital Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LabeledInputField
            title="Hospital Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editMode}
            required
          />
          <LabeledInputField
            title="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={!editMode}
            required
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Created:</span> {new Date(hospital.created_at).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {new Date(hospital.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FaChartLine className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Hospital Statistics</h2>
          {statsLoading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {stats && !statsLoading && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Appointments"
                value={stats.appointments.total}
                icon={<FaCalendarAlt className="text-white" />}
                color="bg-blue-500"
                subtitle="All time appointments"
              />
              <StatCard
                title="Total Documents"
                value={stats.documents.total}
                icon={<FaFileAlt className="text-white" />}
                color="bg-green-500"
                subtitle="Verified & unverified"
              />
              <StatCard
                title="Staff Members"
                value={stats.staff.total}
                icon={<FaUsers className="text-white" />}
                color="bg-purple-500"
                subtitle="All hospital staff"
              />
              <StatCard
                title="Panel Members"
                value={stats.panelMembers}
                icon={<FaFileMedical className="text-white" />}
                color="bg-orange-500"
                subtitle="Active panel members"
              />
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Appointments Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  Appointments Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-yellow-500 text-sm" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{stats.appointments.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="font-semibold text-green-600">{stats.appointments.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaRegCircle className="text-red-500 text-sm" />
                      <span className="text-sm text-gray-600">Cancelled</span>
                    </div>
                    <span className="font-semibold text-red-600">{stats.appointments.cancelled}</span>
                  </div>
                </div>
              </div>

              {/* Documents Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFileAlt className="text-green-500" />
                  Documents Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500 text-sm" />
                      <span className="text-sm text-gray-600">Verified</span>
                    </div>
                    <span className="font-semibold text-green-600">{stats.documents.verified}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-yellow-500 text-sm" />
                      <span className="text-sm text-gray-600">Unverified</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{stats.documents.unverified}</span>
                  </div>
                </div>
              </div>

              {/* Staff Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  Staff Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaUserMd className="text-blue-500 text-sm" />
                      <span className="text-sm text-gray-600">Doctors</span>
                    </div>
                    <span className="font-semibold text-blue-600">{stats.staff.doctors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-purple-500 text-sm" />
                      <span className="text-sm text-gray-600">Admins</span>
                    </div>
                    <span className="font-semibold text-purple-600">{stats.staff.admins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-gray-500 text-sm" />
                      <span className="text-sm text-gray-600">Front Desk</span>
                    </div>
                    <span className="font-semibold text-gray-600">{stats.staff.frontDesk}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Tests Statistics */}
            {stats.labTests.total > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFlask className="text-indigo-500" />
                  Lab Tests Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.labTests.total}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.labTests.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.labTests.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {statsLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-center items-center">
              <div className="text-gray-500">Loading statistics...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalProfile;
