
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import CommonFooter from '../components/CommonFooter';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'deposit' | 'refund';
  vehicle: {
    id: string;
    title: string;
    image: string;
  };
  amount: number;
  status: 'completed' | 'pending' | 'cancelled' | 'processing' | 'refunded';
  date: string;
  payment_method?: string;
  notes?: string;
  buyer: {
    id: string;
    name: string;
    avatar: string;
    email?: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
    email?: string;
  };
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'sales' | 'deposits' | 'refunds'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled' | 'processing' | 'refunded'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [user]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) return;
      
      // Fetch transactions from Supabase with all related data
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          status,
          created_at,
          vehicle_id,
          buyer_id,
          seller_id,
          notes,
          payment_method,
          vehicles:vehicle_id(id, make, model, year, price, images),
          buyer:buyer_id(id, full_name, avatar_url, email),
          seller:seller_id(id, full_name, avatar_url, email)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to match our Transaction interface
      const formattedTransactions: Transaction[] = data?.map((tx: any) => {
        return {
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          date: tx.created_at,
          payment_method: tx.payment_method || 'Card',
          notes: tx.notes,
          vehicle: {
            id: tx.vehicles?.id || '',
            title: tx.vehicles ? `${tx.vehicles.year} ${tx.vehicles.make} ${tx.vehicles.model}` : 'Unknown Vehicle',
            image: tx.vehicles?.images?.[0] || '/placeholder-car.jpg'
          },
          buyer: {
            id: tx.buyer?.id || '',
            name: tx.buyer?.full_name || 'Unknown User',
            avatar: tx.buyer?.avatar_url || '/default-avatar.png',
            email: tx.buyer?.email
          },
          seller: {
            id: tx.seller?.id || '',
            name: tx.seller?.full_name || 'Unknown User',
            avatar: tx.seller?.avatar_url || '/default-avatar.png',
            email: tx.seller?.email
          }
        };
      }) || [];
      
      setTransactions(formattedTransactions);
      
      // Update localStorage cache for offline viewing
      localStorage.setItem('transactionHistory', JSON.stringify({
        timestamp: new Date().toISOString(),
        data: formattedTransactions
      }));
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
      
      // Try to load from cache if network request fails
      const cachedData = localStorage.getItem('transactionHistory');
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setTransactions(parsed.data);
          setError('Showing cached data. Pull down to refresh.');
        } catch (cacheErr) {
          console.error('Error parsing cached data:', cacheErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions().then(() => {
      setIsRefreshing(false);
      toast.success('Transactions refreshed');
    });
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInputRef.current) {
        setSearch(searchInputRef.current.value);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInputRef.current?.value]);

  // Handle export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Vehicle', 'Amount', 'Status', 'Buyer', 'Seller'];
    
    const csvData = filteredTransactions.map(tx => [
      format(new Date(tx.date), 'yyyy-MM-dd'),
      tx.type,
      tx.vehicle.title,
      `$${tx.amount.toLocaleString()}`,
      tx.status,
      tx.buyer.name,
      tx.seller.name
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Transactions exported to CSV');
    setShowExportOptions(false);
  };
  
  // Apply filters and sorting
  const filteredTransactions = transactions
    // Filter by transaction type
    .filter((transaction) => {
      if (filter === 'purchases') return transaction.type === 'purchase';
      if (filter === 'sales') return transaction.type === 'sale';
      if (filter === 'deposits') return transaction.type === 'deposit';
      if (filter === 'refunds') return transaction.type === 'refund';
      return true;
    })
    // Filter by status
    .filter((transaction) => {
      if (statusFilter === 'all') return true;
      return transaction.status === statusFilter;
    })
    // Filter by date range
    .filter((transaction) => {
      if (!dateRange.startDate && !dateRange.endDate) return true;
      const txDate = new Date(transaction.date);
      
      if (dateRange.startDate && dateRange.endDate) {
        return txDate >= dateRange.startDate && txDate <= dateRange.endDate;
      }
      if (dateRange.startDate) {
        return txDate >= dateRange.startDate;
      }
      if (dateRange.endDate) {
        return txDate <= dateRange.endDate;
      }
      
      return true;
    })
    // Filter by search term
    .filter((transaction) => {
      if (!search) return true;
      return (
        transaction.vehicle?.title?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.seller?.name?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.id.toLowerCase().includes(search.toLowerCase()) ||
        transaction.payment_method?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.status.toLowerCase().includes(search.toLowerCase())
      );
    })
    // Sort transactions
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
      if (sortBy === 'status') {
        return sortDirection === 'asc' 
          ? a.status.localeCompare(b.status) 
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

  // Pagination
  const total = filteredTransactions.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-200';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border border-blue-200';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border border-red-200';
      case 'refunded':
        return 'bg-purple-500/10 text-purple-500 border border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-500 border border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'refunded':
        return <ArrowDownCircleIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'card':
      case 'credit card':
        return <CreditCardIcon className="w-4 h-4 text-gray-500" />;
      case 'bank transfer':
        return <BuildingLibraryIcon className="w-4 h-4 text-gray-500" />;
      case 'cash':
        return <BanknotesIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <BanknotesIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activePage="transaction-history" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transaction History</h1>
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Loading your transactions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar activePage="transaction-history" />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Transaction History</h1>
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 mb-6 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Summary Cards ---
  const totalSpent = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
  const totalTransactions = transactions.length;
  const completedCount = transactions.filter(t => t.status === 'completed').length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activePage="transaction-history" />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Transactions</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{totalTransactions}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
              <ArrowUpCircleIcon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Spent</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${totalSpent.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
              <ArrowDownCircleIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Earned</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">${totalEarned.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-emerald-500 mr-3" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{completedCount}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isRefreshing}
              >
                <ArrowPathIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                >
                  <DocumentArrowDownIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Export
                </button>
                {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={exportToCSV}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        role="menuitem"
                      >
                        Export as CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Transaction Type
                  </label>
                  <select
                    id="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Transactions</option>
                    <option value="purchases">Purchases</option>
                    <option value="sales">Sales</option>
                    <option value="deposits">Deposits</option>
                    <option value="refunds">Refunds</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="status">Status</option>
                    </select>
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label="Toggle sort direction"
                    >
                      {sortDirection === 'asc' ? (
                        <ArrowUpCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ArrowDownCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <XCircleIcon className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No Transactions Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">You have no transactions matching these filters. Try adjusting your filters or check back later.</p>
                </div>
              </div>
                    <BanknotesIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No transactions found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Parties
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {paginated.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                              {t.vehicle?.image ? (
                                <img src={t.vehicle.image} alt="Vehicle" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-gray-400 text-xs">No Image</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {t.vehicle?.title || 'Unknown Vehicle'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {t.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="capitalize flex items-center gap-1" title={t.type.charAt(0).toUpperCase() + t.type.slice(1)}>
                            {t.type === 'purchase' ? <ArrowUpCircleIcon className="w-4 h-4 text-blue-500" /> : t.type === 'sale' ? <ArrowDownCircleIcon className="w-4 h-4 text-yellow-500" /> : null}
                            {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">${t.amount.toLocaleString()}</div>
                          {t.payment_method && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                              {getPaymentMethodIcon(t.payment_method)}
                              <span className="ml-1 capitalize flex items-center gap-1" title={t.payment_method}>
                                {t.payment_method}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(t.status)} gap-1`} title={t.status.charAt(0).toUpperCase() + t.status.slice(1)}>
                              {getStatusIcon(t.status)}
                              {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <div>{format(new Date(t.date), 'PP')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(t.date), 'p')}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                              <img src={t.buyer.avatar} alt={t.buyer.name} className="h-6 w-6 rounded-full" />
                              <div className="ml-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Buyer</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{t.buyer.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <img src={t.seller.avatar} alt={t.seller.name} className="h-6 w-6 rounded-full" />
                              <div className="ml-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Seller</div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{t.seller.name}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <button
                              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" />
                            </button>
                            {t.status === 'completed' && (
                              <button
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Download Receipt"
                              >
                                <DocumentArrowDownIcon className="h-5 w-5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pb-6">
              <button
                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <span className="text-gray-300">Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
          <CommonFooter />
        </div>
      </div>
    </div>
  );
}
 export default TransactionHistory;