import { Request, Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service.js';
import { success } from '../utils/helpers.js';

export async function getBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await budgetService.getSummary(req.params.id as string, req.user!.userId);
    success(res, summary);
  } catch (err) {
    next(err);
  }
}

export async function setBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const budget = await budgetService.setBudget(
      req.params.id as string,
      req.user!.userId,
      req.body.totalAmount,
      req.body.currency,
    );
    success(res, budget);
  } catch (err) {
    next(err);
  }
}

export async function listExpenses(req: Request, res: Response, next: NextFunction) {
  try {
    const expenses = await budgetService.listExpenses(req.params.id as string, req.user!.userId);
    success(res, expenses);
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await budgetService.createExpense(req.params.id as string, req.user!.userId, req.body);
    success(res, expense, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await budgetService.updateExpense(req.params.id as string, req.user!.userId, req.body);
    success(res, expense);
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await budgetService.deleteExpense(req.params.id as string, req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}
