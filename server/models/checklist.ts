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
    SELECT  c.id as checklist_id,
            c.name AS checklist_name,
            ci.id AS item_id,
            ci.name AS item_name,
            ci.is_checked,
            ci.item_order
    FROM checklists c
    LEFT JOIN checklist_items ci
    ON c.id = ci.checklist_id 
    WHERE trip_id = $1
    `,
    [tripId],
  );

  const nestedChecklists: { [key: number]: any } = {};

  results.rows.forEach((row) => {
    if (!nestedChecklists[row.checklist_id]) {
      nestedChecklists[row.checklist_id] = {
        id: row.checklist_id,
        name: row.checklist_name,
        items: [],
      };
    }

    if (row.item_id) {
      nestedChecklists[row.checklist_id].items.push({
        id: row.item_id,
        name: row.item_name,
        isChecked: row.is_checked,
        order: row.item_order,
      });
    }
  });

  // Convert the object to an array of checklists
  return Object.values(nestedChecklists);
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

export async function insertChecklistItem(name: string, checklistId: number, order: number) {
  const results = await pool.query(
    `
    INSERT INTO checklist_items (name, checklist_id, item_order)
    VALUES ($1, $2, $3)
  `,
    [name, checklistId, order],
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
  isChecked: boolean,
  checklistItemId: number,
) {
  const results = await pool.query(
    `
    UPDATE checklist_items
    SET name = $1, is_checked = $2
    WHERE id = $3
    `,
    [name, isChecked, checklistItemId],
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
