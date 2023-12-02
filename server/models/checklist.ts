import pool from './dbPools.js';

export async function insertChecklist(name: string, tripId: number) {
  const results = await pool.query(
    `
    INSERT INTO checklists (name, trip_id)
    VALUES ($1, $2)
  `,
    [name, tripId],
  );

  return results.rows;
}

export async function selectChecklistsByTripId(tripId: number) {
  const results = await pool.query(
    `
    SELECT id, name, trip_id
    FROM checklists
    WHERE trip_id = $1
    `,
    [tripId],
  );

  return results.rows;
}

export async function selectChecklistById(checklistId: number) {
  const results = await pool.query(
    `
    SELECT id, name, trip_id
    FROM checklists
    WHERE id = $1
    `,
    [checklistId],
  );

  return results.rows;
}

export async function updateChecklist(name: string, checklistId: number) {
  const results = await pool.query(
    `
    UPDATE checklists
    SET name = $1
    WHERE id = $2
    `,
    [name, checklistId],
  );

  return results.rows;
}

export async function deleteChecklist(checklistId: number) {
  const results = await pool.query(
    `
    DELETE FROM checklists
    WHERE id = $1
    `,
    [checklistId],
  );

  return results.rows;
}

export async function insertChecklistItem(name: string, checklistId: number) {
  const results = await pool.query(
    `
    INSERT INTO checklist_items (name, id)
    VALUES ($1, $2)
  `,
    [name, checklistId],
  );

  return results.rows;
}

export async function selectChecklistItemsByChecklistId(checklistId: number) {
  const results = await pool.query(
    `
    SELECT id, name, checklist_id, is_checked
    FROM checklist_items
    WHERE id = $1
    `,
    [checklistId],
  );

  return results.rows;
}

export async function updateChecklistItem(
  name: string,
  order: number,
  isChecked: boolean,
  checklistItemId: number,
) {
  const results = await pool.query(
    `
    UPDATE checklist_items
    SET name = $1, order = $2, is_checked = $3
    WHERE id = $4
    `,
    [name, order, isChecked, checklistItemId],
  );

  return results.rows;
}

export async function deleteChecklistItem(checklistItemId: number) {
  const results = await pool.query(
    `
    DELETE FROM checklist_items
    WHERE id = $1
    `,
    [checklistItemId],
  );

  return results.rows;
}
