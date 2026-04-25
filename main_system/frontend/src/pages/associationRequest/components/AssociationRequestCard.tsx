import React from 'react';
import Button from '../../../components/Button';

type AssociationRequestShape = {
  hospital_association_request_id: number;
  hospitalName?: string;
  created_at?: string;
};

interface Props {
  request: AssociationRequestShape;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}

const getRequestColors = () => {
  // tweak colors as desired
  return {
    bg: 'bg-white dark:bg-[#1f1f1f]',
    border: 'border border-gray-200 dark:border-[#404040]',
    title: 'text-gray-900 dark:text-[#e5e5e5]',
    subtitle: 'text-gray-700 dark:text-[#a0a0a0]',
    meta: 'text-xs text-gray-500 dark:text-[#808080]',
  };
};

const AssociationRequestCard: React.FC<Props> = ({ request, onAccept, onDecline }) => {
  const colors = getRequestColors();

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.(request.hospital_association_request_id);
  };
  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.(request.hospital_association_request_id);
  };

  const ts = request.created_at ? new Date(request.created_at) : null;
  const dateStr = ts ? ts.toLocaleDateString() : '';
  const timeStr = ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div
      className={`
        relative p-4 rounded-lg transition-all duration-200
        ${colors.bg}
        ${colors.border}
        hover:shadow-lg dark:shadow-none dark:hover:shadow-md
        cursor-default group
      `}
      role="button"
      tabIndex={0}
    >
      <div className="flex gap-4 items-start">
        {/* main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className={`text-sm font-semibold ${colors.title} mb-2 truncate`}>
                {request.hospitalName?.toUpperCase() ?? 'Association Request'}
              </h3>

              <div className="flex items-center gap-3">
                <div className={`text-right ${colors.meta}`}>
                  <div>{dateStr}</div>
                  <div className="text-xs text-gray-400">{timeStr}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="shrink-0 flex items-start gap-2">
          <Button variant="primary" size='sm' onClick={handleAccept}> Accept </Button>
          <Button variant="danger" size='sm' onClick={handleDecline}> Decline </Button>
        </div>
      </div>
    </div>
  );
};

export default AssociationRequestCard;
