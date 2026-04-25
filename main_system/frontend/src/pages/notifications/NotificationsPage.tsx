import React, { useState, useMemo } from 'react';
import { useNavbarController } from '../../hooks/ui/navbar';
import { useNotificationController } from '../../hooks/notification';
import NotificationCard from './components/NotificationCard';
import CardList from '../../components/CardList';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import { Bell, BellOff, Trash2, CheckCheck } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const navbarConfig = useMemo(() => ({
    title: 'Notifications',
    showSearch: true,
    searchPlaceholder: 'Search notifications...',
  }), []);
  
  const { searchQuery } = useNavbarController(navbarConfig);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    success,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificationController();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread' && notif.isRead) return false;
    if (filter === 'read' && !notif.isRead) return false;
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = notif.title.toLowerCase().includes(query);
      const matchesMessage = notif.message.toLowerCase().includes(query);
      if (!matchesTitle && !matchesMessage) return false;
    }
    
    return true;
  });

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAllRead = async () => {
    // if (window.confirm('Are you sure you want to delete all read notifications?')) {
    //   await deleteAllRead();
    // }
    await deleteAllRead();
  };

  return (
    <>
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl shadow-md border border-gray-200 dark:border-[#404040] p-4 md:p-6 flex-1 flex flex-col">
        {/* Header with filters and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-2 border-gray-200 dark:border-[#404040] mb-2">
          {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'primary' : 'ghost'}
              size="sm"
            >
              Unread
            </Button>
            <Button
              onClick={() => setFilter('read')}
              variant={filter === 'read' ? 'primary' : 'ghost'}
              size="sm"
            >
              Read
            </Button>

            {/* Type Filter */}
            <Dropdown
              options={[
              { value: 'all', label: 'All Types' },
              { value: 'appointment', label: 'Appointments' },
              { value: 'auth', label: 'Login & Security' },
              { value: 'lab_result', label: 'Lab Results' },
              { value: 'prescription', label: 'Prescriptions' },
              { value: 'system', label: 'System Alerts' },
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Filter by type"
              containerClassName="min-w-[150px]"
              size="sm"
            />
            </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap items-center">
            {unreadCount > 0 && (
              <Button
          onClick={handleMarkAllAsRead}
          disabled={loading}
          variant="secondary"
          size="sm"
          icon={CheckCheck}
          // className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary/30"
              >
          Mark All Read
              </Button>
            )}
            {notifications.some(n => n.isRead) && (
              <Button
          onClick={handleDeleteAllRead}
          disabled={loading}
          variant="danger"
          size="sm"
          icon={Trash2}
          // className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30"
              >
          Delete Read
              </Button>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400">{error.message}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-400">{success.message}</p>
          </div>
        )}

        {/* Card List with Pagination */}
        <div className="flex-1 -mx-4 -mb-6 md:-mx-6">
          <CardList
            data={filteredNotifications}
            renderCard={(notification) => (
              <NotificationCard
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            )}
            loading={loading && notifications.length === 0}
            itemsPerPage={6}
            emptyIcon={
              filter === 'unread' ? (
                <BellOff size={64} className="text-gray-400 dark:text-gray-600" />
              ) : (
                <Bell size={64} className="text-gray-400 dark:text-gray-600" />
              )
            }
            emptyMessage={
              filter === 'unread'
                ? "You're all caught up!"
                : filter === 'read'
                ? 'No read notifications'
                : 'When you receive notifications, they will appear here'
            }
          />
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
