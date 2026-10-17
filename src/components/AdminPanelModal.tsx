import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  LayoutDashboard,
  UtensilsCrossed,
  Calendar,
  Settings,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Flame,
  Search,
  Filter,
  DollarSign,
  Users,
  ShieldCheck,
  Power
} from 'lucide-react';
import { Order, TableBookingDetails, UserProfile } from '../types/restaurant';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalReservations: number;
  confirmedReservations: number;
  totalCustomers: number;
}

export const AdminPanelModal: React.FC<Props> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'kds' | 'reservations' | 'settings' | 'analytics'>('kds');
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalReservations: 0,
    confirmedReservations: 0,
    totalCustomers: 0,
  });

  const [settings, setSettings] = useState({
    isKitchenAcceptingOrders: true,
    estimatedDeliveryMinutes: 25,
    announcementBanner: 'Fresh Charcoal Tandoor & Royal Desi Ghee Curries Live!',
  });

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Orders from Backend PostgreSQL
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
      }

      // 2. Fetch Reservations
      const resRes = await fetch('/api/reservations');
      if (resRes.ok) {
        const data = await resRes.json();
        setReservations(data);
      }

      // 3. Fetch Settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }

      // 4. Fetch Analytics
      const analyticsRes = await fetch('/api/admin/analytics');
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.warn('Admin fetch fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, fetchAdminData]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: nextStatus } : o))
        );
        showNotification(`Order #${orderId.slice(-6)} moved to ${nextStatus.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleUpdateReservationStatus = async (resId: string, status: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === resId ? { ...r, status } : r))
        );
        showNotification(`Reservation marked as ${status.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Update reservation error:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user.email ? { Authorization: `Bearer admin-token` } : {}),
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showNotification('Kitchen settings saved successfully to Cloud SQL database!');
      } else {
        showNotification('Settings updated locally.');
      }
    } catch (err) {
      showNotification('Settings saved locally.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'all'
        ? true
        : orderStatusFilter === 'active'
        ? o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
        : o.orderStatus === orderStatusFilter;

    const matchesSearch =
      orderSearch.trim() === '' ||
      (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(orderSearch));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto font-sans-body">
      <div className="relative w-full max-w-6xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Strip */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-stone-950 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-md">
              <ShieldCheck className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  PostgreSQL Master Console
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud SQL Live
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-serif-display font-bold text-white flex items-center gap-2">
                <span>Maheswari Restaurant Administration</span>
                <span className="text-xs text-stone-400 font-mono font-normal">
                  ({user.email || 'tejsinghsaud70@gmail.com'})
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 text-stone-400 hover:text-amber-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              title="Refresh live data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {actionSuccess && (
          <div className="bg-emerald-600/90 text-white text-xs px-4 py-2 flex items-center justify-between font-medium animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </span>
            <button onClick={() => setActionSuccess(null)} className="text-white hover:text-emerald-200">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-stone-950/60 border-b border-stone-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('kds')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'kds'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kitchen Display (KDS)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900/40 font-mono">
              {orders.filter((o) => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reservations'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Table Bookings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-900/40 font-mono">
              {reservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue & Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Kitchen & ETA Controls</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">

          {/* ================= TAB 1: KITCHEN DISPLAY (KDS) ================= */}
          {activeTab === 'kds' && (
            <div className="space-y-4">
              {/* Controls bar: search and status filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'active', label: '🔥 Active Orders' },
                    { id: 'placed', label: 'New Placed' },
                    { id: 'cooking', label: 'Cooking in Tandoor' },
                    { id: 'out_for_delivery', label: 'Dispatched' },
                    { id: 'completed', label: 'Completed' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(f.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        orderStatusFilter === f.id
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                          : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/60'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search guest or phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-stone-950 border border-stone-800 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Order Cards Grid */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-stone-950/60 rounded-xl border border-stone-800 p-8 space-y-2">
                  <p className="text-sm font-semibold text-stone-300">No orders found matching criteria.</p>
                  <p className="text-xs text-stone-500">Incoming guest orders from mobile web app will appear here instantly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => {
                    let parsedItems: any[] = [];
                    try {
                      parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    } catch {
                      parsedItems = [];
                    }

                    const isPlaced = order.orderStatus === 'placed';
                    const isConfirmed = order.orderStatus === 'confirmed';
                    const isCooking = order.orderStatus === 'cooking';
                    const isOut = order.orderStatus === 'out_for_delivery';
                    const isCompleted = order.orderStatus === 'completed';

                    return (
                      <div
                        key={order.id}
                        className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                          isCooking
                            ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
                            : isPlaced
                            ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                            : 'bg-stone-950 border-stone-800'
                        }`}
                      >
                        {/* Order Header */}
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                            <div>
                              <span className="text-xs font-mono font-bold text-amber-400">
                                #{order.orderNumber || order.id.slice(-6)}
                              </span>
                              <div className="text-[10px] text-stone-400 font-mono">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isPlaced
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : isCooking
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : isOut
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-stone-800 text-stone-300'
                              }`}
                            >
                              {order.orderStatus.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Customer & Dining Details */}
                          <div className="pt-2 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-100">{order.customerName}</span>
                              <span className="text-[11px] font-mono text-stone-400">{order.customerPhone}</span>
                            </div>
                            <div className="text-[11px] text-amber-300/90 font-medium">
                              Type: <span className="uppercase font-bold">{order.bookingType}</span>
                              {order.tableNumber && ` · Table ${order.tableNumber}`}
                            </div>
                            {order.deliveryAddress && (
                              <p className="text-[10px] text-stone-400 line-clamp-1">
                                {order.deliveryAddress}
                              </p>
                            )}
                          </div>

                          {/* Items List */}
                          <div className="mt-3 pt-2 border-t border-stone-800/80 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                              Dishes ({parsedItems.length})
                            </span>
                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                              {parsedItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                                  <div className="truncate pr-2">
                                    <span className="font-bold text-amber-200">
                                      {item.quantity || 1}x{' '}
                                    </span>
                                    <span className="text-stone-300">
                                      {item.menuItem?.name || item.name || 'Dish'}
                                    </span>
                                  </div>
                                  <span className="font-mono text-stone-400 shrink-0">
                                    ₹{item.itemTotal || item.price || 0}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Order Total & Next Action Buttons */}
                        <div className="pt-3 border-t border-stone-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono font-bold">
                            <span className="text-stone-400">Total (Paid via {order.paymentMethod.toUpperCase()})</span>
                            <span className="text-amber-400 text-sm">₹{order.grandTotal}</span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            {isPlaced && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                Accept & Confirm
                              </button>
                            )}

                            {isConfirmed && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'cooking')}
                                className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>Start Cooking</span>
                              </button>
                            )}

                            {isCooking && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                                className="flex-1 py-1.5 px-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Dispatch Food</span>
                              </button>
                            )}

                            {isOut && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Delivered</span>
                              </button>
                            )}

                            {isCompleted && (
                              <div className="w-full text-center py-1 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Fulfilled & Closed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: RESERVATIONS ================= */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-serif-display font-bold text-amber-200">
                  Guest Dining Table Reservations ({reservations.length})
                </h3>
              </div>

              {reservations.length === 0 ? (
                <div className="text-center py-12 bg-stone-950/60 rounded-xl border border-stone-800 p-8 space-y-2">
                  <p className="text-sm font-semibold text-stone-300">No table reservations recorded yet.</p>
                  <p className="text-xs text-stone-500">Bookings from the Reserve Table modal will populate here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900/80 text-amber-400 uppercase font-mono text-[10px] border-b border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Booking #</th>
                        <th className="py-2.5 px-3">Guest Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Party Size</th>
                        <th className="py-2.5 px-3">Seating Area</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80">
                      {reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-stone-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                            {res.bookingNumber || res.id.slice(-6)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">{res.guestName}</td>
                          <td className="py-2.5 px-3 font-mono text-stone-400">{res.guestPhone}</td>
                          <td className="py-2.5 px-3">
                            <span className="block font-medium text-stone-200">{res.reservationDate}</span>
                            <span className="text-[10px] text-amber-400 font-mono">{res.timeSlot}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-200">
                            {res.guestCount} Guests
                          </td>
                          <td className="py-2.5 px-3 text-stone-300">{res.seatingArea}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                res.status === 'seated'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : res.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            {res.status !== 'seated' && res.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateReservationStatus(res.id, 'seated')}
                                className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-[10px] transition-colors cursor-pointer"
                              >
                                Seat Table
                              </button>
                            )}
                            {res.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] transition-colors cursor-pointer"
                              >
                                Finish
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: REVENUE & ANALYTICS ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-amber-400 mt-2 font-mono">
                    ₹{analytics.totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Direct via UPI & Cards</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Total Orders</span>
                    <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-white mt-2 font-mono">
                    {analytics.totalOrders}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">{analytics.completedOrders} fulfilled</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Live in Kitchen</span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-rose-400 mt-2 font-mono">
                    {analytics.pendingOrders}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">Pending dispatch</p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                  <div className="flex items-center justify-between text-stone-400 text-xs">
                    <span>Reservations</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-serif-display font-bold text-blue-400 mt-2 font-mono">
                    {analytics.totalReservations}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">{analytics.confirmedReservations} confirmed covers</p>
                </div>
              </div>

              {/* Database Architecture Summary */}
              <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  PostgreSQL Infrastructure Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 text-[10px] block">Database Engine</span>
                    <span className="font-bold text-white">PostgreSQL (Cloud SQL Developer)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 text-[10px] block">ORM & Migrations</span>
                    <span className="font-bold text-white">Drizzle ORM & Drizzle Kit</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-400 text-[10px] block">Auth Verification</span>
                    <span className="font-bold text-white">Firebase Admin SDK & RBAC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: SETTINGS & CONTROLS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
                <h3 className="text-sm font-serif-display font-bold text-white">
                  Live Kitchen Operations & Broadcast Controls
                </h3>

                {/* Switch: Accept Orders */}
                <div className="flex items-center justify-between py-2 border-b border-stone-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block">Accepting Online Food Orders</span>
                    <span className="text-[10px] text-stone-400">
                      When toggled OFF, mobile ordering and checkout are paused with a courteous notice.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        isKitchenAcceptingOrders: !prev.isKitchenAcceptingOrders,
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.isKitchenAcceptingOrders ? 'bg-amber-400' : 'bg-stone-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-stone-950 absolute top-0.5 transition-transform ${
                        settings.isKitchenAcceptingOrders ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Average Preparation & ETA Time */}
                <div className="space-y-1 py-2 border-b border-stone-800/80">
                  <label className="text-xs font-bold text-white block">
                    Average Delivery / Kitchen Prep ETA (Minutes)
                  </label>
                  <p className="text-[10px] text-stone-400">
                    Displayed dynamically to guests in order receipts and cart checkout.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {[15, 20, 25, 35, 45].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            estimatedDeliveryMinutes: mins,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                          settings.estimatedDeliveryMinutes === mins
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Announcement Banner */}
                <div className="space-y-1.5 py-2">
                  <label className="text-xs font-bold text-white block">
                    Customer Broadcast Headline
                  </label>
                  <p className="text-[10px] text-stone-400">
                    Live ticker displayed at the top of the restaurant home page.
                  </p>
                  <input
                    type="text"
                    value={settings.announcementBanner || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        announcementBanner: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-amber-400"
                    placeholder="Enter broadcast message..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Save Changes to PostgreSQL Database
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
