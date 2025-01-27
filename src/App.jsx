import React, { useEffect, useState } from "react"
import './index.css'
import { v4 as uuidv4 } from 'uuid';
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, DollarSign, Edit2, Check, X } from 'lucide-react';



function App() {

  const [amount, setAmount] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editingTransaction, setEditingTransaction] = useState(null)
  let [balance, setBalance] = useState(0)
  const [transactions, setTransaction] = useState([])


  useEffect(() => {
    const storedBalance = localStorage.getItem('balance')
    const storedTransactions = localStorage.getItem('transactions')

    if (storedBalance) {
      setBalance(Number(storedBalance))
    }

    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions)
        if (Array.isArray(parsedTransactions)) {
          setTransaction(parsedTransactions)
        }
      } catch (e) {
        console.error('Error parsing transactions :', e)
        setTransaction([])
      }
    }

  }, [])


  const calculateBouns = (amount) => {
    if (Number(amount) === 1000) return 50
    if (Number(amount) === 500) return 20
    if (Number(amount) === 100) return 5
    return 0


  }

  const addFunds = () => {
    const bouns = calculateBouns(amount)
    const newAmount = Number(amount)
    if (newAmount > 0) {
      const newbalance = balance + newAmount + bouns
      setBalance(newbalance)
      logTransaction('Added', newAmount, newbalance, bouns)
      localStorage.setItem('balance', String(newbalance))
    }
    setAmount('')

  }

  const withDraw = () => {
    const newAmount = Number(amount)
    if (newAmount > 0 && newAmount <= balance) {
      const newbalance = balance - newAmount
      setBalance(newbalance)
      logTransaction('WithDraw', newAmount, newbalance, 0)
      localStorage.setItem('balance', String(newbalance))

    }
    setAmount('')

  }

  const logTransaction = (type, amount, balance, bouns) => {
    const transactionsLog = {
      id: uuidv4(),
      type,
      amount,
      balance,
      bouns,
      date: new Date().toLocaleString(),
      timestamp: Date.now()
    }

    const updatedTranaction = [...transactions, transactionsLog]
    setTransaction(updatedTranaction)
    localStorage.setItem('transactions' ,JSON.stringify(updatedTranaction))


  }

  const check = (trans) => {
    const newEditAmount = Number(editAmount)

    if (newEditAmount <= 0) return
    const oldAmount = trans.amount
    const oldBouns = trans.bouns || 0
    const newBouns = trans.type === 'Added' ? calculateBouns(newEditAmount) : 0


    let newBalance = balance
    if (trans.type === 'Added') {
      newBalance = newBalance - oldAmount - oldBouns + newEditAmount + newBouns
    } else {
      const difference = newEditAmount - oldAmount
      if (newBalance - difference < 0) return
      newBalance = newBalance - difference


    }


    const updatedTransactions = transactions.map((item) => {
      if (item.id === trans.id) {
        return {
          ...item,
          amount: newEditAmount,
          bouns: newBouns,
          balance: newBalance
        }
      }

      return item
    })



    setTransaction(updatedTransactions)
    setBalance(newBalance)
    localStorage.setItem('balance' ,String(newBalance))
    localStorage.setItem('transactions' ,JSON.stringify(updatedTransactions))


    setEditAmount('')
    setEditingTransaction('')
  

  }

  const cancel = () => {
    setEditAmount('')
    setEditingTransaction(null)

  }

  const canEdit = (timestamp) => {
    const FiveMinMill = 5 * 60 * 1000
    return Date.now() - timestamp <= FiveMinMill
  };

  const EditFund = (trans) => {
    if (canEdit(trans.timestamp)) {
      setEditingTransaction(trans.id)
      setEditAmount(String(trans.amount))
    }
  }

  console.log(editAmount)


  return (
    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen " >
      {/* balance */}
      <div className=" text-center block lg:flex justify-between items-center rounded-lg bg-white p-10">
        <div className="flex gap-2">
          <Wallet className="text-indigo-600 w-8 h-8" />
          <p className="text-2xl font-bold ">Digital Wallet</p>

        </div>
        <div className="mt-5 lg:mt-0">
          <p className="text-[14px] text-gray-600 ">Current Balance</p>
          <p className=" text-3xl text-indigo-600 font-bold">{balance}</p>
        </div>
      </div>

      {/* amount */}

      <div className="bg-white p-3 my-10 w-full rounded-lg">

        <label className="font-medium text-md ms-2 text-gray-700">Amount</label>  <div className="my-4">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-md py-2 ps-10 border-gray-400 border-[1px] " type="number" placeholder="Enter amount" />

          </div>
          <div className="flex  justify-between items-center my-5 gap-4 ">
            <button onClick={addFunds} className="w-full flex  items-center justify-center gap-2  rounded-md py-5 bg-green-800 text-white">                <ArrowUpCircle className="w-5 h-5" />
              Add Funds</button>
            <button onClick={withDraw} className="w-full flex  items-center justify-center gap-2 rounded-md py-5 bg-red-800 text-white" >                <ArrowDownCircle className="w-5 h-5" />
              Withdraw</button>
          </div>
        </div>
      </div>


      {/* Transaction History */}
      <div className="bg-white p-3 rounded-lg">
        <p className="text-2xl font-medium flex items-center gap-2  ms-2 py-4"> <History className="w-7 h-7 text-indigo-600" />Transaction History</p>
        <div>
        </div>

        <div>
          {
            transactions.length === 0 ? (<p className="text-center font-medium text-lg">No Transactions Yet</p>) : (


              transactions?.map((item) => (
                <ul key={item.id} className="my-3 bg-gray-100 p-3 rounded-md">
                  <li className="flex justify-between items-center">
                    <div className="flex gap-5 items-start">
                      {
                        editingTransaction === item.id ?
                          (

                            <div className="flex gap-3">
                              <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
                              <button className="p-1 text-green-600 hover:text-green-700" onClick={() => check(item)}>
                                <Check className="w-5 h-5" />
                              </button>
                              <button className="text-red-600 hover:text-red-700 p-1" onClick={cancel}>

                                <X className="w-5 h-5" />
                              </button>
                            </div>

                          ) : (
                            <div className="flex ">
                              <div>
                                <p className="text-[16px] font-medium flex gap-2 items-center">
                                  <p> {item.type === 'Added' ? (<ArrowUpCircle className="text-green-600" />) : <ArrowDownCircle className="text-red-600" />}</p>
                                  {item.type} $ {item.amount}</p>
                                <p className="text-sm text-gray-500 ms-7 my-1">{item.date}</p>
                              </div>

                              <div>{
                                canEdit(item.timestamp) &&
                                (
                                  <button onClick={() => EditFund(item)}>
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                )
                              }
                              </div>
                            </div>
                          )
                      }


                    </div>
                    <p className="text-md font-medium flex">Balance : $ <p className="text-gray-700">{item.balance}</p></p>
                  </li>
                </ul>
              ))

            )
          }
        </div>



      </div>

    </div>
  )
}

export default App
