import { eachDayOfInterval, format } from 'date-fns';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { requireTripPermission } from './authorization.service.js';

export type ExpenseCategory = 'TRANSPORT' | 'ACCOMMODATION' | 'ACTIVITIES' | 'MEALS' | 'OTHER';

export class BudgetService {
  async getSummary(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'read');

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        budget: true,
        expenses: true,
        stops: {
          include: {
            city: true,
            activities: { include: { activity: true } },
          },
        },
      },
    });
    if (!trip) throw new NotFoundError('Trip not found');

    const activityCosts = trip.stops.flatMap((stop) =>
      stop.activities.map((sa) => ({
        amount: Number(sa.activity.estimatedCost),
        currency: sa.activity.currency,
        category: 'ACTIVITIES' as ExpenseCategory,
        date: sa.scheduledDate ?? stop.arrivalDate ?? trip.startDate,
        city: stop.city.name,
      })),
    );

    const expenseItems = trip.expenses.map((e) => ({
      amount: Number(e.amount),
      currency: e.currency,
      category: e.category as ExpenseCategory,
      date: e.date,
      city: null as string | null,
    }));

    const allItems = [...expenseItems, ...activityCosts];
    const totalEstimated = allItems.reduce((sum, item) => sum + item.amount, 0);

    const byCategory: Record<string, number> = {
      TRANSPORT: 0,
      ACCOMMODATION: 0,
      ACTIVITIES: 0,
      MEALS: 0,
      OTHER: 0,
    };
    for (const item of allItems) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + item.amount;
    }

    const tripDays = eachDayOfInterval({ start: trip.startDate, end: trip.endDate });
    const dailySpending: { date: string; amount: number; overBudget: boolean }[] = tripDays.map(
      (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayAmount = allItems
          .filter((item) => format(new Date(item.date), 'yyyy-MM-dd') === dayStr)
          .reduce((sum, item) => sum + item.amount, 0);
        const dailyBudget = trip.budget
          ? Number(trip.budget.totalAmount) / tripDays.length
          : null;
        return {
          date: dayStr,
          amount: dayAmount,
          overBudget: dailyBudget !== null && dayAmount > dailyBudget * 1.2,
        };
      },
    );

    const cityCount = trip.stops.length || 1;
    const dayCount = tripDays.length || 1;
    const activityCount = trip.stops.reduce((sum, s) => sum + s.activities.length, 0) || 1;

    const budgetLimit = trip.budget ? Number(trip.budget.totalAmount) : null;
    const remaining = budgetLimit !== null ? budgetLimit - totalEstimated : null;
    const overBudget = budgetLimit !== null && totalEstimated > budgetLimit;

    const byCity: Record<string, number> = {};
    for (const stop of trip.stops) {
      const cityCost =
        stop.activities.reduce((sum, sa) => sum + Number(sa.activity.estimatedCost), 0);
      byCity[stop.city.name] = (byCity[stop.city.name] ?? 0) + cityCost;
    }

    return {
      currency: trip.currency,
      totalEstimated,
      budgetLimit,
      remaining,
      overBudget,
      overBudgetAmount: overBudget ? totalEstimated - (budgetLimit ?? 0) : 0,
      byCategory: Object.entries(byCategory).map(([category, amount]) => ({ category, amount })),
      byCity: Object.entries(byCity).map(([city, amount]) => ({ city, amount })),
      dailySpending,
      averages: {
        perDay: totalEstimated / dayCount,
        perCity: totalEstimated / cityCount,
        perActivity: totalEstimated / activityCount,
      },
      alerts: [
        ...(overBudget
          ? [{ type: 'OVER_BUDGET', message: `You are over budget by ${(totalEstimated - (budgetLimit ?? 0)).toFixed(0)}` }]
          : []),
        ...dailySpending
          .filter((d) => d.overBudget)
          .map((d) => ({
            type: 'EXPENSIVE_DAY',
            message: `High spending on ${d.date}: ${d.amount.toFixed(0)}`,
          })),
      ],
    };
  }

  async setBudget(tripId: string, userId: string, totalAmount: number, currency: string) {
    await requireTripPermission(tripId, userId, 'write');
    return prisma.budget.upsert({
      where: { tripId },
      create: {
        tripId,
        totalAmount,
        currency,
      },
      update: { totalAmount, currency },
    });
  }

  async listExpenses(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'read');
    return prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: 'asc' },
    });
  }

  async createExpense(tripId: string, userId: string, data: {
    category: ExpenseCategory; amount: number; currency: string;
    description?: string; date: Date;
  }) {
    await requireTripPermission(tripId, userId, 'write');
    return prisma.expense.create({
      data: {
        tripId,
        category: data.category,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        date: data.date,
      },
    });
  }

  async updateExpense(expenseId: string, userId: string, data: Partial<{
    category: ExpenseCategory; amount: number; currency: string;
    description?: string; date: Date;
  }>) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) throw new NotFoundError('Expense not found');
    await requireTripPermission(expense.tripId, userId, 'write');

    return prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...data,
        currency: data.currency,
      },
    });
  }

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) throw new NotFoundError('Expense not found');
    await requireTripPermission(expense.tripId, userId, 'write');
    await prisma.expense.delete({ where: { id: expenseId } });
    return { message: 'Expense deleted' };
  }
}

export const budgetService = new BudgetService();
