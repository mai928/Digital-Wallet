import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, DollarSign, Edit2, Check, X } from 'lucide-react';

// interface Transaction {
//   id: string;
//   type: 'add' | 'withdraw';
//   amount: number;
//   date: string;
//   balance: number;
//   timestamp: number;
//   bonus?: number; // Track any bonus amount given for this transaction
// }

function Balance() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    const storedBalance = localStorage.getItem('balance');
    const storedTransactions = localStorage.getItem('transactions');
    
    if (storedBalance) {
      setBalance(Number(storedBalance));
    }
    
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        if (Array.isArray(parsedTransactions)) {
          setTransactions(parsedTransactions);
        }
      } catch (e) {
        console.error('Error parsing transactions:', e);
        setTransactions([]);
      }
    }
  }, []);

  const calculateBonus = (amount) => {
    if (amount >= 1000) return 50;
    if (amount >= 500) return 20;
    if (amount >= 100) return 5;
    return 0;
  };

  const addFunds = () => {
    const newAmount = Number(amount);
    if (newAmount > 0) {
      const bonus = calculateBonus(newAmount);
      const newBalance = balance + newAmount + bonus;
      setBalance(newBalance);
      logTransaction('add', newAmount, newBalance, bonus);
      localStorage.setItem('balance', String(newBalance));
    }
    setAmount('');
  };

  const withdrawFunds = () => {
    const newAmount = Number(amount);
    if (newAmount > 0 && newAmount <= balance) {
      const newBalance = balance - newAmount;
      setBalance(newBalance);
      logTransaction('withdraw', newAmount, newBalance);
      localStorage.setItem('balance', String(newBalance));
    }
    setAmount('');
  };

  const logTransaction = (type, amount, balance, bonus) => {
    const transaction= {
      id: crypto.randomUUID(),
      type,
      amount,
      date: new Date().toLocaleString(),
      balance,
      timestamp: Date.now(),
      bonus
    };
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const canEdit = (timestamp) => {
    const fiveMinutesInMs = 5 * 60 * 1000;
    return Date.now() - timestamp <= fiveMinutesInMs;
  };

  const startEdit = (transaction) => {
    if (canEdit(transaction.timestamp)) {
      setEditingTransaction(transaction.id);
      setEditAmount(String(transaction.amount));
    }
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setEditAmount('');
  };

  const saveEdit = (transaction) => {
    const newAmount = Number(editAmount);
    if (newAmount <= 0) return;

    const oldAmount = transaction.amount;
    const oldBonus = transaction.bonus || 0;
    const newBonus = transaction.type === 'add' ? calculateBonus(newAmount) : 0;
    
    let newBalance = balance;
    
    if (transaction.type === 'add') {
      // Remove old amount and bonus, add new amount and bonus
      newBalance = newBalance - oldAmount - oldBonus + newAmount + newBonus;
    } else {
      // For withdrawals, just adjust the difference in amounts
      const amountDiff = newAmount - oldAmount;
      if (newBalance - amountDiff < 0) return;
      newBalance -= amountDiff;
    }

    const updatedTransactions = transactions.map(t => {
      if (t.id === transaction.id) {
        return {
          ...t,
          amount: newAmount,
          balance: newBalance,
          bonus: newBonus || undefined
        };
      }
      // Update subsequent transactions' balances
      if (t.timestamp > transaction.timestamp) {
        const balanceDiff = newBalance - transaction.balance;
        return {
          ...t,
          balance: t.balance + balanceDiff
        };
      }
      return t;
    });

    setBalance(newBalance);
    setTransactions(updatedTransactions);
    localStorage.setItem('balance', String(newBalance));
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setEditingTransaction(null);
    setEditAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Digital Wallet</h1>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-3xl font-bold text-indigo-600">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={addFunds}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowUpCircle className="w-5 h-5" />
                Add Funds
              </button>
              <button
                onClick={withdrawFunds}
                disabled={balance <= 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowDownCircle className="w-5 h-5" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
          </div>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              transactions.map((trans) => (
                <div
                  key={trans.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {trans.type === 'add' ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      {editingTransaction === trans.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          <button
                            onClick={() => saveEdit(trans)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {trans.type === 'add' ? 'Added' : 'Withdrawn'} ${trans.amount.toFixed(2)}
                            {trans.bonus ? ` (+$${trans.bonus} bonus)` : ''}
                          </p>
                          {canEdit(trans.timestamp) && (
                            <button
                              onClick={() => startEdit(trans)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">{trans.date}</p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">Balance: ${trans.balance.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Balance;