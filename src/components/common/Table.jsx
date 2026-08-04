import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Input from './Input';
import { TableSkeleton } from './Skeleton';

const Table = ({
  columns,
  data = [],
  isLoading = false,
  searchPlaceholder = 'Search vehicles...',
  emptyMessage = 'No vehicles found in fleet registry.',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Search filtering logic
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.accessor ? row[col.accessor] : col.render ? col.render(row) : null;
        return String(value || '').toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, columns]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="w-full space-y-4">
      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            icon={Search}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {paginatedData.length} of {filteredData.length} entries
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={columns.length} />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-800/50 p-4 rounded-2xl mb-3 text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <p className="text-slate-300 font-medium">{emptyMessage}</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => col.sortable && handleSort(col.accessor)}
                      className={`px-5 py-3.5 ${col.sortable ? 'cursor-pointer hover:text-slate-200 select-none' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paginatedData.map((row, rIdx) => (
                  <tr key={row._id || rIdx} className="hover:bg-slate-850/60 transition-colors">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-5 py-4 whitespace-nowrap">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && paginatedData.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/40 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
