import React from 'react';
import Sidebar from '../components/Sidebar';
import CommonFooter from '../components/CommonFooter';

const TransactionHistory: React.FC = () => {
  const transactions = [
    {
      id: 1,
      type: 'Purchase',
      carName: '2019 Audi A4',
      date: 'March 15, 2023',
      amount: '$32,500',
      status: 'Completed',
    },
    {
      id: 2,
      type: 'Sale',
      carName: '2018 Ford F-150',
      date: 'January 8, 2023',
      amount: '$28,750',
      status: 'Completed',
    },
    {
      id: 3,
      type: 'Deposit',
      carName: '2022 Toyota Camry',
      date: 'April 10, 2023',
      amount: '$3,000',
      status: 'Completed',
    },
    {
      id: 4,
      type: 'Sale',
      carName: '2020 Mercedes-Benz C-Class',
      date: 'February 14, 2023',
      amount: '$45,200',
      status: 'Completed',
    },
    {
      id: 5,
      type: 'Purchase',
      carName: '2021 Tesla Model 3',
      date: 'May 3, 2023',
      amount: '$39,900',
      status: 'Processing',
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activePage="transaction-history" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex">
              <button className="bg-gray-800 text-white px-4 py-2 rounded-l-md border-y border-l border-gray-700">All</button>
              <button className="bg-gray-800 text-white px-4 py-2 border-y border-gray-700">Purchases</button>
              <button className="bg-gray-800 text-white px-4 py-2 border-y border-gray-700">Sales</button>
              <button className="bg-gray-800 text-white px-4 py-2 rounded-r-md border-y border-r border-gray-700">Deposits</button>
            </div>
          </div>
        </header>
        
        {/* Transaction Table */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Car
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'Purchase' ? 'bg-blue-900 text-blue-200' : 
                        transaction.type === 'Sale' ? 'bg-green-900 text-green-200' : 
                        'bg-yellow-900 text-yellow-200'
                      }`}>
                        {transaction.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{transaction.carName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{transaction.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">{transaction.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        transaction.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-400 hover:text-blue-300 mr-3">View</button>
                      <button className="text-blue-400 hover:text-blue-300">Receipt</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of <span className="font-medium">12</span> transactions
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 rounded border border-gray-700 bg-gray-800 text-gray-400">
                Previous
              </button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white">
                1
              </button>
              <button className="px-3 py-1 rounded border border-gray-700 bg-gray-800 text-gray-400">
                2
              </button>
              <button className="px-3 py-1 rounded border border-gray-700 bg-gray-800 text-gray-400">
                3
              </button>
              <button className="px-3 py-1 rounded border border-gray-700 bg-gray-800 text-gray-400">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <CommonFooter />
    </div>
  );
};

export default TransactionHistory;