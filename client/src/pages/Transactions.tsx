import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'purchase' | 'sale';
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

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchases' | 'sales'>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'purchases') return transaction.type === 'purchase';
    if (filter === 'sales') return transaction.type === 'sale';
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-dark-accent text-white'
                : 'bg-dark-secondary text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('purchases')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'purchases'
                ? 'bg-dark-accent text-white'
                : 'bg-dark-secondary text-gray-400 hover:text-white'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setFilter('sales')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'sales'
                ? 'bg-dark-accent text-white'
                : 'bg-dark-secondary text-gray-400 hover:text-white'
            }`}
          >
            Sales
          </button>
        </div>
      </div>

      <div className="bg-dark-secondary rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 font-medium">Vehicle</th>
                <th className="text-left py-4 px-6 font-medium">Type</th>
                <th className="text-left py-4 px-6 font-medium">Amount</th>
                <th className="text-left py-4 px-6 font-medium">Status</th>
                <th className="text-left py-4 px-6 font-medium">Date</th>
                <th className="text-left py-4 px-6 font-medium">Buyer/Seller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-700/50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={transaction.vehicle.image}
                        alt={transaction.vehicle.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <span className="font-medium">{transaction.vehicle.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="capitalize">{transaction.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-dark-accent">
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        transaction.status
                      )}`}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-400">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          transaction.type === 'purchase'
                            ? transaction.seller.avatar
                            : transaction.buyer.avatar
                        }
                        alt={
                          transaction.type === 'purchase'
                            ? transaction.seller.name
                            : transaction.buyer.name
                        }
                        className="w-8 h-8 rounded-full"
                      />
                      <span>
                        {transaction.type === 'purchase'
                          ? transaction.seller.name
                          : transaction.buyer.name}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 