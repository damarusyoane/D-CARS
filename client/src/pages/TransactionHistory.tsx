
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import CommonFooter from '../components/CommonFooter';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'deposit';
  vehicle: {
    id: string;
    title: string;
    image: string;
  };
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  buyer: {
    id: string;
    name: string;
    avatar: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
}

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'sales' | 'deposits'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [user]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          vehicle:vehicles(*),
          buyer:profiles!transactions_buyer_id_fkey(*),
          seller:profiles!transactions_seller_id_fkey(*)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'purchases') return transaction.type === 'purchase';
    if (filter === 'sales') return transaction.type === 'sale';
    if (filter === 'deposits') return transaction.type === 'deposit';
    return true;
  }).filter((transaction) => {
    if (!search) return true;
    return (
      transaction.vehicle?.title?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.seller?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pagination
  const total = filteredTransactions.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginated = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar activePage="transaction-history" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-lg">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar activePage="transaction-history" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activePage="transaction-history" />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-800 gap-4">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Search by vehicle or user..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <label htmlFor="transaction-filter" className="sr-only">
              Filter transactions
            </label>
            <select
              id="transaction-filter"
              className="rounded bg-gray-800 border border-gray-700 px-3 py-2 text-white"
              value={filter}
              onChange={e => { setFilter(e.target.value as any); setPage(1); }}
            >
              <option value="all">All</option>
              <option value="purchases">Purchases</option>
              <option value="sales">Sales</option>
              <option value="deposits">Deposits</option>
            </select>
          </div>
        </header>

        {/* Table */}
        <div className="flex-1 overflow-x-auto p-6">
          {paginated.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No transactions found.</div>
          ) : (
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Seller</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => (
                  <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/20 transition">
                    <td className="px-4 py-3 flex items-center gap-2">
                      {t.vehicle?.image && (
                        <img src={t.vehicle.image} alt={t.vehicle.title} className="w-10 h-10 rounded object-cover" />
                      )}
                      <span>{t.vehicle?.title || '-'}</span>
                    </td>
                    <td className="px-4 py-3 capitalize">{t.type}</td>
                    <td className="px-4 py-3">${t.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3">{t.date ? format(new Date(t.date), 'PPP') : '-'}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      {t.buyer?.avatar && (
                        <img src={t.buyer.avatar} alt={t.buyer.name} className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <span>{t.buyer?.name || '-'}</span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      {t.seller?.avatar && (
                        <img src={t.seller.avatar} alt={t.seller.name} className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <span>{t.seller?.name || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs mr-2">View</button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  );
}
 export default TransactionHistory;