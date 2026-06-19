import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Loader2 } from 'lucide-react';
import { adminCustomersApi } from '@/src/api/adminCustomersApi';
import { toast } from 'sonner';

interface CustomerTagsModalProps {
  customerId: number;
  isOpen: boolean;
  onClose: () => void;
  onTagsUpdated: () => void;
}

export const CustomerTagsModal: React.FC<CustomerTagsModalProps> = ({ customerId, isOpen, onClose, onTagsUpdated }) => {
  const [customerTags, setCustomerTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTag, setAddingTag] = useState<number | 'new' | null>(null);
  
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen, customerId]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await adminCustomersApi.getTags(customerId);
      setCustomerTags(res.data || []);
      setAllTags(res.allTags || []);
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách nhãn: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTag = async (tagId: number) => {
    try {
      setAddingTag(tagId);
      await adminCustomersApi.assignTag(customerId, { tag_id: tagId });
      toast.success('Đã gán nhãn');
      await fetchTags();
      onTagsUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gán nhãn');
    } finally {
      setAddingTag(null);
    }
  };

  const handleCreateAndAssignTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setAddingTag('new');
      await adminCustomersApi.assignTag(customerId, { new_tag_name: newTagName, new_tag_color: newTagColor });
      toast.success('Đã tạo và gán nhãn mới');
      setNewTagName('');
      await fetchTags();
      onTagsUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo nhãn');
    } finally {
      setAddingTag(null);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      await adminCustomersApi.removeTag(customerId, tagId);
      toast.success('Đã gỡ nhãn');
      await fetchTags();
      onTagsUpdated();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi gỡ nhãn');
    }
  };

  if (!isOpen) return null;

  const availableTags = allTags.filter(t => !customerTags.find(ct => ct.id === t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-gray-900">
            <Tag className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Quản lý nhãn khách hàng</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <>
              {/* Current Tags */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Nhãn đang có ({customerTags.length})</h4>
                {customerTags.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Khách hàng chưa có nhãn nào.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {customerTags.map((tag) => (
                      <span 
                        key={tag.id} 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-opacity-20"
                        style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: tag.color }}
                      >
                        {tag.name}
                        <button 
                          onClick={() => handleRemoveTag(tag.id)}
                          className="ml-1.5 p-0.5 rounded-full hover:bg-black/10 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Tags */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Thêm nhãn có sẵn</h4>
                {availableTags.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Không còn nhãn nào khả dụng.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleAssignTag(tag.id)}
                        disabled={addingTag !== null}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
                      >
                        {addingTag === tag.id && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                        <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: tag.color }}></span>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create new tag */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tạo nhãn mới</h4>
                <form onSubmit={handleCreateAndAssignTag} className="flex gap-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="h-10 w-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                    title="Chọn màu"
                  />
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tên nhãn mới..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0070f3] outline-none"
                    maxLength={30}
                  />
                  <button
                    type="submit"
                    disabled={addingTag !== null || !newTagName.trim()}
                    className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center"
                  >
                    {addingTag === 'new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
