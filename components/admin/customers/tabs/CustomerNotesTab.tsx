import React, { useState, useEffect } from 'react';
import { adminCustomersApi } from '@/src/api/adminCustomersApi';
import { Loader2, Trash2, Send, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerNotesTab = ({ customerId, hasEditAccess = false }: { customerId: number; hasEditAccess?: boolean }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      const data = await adminCustomersApi.getNotes(customerId);
      setNotes(data);
    } catch (err) {
      toast.error('Không thể tải ghi chú');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEditAccess) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
      return;
    }
    if (!newNote.trim()) return;
    
    setSubmitting(true);
    try {
      await adminCustomersApi.createNote(customerId, newNote);
      toast.success('Đã thêm ghi chú');
      setNewNote('');
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thêm ghi chú');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!hasEditAccess) {
      toast.error("Bạn không có quyền thực hiện thao tác này.");
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    
    try {
      await adminCustomersApi.deleteNote(customerId, noteId);
      toast.success('Đã xóa ghi chú');
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa ghi chú');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {hasEditAccess && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm ghi chú CSKH</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Nhập nội dung ghi chú nội bộ (chỉ admin mới thấy)..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0070f3] focus:border-transparent outline-none transition-shadow resize-none"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newNote.trim()}
                className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">Chưa có ghi chú nào.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{note.admin_name || `Admin #${note.admin_id}`}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                {hasEditAccess && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Xóa ghi chú"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{note.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
