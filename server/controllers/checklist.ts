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

export async function getChecklists(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const checklists = await selectChecklistsByTripId(+tripId);
    return res.json({ data: checklists });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createChecklist(req: Request, res: Response) {
  try {
    const { tripId } = req.params;
    const { name } = req.body;
    const result = await insertChecklist(name, +tripId);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function putChecklist(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const { name } = req.body;
    const result = await updateChecklist(name, +checklistId);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteChecklist(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const result = await deleteChecklistModel(+checklistId);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createChecklistItem(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const { name, order } = req.body;
    const result = await insertChecklistItem(name, +checklistId, order);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getChecklistItems(req: Request, res: Response) {
  try {
    const { checklistId } = req.params;
    const checklistItems = await selectChecklistItemsByChecklistId(+checklistId);
    return res.json({ data: checklistItems });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function putChecklistItem(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { name, isChecked } = req.body;
    const result = await updateChecklistItem(name, isChecked, +itemId);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteChecklistItem(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const result = await deleteChecklistItemModel(+itemId);
    return res.json({ data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
