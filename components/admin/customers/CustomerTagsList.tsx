import React, { useEffect, useState } from 'react';
import { adminCustomersApi } from '@/src/api/adminCustomersApi';

export const CustomerTagsList = ({ customerId }: { customerId: number }) => {
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await adminCustomersApi.getTags(customerId);
        setTags(res.data || []);
      } catch (err) {
        // Ignore errors for this small component
      }
    };
    fetchTags();
  }, [customerId]);

  if (tags.length === 0) return null;

  return (
    <>
      {tags.map(tag => (
        <span 
          key={tag.id}
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border border-opacity-20"
          style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: tag.color }}
        >
          {tag.name}
        </span>
      ))}
    </>
  );
};
