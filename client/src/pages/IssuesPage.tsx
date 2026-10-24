import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { ticketService } from '../services/api';
import { TableView } from '../components/TableView';
import { Ticket } from '../types';

export const IssuesPage: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedProject,
    searchQuery,
    priorityFilter,
    typeFilter,
    assigneeFilter,
    labelFilter,
    quickTab,
    openTicketDetail,
    handleStatusChange: globalStatusChange,
    handleDeleteTicket: globalDeleteTicket,
  } = useProject();

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [paginatedTickets, setPaginatedTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Reset to page 1 whenever search or top-level filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProject?._id, searchQuery, priorityFilter, typeFilter, assigneeFilter, labelFilter, quickTab]);

  // Server-side paginated fetch
  const fetchPaginatedTickets = useCallback(async () => {
    try {
      setLoading(true);

      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };

      if (selectedProject?._id) {
        params.projectId = selectedProject._id;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (priorityFilter !== 'All') {
        params.priority = priorityFilter;
      }

      if (typeFilter !== 'All') {
        params.type = typeFilter;
      }

      if (assigneeFilter !== 'All') {
        params.assignedTo = assigneeFilter;
      }

      if (labelFilter !== 'All') {
        params.label = labelFilter;
      }

      // Quick tab filters
      if (quickTab === 'my_tickets' && user?._id) {
        params.assignedTo = user._id;
      } else if (quickTab === 'urgent') {
        params.priority = 'Urgent';
      }

      const res = await ticketService.getTickets(params);

      if (res.data.success) {
        setPaginatedTickets(res.data.tickets || []);
        setTotalTickets(res.data.total ?? res.data.count ?? 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load paginated tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    selectedProject?._id,
    searchQuery,
    priorityFilter,
    typeFilter,
    assigneeFilter,
    labelFilter,
    quickTab,
    user?._id,
  ]);

  // Debounced fetch when searchQuery changes, instant otherwise
  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        fetchPaginatedTickets();
      }, 300);
    } else {
      fetchPaginatedTickets();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchPaginatedTickets, searchQuery]);

  // Handle status transition and update current page state optimistically
  const handleStatusChange = async (ticket: Ticket, newStatus: string) => {
    // Optimistic UI update
    setPaginatedTickets((prev) =>
      prev.map((t) => (t._id === ticket._id ? { ...t, status: newStatus as any } : t))
    );

    try {
      await globalStatusChange(ticket, newStatus);
    } catch (err) {
      // Revert on error
      fetchPaginatedTickets();
    }
  };

  // Handle ticket deletion and adjust pagination count
  const handleDeleteTicket = async (id: string) => {
    try {
      await globalDeleteTicket(id);
      setPaginatedTickets((prev) => prev.filter((t) => t._id !== id));
      setTotalTickets((prev) => Math.max(0, prev - 1));

      // If last item on page was deleted and not on page 1, go to previous page
      if (paginatedTickets.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchPaginatedTickets();
      }
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <TableView
      tickets={paginatedTickets}
      totalTickets={totalTickets}
      currentPage={currentPage}
      pageSize={pageSize}
      totalPages={totalPages}
      loading={loading}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onOpenDetail={openTicketDetail}
      onStatusChange={handleStatusChange}
      onDeleteTicket={handleDeleteTicket}
    />
  );
};

export default IssuesPage;
