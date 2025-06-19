import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import './App.css';

const COLORS = ['#8e44ad', '#27ae60', '#f39c12', '#e74c3c'];

export default function FamilyBudgetPlanner() {
  const [arecanutIncome, setArecanutIncome] = useState(650000);
  const [salaryIncome, setSalaryIncome] = useState(15000 * 12);
  const [coconutIncome, setCoconutIncome] = useState(120000);
  const [suggestions, setSuggestions] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [predictedExpense, setPredictedExpense] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const calculateBudget = () => {
    const totalIncome = arecanutIncome + salaryIncome + coconutIncome;
    const needs = totalIncome * 0.5;
    const wants = totalIncome * 0.3;
    const savings = totalIncome * 0.2;

    setSuggestions(prev => ({
      ...prev,
      totalIncome,
      needs,
      wants,
      savings
    }));
  };

  useEffect(() => {
    if (!suggestions) return;

    const yearlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) * 12;
    const net = suggestions.totalIncome - yearlyExpenses;

    setSuggestions(prev => ({
      ...prev,
      yearlyExpenses,
      net
    }));
  }, [expenses, suggestions?.totalIncome]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    setExpenses([...expenses, { title, amount: parseFloat(amount), category }]);
    setTitle("");
    setAmount("");
  };

  const handlePredict = async () => {
    // Dummy past 5 months data + current month
    const totalMonthly = expenses.reduce((sum, e) => sum + e.amount, 0);
    const monthlyExpenses = [20000, 22000, 24000, 26000, 28000, totalMonthly];

    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyExpenses })
    });

    const data = await res.json();
    setPredictedExpense(data.predictedExpense);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = expenses.reduce((acc, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + cur.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <motion.h1 className="text-4xl font-bold text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        Family Budget Planner 3D
      </motion.h1>

      <div className="glass-card mb-8">
        <div className="grid gap-6 md:grid-cols-3">
          <label>
            Arecanut Revenue (Yearly ₹):
            <input type="number" className="input-field" value={arecanutIncome} onChange={e => setArecanutIncome(+e.target.value)} />
          </label>
          <label>
            Father's Salary (Monthly ₹):
            <input type="number" className="input-field" value={salaryIncome / 12} onChange={e => setSalaryIncome(+e.target.value * 12)} />
          </label>
          <label>
            Coconut Revenue (Yearly ₹):
            <input type="number" className="input-field" value={coconutIncome} onChange={e => setCoconutIncome(+e.target.value)} />
          </label>
        </div>
        <button className="primary-btn mt-6 w-full" onClick={calculateBudget}>💡 Calculate Yearly Budget</button>
      </div>

      {suggestions && (
        <div className="glass-card mb-10">
          <div className="text-xl font-semibold mb-4">Suggested Yearly Plan</div>
          <ul className="summary-list">
            <li>👨‍👩‍👧‍👦 Total Income: ₹{suggestions.totalIncome.toLocaleString()}</li>
            <li>🏠 Essentials (Food, Rent, Utilities): ₹{suggestions.needs.toLocaleString()}</li>
            <li>🎉 Lifestyle & Leisure (Wants): ₹{suggestions.wants.toLocaleString()}</li>
            <li>💰 Future Savings & Emergency Fund: ₹{suggestions.savings.toLocaleString()}</li>
          </ul>

          {'yearlyExpenses' in suggestions && (
            <div className="mt-4">
              <p>🧾 Estimated Yearly Expenses (Monthly × 12): ₹{suggestions.yearlyExpenses.toLocaleString()}</p>
              <p className={suggestions.net >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {suggestions.net >= 0 ? '✅ Net Profit' : '⚠️ Net Loss'}: ₹{suggestions.net.toLocaleString()}
              </p>
            </div>
          )}

          <div className="mt-6 chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Essentials', value: suggestions.needs },
                { name: 'Lifestyle', value: suggestions.wants },
                { name: 'Savings', value: suggestions.savings },
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-card">
        <h2 className="section-title">📅 Monthly Expense Tracker</h2>
        <form onSubmit={handleAddExpense} className="grid md:grid-cols-4 gap-4 mb-6">
          <input type="text" placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Bills">Bills</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit" className="primary-btn">Add Expense</button>
        </form>

        <div className="mb-4">Total Spent: ₹{totalSpent.toLocaleString()}</div>
        <ul className="divide-y">
          {expenses.map((exp, i) => (
            <li key={i} className="expense-list-item">
              <span>{exp.title} ({exp.category})</span>
              <span>₹{exp.amount}</span>
            </li>
          ))}
        </ul>

        {expenses.length > 0 && (
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <button className="primary-btn mt-4" onClick={handlePredict}>🤖 Predict Next Month’s Expense</button>
        {predictedExpense && (
          <div className="text-lg mt-2 font-semibold text-purple-800">
            🔮 Predicted Expense for Next Month: ₹{predictedExpense}
          </div>
        )}
      </div>
    </div>
  );
}
