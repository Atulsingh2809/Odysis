import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { tripsApi } from '@/api/trips';
import type { BudgetSummary, Expense, ExpenseCategory, Currency } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { getErrorMessage } from '@/api/client';

interface BudgetTabProps {
  tripId: string;
  budgetSummary: BudgetSummary | null;
  expenses: Expense[];
  currency: Currency;
  canEdit: boolean;
  onRefresh: () => void;
}

const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export function BudgetTab({ tripId, budgetSummary, expenses, currency, canEdit, onRefresh }: BudgetTabProps) {
  const [budgetLimit, setBudgetLimit] = useState(budgetSummary?.budgetLimit ? String(budgetSummary.budgetLimit) : '');
  const [settingBudget, setSettingBudget] = useState(false);

  // Add Expense Modal State
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('TRANSPORT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const handleSaveBudgetLimit = async () => {
    try {
      setSettingBudget(true);
      await tripsApi.setBudget(tripId, {
        totalAmount: Number(budgetLimit) || 0,
        currency,
      });
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to set budget limit'));
    } finally {
      setSettingBudget(false);
    }
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Please enter a valid expense amount');
    try {
      setSubmittingExpense(true);
      await tripsApi.addExpense(tripId, {
        category,
        amount: Number(amount),
        currency,
        description: description || undefined,
        date,
      });
      setAddExpenseModal(false);
      setAmount('');
      setDescription('');
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to add expense'));
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await tripsApi.deleteExpense(id);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete expense'));
    }
  };

  const totalEstimated = budgetSummary?.totalEstimated ?? 0;
  const isOver = budgetSummary?.overBudget ?? false;
  const overAmount = budgetSummary?.overBudgetAmount ?? 0;

  const pieData = budgetSummary?.byCategory.map((c) => ({ name: c.category, value: c.amount })) ?? [];
  const barData = budgetSummary?.byCity.map((c) => ({ city: c.city, amount: c.amount })) ?? [];

  return (
    <div className="space-y-6">
      {/* Over Budget Alert Banner */}
      {isOver && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-base">Budget Alert: Over Budget!</h4>
            <p className="text-sm text-amber-800">
              Your total estimated trip cost exceeds your defined budget by{' '}
              <span className="font-extrabold text-red-600">₹{overAmount.toLocaleString()}</span>. Consider reviewing your activity expenses or adjusting your overall budget limit.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Alerts */}
      {budgetSummary?.alerts && budgetSummary.alerts.length > 0 && (
        <div className="space-y-2">
          {budgetSummary.alerts.map((alert, idx) => (
            <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Budget Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Estimated Cost</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalEstimated.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Auto-calculated from itinerary</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Budget</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{(budgetSummary?.budgetLimit || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {budgetSummary?.remaining !== null && budgetSummary?.remaining !== undefined
              ? budgetSummary.remaining >= 0
                ? `₹${budgetSummary.remaining.toLocaleString()} remaining`
                : `₹${Math.abs(budgetSummary.remaining).toLocaleString()} over limit`
              : 'No budget set'}
          </p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Cost / Day</p>
          <p className="text-2xl font-extrabold text-primary-600 mt-1">
            ₹{(budgetSummary?.averages.perDay || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Daily expenditure</p>
        </Card>

        <Card className="p-5 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Cost / City</p>
          <p className="text-2xl font-extrabold text-sky-600 mt-1">
            ₹{(budgetSummary?.averages.perCity || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Destination average</p>
        </Card>
      </div>

      {/* Set Budget Limit Form */}
      {canEdit && (
        <Card className="p-4 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-slate-900">Define Trip Budget Limit</h4>
            <p className="text-xs text-slate-500">Set a maximum budget cap to trigger over-budget notifications</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              type="number"
              placeholder="e.g. 100000"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-40"
            />
            <Button size="sm" loading={settingBudget} onClick={handleSaveBudgetLimit}>
              Save Limit
            </Button>
          </div>
        </Card>
      )}

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Donut Chart) */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900">Spending by Category</h3>
          {pieData.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12">No expenses added to render chart.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* City Breakdown (Bar Chart) */}
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900">Cost Breakdown by City</h3>
          {barData.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12">No city stops added to render chart.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Cost']} />
                  <Bar dataKey="amount" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-slate-900">Custom Expenses & Log</h3>
            <p className="text-xs text-slate-500">Track accommodation, meals, transit, and miscellaneous travel costs</p>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setAddExpenseModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Log Expense
            </Button>
          )}
        </div>

        {expenses.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No additional logged expenses.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs">{exp.category}</span>
                    </td>
                    <td className="py-3 px-4">{exp.description || '—'}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{Number(exp.amount).toLocaleString()}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDeleteExpense(exp.id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Expense Modal */}
      <Modal isOpen={addExpenseModal} onClose={() => setAddExpenseModal(false)} title="Log Custom Expense">
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
          <Select label="Expense Category" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            <option value="TRANSPORT">Transport</option>
            <option value="ACCOMMODATION">Accommodation</option>
            <option value="MEALS">Meals</option>
            <option value="ACTIVITIES">Activities</option>
            <option value="OTHER">Other</option>
          </Select>

          <Input label="Amount (INR)" type="number" placeholder="e.g. 5500" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Description (Optional)" placeholder="e.g. Hotel reservation, Flight ticket" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setAddExpenseModal(false)}>Cancel</Button>
            <Button type="submit" loading={submittingExpense}>Add Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
