const express = require('express');
const router = express.Router();
const pool = require('../db');

// Input validation helper
function validateTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'El título de la tarea es obligatorio' };
  }
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'El título de la tarea no puede estar vacío' };
  }
  if (trimmed.length > 255) {
    return { valid: false, error: 'El título de la tarea no puede exceder 255 caracteres' };
  }
  // Basic XSS prevention - remove HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '');
  return { valid: true, sanitized };
}

// Validate ID parameter
function validateId(id) {
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return { valid: false, error: 'ID de tarea inválido' };
  }
  return { valid: true, numId };
}

// GET /api/tasks -> listar todas las tareas (ordenadas por fecha de creación)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al listar tareas:', err);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// POST /api/tasks -> crear una nueva tarea
router.post('/', async (req, res) => {
  const { title } = req.body;
  const validation = validateTitle(title);
  
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [validation.sanitized, false]
    );
    const [rows] = await pool.query('SELECT id, title, completed, created_at FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error al crear tarea:', err);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// PUT /api/tasks/:id -> actualizar una tarea (título y/o estado completado)
router.put('/:id', async (req, res) => {
  const idValidation = validateId(req.params.id);
  if (!idValidation.valid) {
    return res.status(400).json({ error: idValidation.error });
  }
  
  const { id } = idValidation;
  const { title, completed } = req.body;
  
  try {
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    let newTitle = existing[0].title;
    if (title !== undefined) {
      const titleValidation = validateTitle(title);
      if (!titleValidation.valid) {
        return res.status(400).json({ error: titleValidation.error });
      }
      newTitle = titleValidation.sanitized;
    }
    
    const newCompleted = completed !== undefined ? Boolean(completed) : existing[0].completed;

    await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [newTitle, newCompleted, id]
    );
    const [rows] = await pool.query('SELECT id, title, completed, created_at FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al actualizar tarea:', err);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE /api/tasks/:id -> eliminar una tarea
router.delete('/:id', async (req, res) => {
  const idValidation = validateId(req.params.id);
  if (!idValidation.valid) {
    return res.status(400).json({ error: idValidation.error });
  }
  
  const { id } = idValidation;
  
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

module.exports = router;
