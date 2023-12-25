import { Request, Response } from 'express';

import {
  selectChecklistItemsByChecklistId,
  selectChecklistsByTripId,
  insertChecklist,
  updateChecklist,
  deleteChecklist as deleteChecklistModel,
  insertChecklistItem,
  updateChecklistItem,
  deleteChecklistItem as deleteChecklistItemModel,
} from '../models/checklist.js';
import { handleError } from '../utils/errorHandler.js';

export async function getChecklists(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const checklists = await selectChecklistsByTripId(+tripId);
    res.json({ data: checklists });
  } catch (error) {
    handleError(error, res);
  }
  return undefined;
}

export async function createChecklist(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const { name } = req.body;
    const result = await insertChecklist(name, +tripId);
    res.json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function putChecklist(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const { name } = req.body;
    const result = await updateChecklist(name, +checklistId);
    res.json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteChecklist(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const result = await deleteChecklistModel(+checklistId);
    res.json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function createChecklistItem(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const { name, order } = req.body;
    const result = await insertChecklistItem(name, +checklistId, order);
    res.json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getChecklistItems(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const checklistItems = await selectChecklistItemsByChecklistId(+checklistId);
    res.json({ data: checklistItems });
  } catch (error) {
    handleError(error, res);
  }
}

export async function putChecklistItem(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { name, isChecked } = req.body;
    const result = await updateChecklistItem(name, isChecked, +itemId);
    res.json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteChecklistItem(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const result = await deleteChecklistItemModel(+itemId);
    res.json({ data: result });
  } catch (error) {
    handleError(error, res);
  }
}
