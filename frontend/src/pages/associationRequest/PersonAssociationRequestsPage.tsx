import React from 'react';
import CardList from '../../components/CardList';
import AssociationRequestCard from './components/AssociationRequestCard';
import { usePersonAssociationController } from '../../hooks/associationRequest';
import Alert from '../../components/Alert';
import { useAuthController } from '../../hooks/auth';
import { ROLES } from '../../constants/profile';
import type { NavbarConfig } from '../../models/navbar/model';
import { useNavbarController } from '../../hooks/ui/navbar';
import { GitPullRequestIcon } from 'lucide-react';

const PersonAssociationRequestsPage: React.FC = () => {
  const { role } = useAuthController();
  if (role !== ROLES.DOCTOR && role !== ROLES.MEDICAL_CODER) {
    return <div className="p-6 text-center text-red-600 font-semibold">You do not have permission to view this page.</div>;
  }

  const navbarConfig : NavbarConfig = React.useMemo(() => ({
    title: 'Association Requests',
  }), []);
  useNavbarController(navbarConfig);

  const {
    requests,
    loading,
    error,
    success,
    fetchRequestsForPerson,
    deletePersonRequest,
    acceptRequest,
    clearMessages,
  } = usePersonAssociationController();

  const handleDelete = async (id: number) => {
    try {
      await deletePersonRequest(id);
      await fetchRequestsForPerson();
    } catch (_) {
      // handled in hook
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await acceptRequest(id);
      await fetchRequestsForPerson();
    } catch (_) {
      // handled in hook
    }
  };

  const EmptyAssociationRequests: React.FC = () => (
    <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
      <GitPullRequestIcon size={50} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      <h2 className="text-xl font-semibold mb-2">No Pending Association Requests</h2>
      <p className="text-sm">Hospital association requests will appear here.</p>
    </div>
  );

  return (
  <>
    {/* Error/Success Messages */}
    {error && <Alert type="error" title="Error" message={error} onClose={clearMessages} className="mb-3" />}
    {success && <Alert type="success" title="Success" message={success} onClose={clearMessages} className="mb-3" />}

    {/* Card List with Pagination */}
    <CardList
      data={requests}
      renderCard={(request) => (
        <AssociationRequestCard
          request={request}
          onAccept={async (id) => handleAccept(id)}
          onDecline={async (id) => handleDelete(id)}
        />
      )}
      loading={loading && requests.length === 0}
      itemsPerPage={6}
      emptyComponent={<EmptyAssociationRequests />}
    />
  </>
  );
};

export default PersonAssociationRequestsPage;
