const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

router.get('/candidates', (req, res) => {
  const sql = `
    SELECT
      candidates.*, parties.name
    AS
      party_name
    FROM
      candidates
    LEFT JOIN
      parties
    ON
      candidates.party_id = parties.id
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }

    res.json({
      message: 'success',
      data: rows
    });
  });
});

router.get('/candidate/:id', (req, res) => {
  const sql = `
    SELECT candidates.*, parties.name
    AS party_name
    FROM candidates
    LEFT JOIN parties
    ON candidates.party_id = parties.id
    WHERE candidates.id = ?
  `;
  const params = [req.params.id];

  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }

    res.json({
      message: 'success',
      data: row
    });
  });
});

router.delete('/candidate/:id', (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!result.affectedRows) {
      res.json({
        message: 'Candidate not found.'
      });
    } else {
      res.json({
        message: 'deleted',
        changes: result.affectedRows,
        id: req.params.id
      });
    }
  });
});

router.post('/candidate', (req, res) => {
  const errors = inputCheck(req.body, 'first_name', 'last_name', 'industry_connected');

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) VALUES (?, ?, ?)`;
  const params = [req.body.first_name, req.body.last_name, req.body.industry_connected];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.json({
      message: 'success',
      data: result
    });
  });
});

// Update a candidate's party
router.put('/candidate/:id', (req, res) => {
  const errors = inputCheck(req.body, 'party_id');

  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `UPDATE candidates SET party_id = ? WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      // check if a record was found
    } else if (!result.affectedRows) {
      res.json({
        message: 'Candidate not found'
      });
    } else {
      res.json({
        message: 'success',
        data: req.body,
        changes: result.affectedRows
      });
    }
  });
});

module.exports = router;