import React, { useState } from 'react';
import { useNavbar } from '../../hooks/useNavbar';

const ProfilePage: React.FC = () => {
  useNavbar({
    title: 'Profile',
  });

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: 'Dr. Maria Johnson',
    email: 'maria.johnson@clinic.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    address: '123 Medical Plaza, Suite 400, New York, NY 10001',
    emergencyContact: '+1 (555) 987-6543',
    nationality: 'American',
    bloodGroup: 'O+',
    
    // Doctor-Specific Fields
    specialization: 'General Practitioner',
    licenseNumber: 'MD-123456',
    yearsOfExperience: '10',
    languages: 'English, Spanish, French',
    bio: 'Experienced medical professional with over 10 years in family medicine. Passionate about patient care and preventive health. Board certified in Internal Medicine with expertise in chronic disease management.',
    clinicAffiliation: 'City General Hospital',
    consultationFee: '$150',
    availability: 'Mon-Fri, 9AM-5PM',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic
    alert('Profile updated successfully!');
  };

  const handleReset = () => {
    setFormData({
      fullName: 'Dr. Maria Johnson',
      email: 'maria.johnson@clinic.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      gender: 'Female',
      address: '123 Medical Plaza, Suite 400, New York, NY 10001',
      emergencyContact: '+1 (555) 987-6543',
      nationality: 'American',
      bloodGroup: 'O+',
      specialization: 'General Practitioner',
      licenseNumber: 'MD-123456',
      yearsOfExperience: '10',
      languages: 'English, Spanish, French',
      bio: 'Experienced medical professional with over 10 years in family medicine. Passionate about patient care and preventive health. Board certified in Internal Medicine with expertise in chronic disease management.',
      clinicAffiliation: 'City General Hospital',
      consultationFee: '$150',
      availability: 'Mon-Fri, 9AM-5PM',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top Section: Profile Card + Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center font-bold text-3xl md:text-4xl mb-4">
              DM
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 text-center">Dr. Maria Johnson</h3>
            <p className="text-sm text-gray-500 mb-1">General Practitioner</p>
            <p className="text-xs text-gray-400 mb-4">ID: DOC-2024-001</p>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm w-full">
              Edit Picture
            </button>

            {/* Quick Stats */}
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">842</div>
                  <div className="text-xs text-gray-500">Patients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1,248</div>
                  <div className="text-xs text-gray-500">Appointments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">10+</div>
                  <div className="text-xs text-gray-500">Years Exp.</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">4.9</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 border-b pb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
              <input
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information Section - Full Width */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 border-b pb-3">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Languages
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Clinic Affiliation
              </label>
              <input
                type="text"
                name="clinicAffiliation"
                value={formData.clinicAffiliation}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Consultation Fee
              </label>
              <input
                type="text"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Availability
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="border border-gray-300 p-2.5 md:p-3 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm md:text-base"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="bg-primary text-white px-4 md:px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-md text-sm md:text-base"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="border border-gray-300 px-4 md:px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
