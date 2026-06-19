import React, { useState, useEffect } from 'react';
import { adminCustomersApi } from '@/src/api/adminCustomersApi';
import { Loader2, User, ShoppingBag, Gift, ShieldAlert, StickyNote, Activity } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerTimelineTab = ({ customerId }: { customerId: number }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await adminCustomersApi.getTimeline(customerId);
        setEvents(data);
      } catch (err) {
        toast.error('Không thể tải lịch sử hoạt động');
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [customerId]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'customer_registered': return <User className="w-5 h-5 text-blue-500" />;
      case 'order_created': return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case 'point_transaction': return <Gift className="w-5 h-5 text-amber-500" />;
      case 'session_created': return <Activity className="w-5 h-5 text-indigo-500" />;
      case 'session_revoked': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'note_created': return <StickyNote className="w-5 h-5 text-purple-500" />;
      case 'customer_blocked': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'customer_unblocked': return <ShieldAlert className="w-5 h-5 text-green-600" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'customer_registered': return 'bg-blue-50 border-blue-100';
      case 'order_created': return 'bg-green-50 border-green-100';
      case 'point_transaction': return 'bg-amber-50 border-amber-100';
      case 'session_created': return 'bg-indigo-50 border-indigo-100';
      case 'session_revoked': return 'bg-red-50 border-red-100';
      case 'note_created': return 'bg-purple-50 border-purple-100';
      case 'customer_blocked': return 'bg-red-50 border-red-200';
      case 'customer_unblocked': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
        <Activity className="w-5 h-5 text-gray-500" />
        <span>Lịch sử hoạt động tổng hợp</span>
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">Chưa có hoạt động nào được ghi nhận.</p>
        </div>
      ) : (
        <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
          {events.map((event, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[27px] top-1 bg-white p-1 rounded-full border border-gray-200">
                {getEventIcon(event.type)}
              </div>
              <div className={`ml-4 p-4 rounded-lg border ${getEventBg(event.type)}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(event.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{event.description}</p>
                
                {/* Meta details if needed */}
                {event.type === 'point_transaction' && event.metadata?.points_change && (
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${event.metadata.points_change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {event.metadata.points_change > 0 ? '+' : ''}{event.metadata.points_change} điểm
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
