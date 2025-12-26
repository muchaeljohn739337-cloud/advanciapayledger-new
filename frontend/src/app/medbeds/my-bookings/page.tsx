'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { useSocket } from '@/lib/socket';
import NotificationBell from '@/components/NotificationBell';

interface MedbedBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalCost: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  chambers: {
    id: string;
    name: string;
    category: string;
    pricePerHour: string;
  };
}

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<MedbedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    loadBookings();
    socket.connect();

    socket.on('booking_update', (data: any) => {
      console.log('Booking update received:', data);
      loadBookings(); // Refresh bookings when updates come in
    });

    return () => {
      socket.off('booking_update');
    };
  }, []);

  const loadBookings = async () => {
    try {
      if (!authService.isAuthenticated()) {
        router.push('/login');
        return;
      }

      const response = await authService.fetchWithAuth('/api/medbeds/bookings/my-bookings?page=1&limit=20');
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          router.push('/login');
          return;
        }
        throw new Error('Failed to load bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(bookingId);
    try {
      const response = await authService.fetchWithAuth(`/api/medbeds/bookings/${bookingId}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      alert('Booking cancelled successfully');
      loadBookings(); // Refresh the list
    } catch (error: any) {
      console.error('Cancel error:', error);
      alert(`Failed to cancel booking: ${error.message}`);
    } finally {
      setCancelling(null);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return bookings.filter(booking => {
      if (filter === 'upcoming') {
        return booking.date >= today && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
      } else if (filter === 'past') {
        return booking.date < today || booking.status === 'COMPLETED' || booking.status === 'CANCELLED';
      }
      return true; // 'all'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancelBooking = (booking: MedbedBooking) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const hoursDiff = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && hoursDiff > 2;
  };

  const getBookingStats = () => {
    const total = bookings.length;
    const upcoming = bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      return b.date >= today && b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
    }).length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    
    return { total, upcoming, completed, cancelled };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const stats = getBookingStats();
  const filteredBookings = getFilteredBookings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Med Bed Bookings</h1>
                <p className="text-gray-600 text-sm">Manage your healing sessions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Link
                href="/medbeds"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Book New Session
              </Link>
              <Link
                href="/dashboard"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Back to Dashboard
              </Link>
              <button 
                onClick={() => authService.logout()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-blue-200">Total Bookings</div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.upcoming}</div>
            <div className="text-green-200">Upcoming</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.completed}</div>
            <div className="text-purple-200">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.cancelled}</div>
            <div className="text-red-200">Cancelled</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setFilter('all')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'all'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Bookings ({stats.total})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'upcoming'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming ({stats.upcoming})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                  filter === 'past'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Past & Cancelled ({stats.completed + stats.cancelled})
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Booking #{booking.id.slice(-8)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.chambers.name}</h3>
                      <p className="text-gray-600">{booking.chambers.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">${parseFloat(booking.totalCost).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{booking.duration}h session</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">${parseFloat(booking.chambers.pricePerHour).toFixed(2)}/hour</span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700"><strong>Notes:</strong> {booking.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                    <div className="flex space-x-2">
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          disabled={cancelling === booking.id}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                        >
                          {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                      <Link
                        href={`/medbeds/book/${booking.chambers.id}`}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                      >
                        Book Again
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'No bookings yet' : 
                 filter === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' ? 'Start your healing journey by booking your first Med Bed session.' :
                 filter === 'upcoming' ? 'Schedule a new Med Bed session for future healing.' :
                 'Your completed and cancelled bookings will appear here.'}
              </p>
              {(filter === 'all' || filter === 'upcoming') && (
                <Link
                  href="/medbeds"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition inline-block"
                >
                  Book Your First Session
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
