import express from 'express';
import { client } from '../config/connection.js';
import { authorize } from '../middleware/Authorize.js';

const router = express.Router();

router.post('/add', authorize("admin"), async (req, res) => {
    try {
        const { name } = req.body;

        const data = await client.query(
            `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
            [name]
        );

        const result = data.rows[0];

        res.status(201).json({ message: "Category added successfully", result: result });
    } catch (error) {
        console.log("Error adding category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/list', async (req, res) => {
    try {
        let { search = '', page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit
        
        let query = 'SELECT * FROM categories WHERE name ILIKE $1'
        let countQuery = `SELECT COUNT(*) AS total FROM categories WHERE name ILIKE $1`
        let queryParams = [`%${search}%`]

        query += ` ORDER BY name ASC LIMIT $${queryParams.length + 1} 
        OFFSET $${queryParams.length + 2}`
        queryParams.push(limit, offset)

        const data = await client.query(query, queryParams);
        const countData = await client.query(countQuery, queryParams.slice(0, queryParams.length - 2))
        const totalCategories = parseInt(countData.rows[0].total)
        const totalPages = Math.ceil(totalCategories / limit);

        res.status(200).json({ message: "Categories retrieved successfully", result: data.rows, page, limit, totalCategories, totalPages });
    } catch (error) {
        console.log("Error retrieving categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put('/update/:id', authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const data = await client.query(
            `UPDATE categories SET name = $1 WHERE id = $2 RETURNING *`,
            [name, id]
        );

        res.status(200).json({ message: "Category updated successfully", result: data.rows[0] });
    } catch (error) {
        console.log("Error updating category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.delete('/delete/:id', authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        await client.query(`DELETE FROM categories WHERE id = $1`, [id]);

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.log("Error deleting category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// Handle both add and update in one endpoint
router.post('/add-update', authorize("admin"), async (req, res) => {
    try {
        if (req.body.id) {
            const { id, name } = req.body;

            const data = await client.query(
                `UPDATE categories SET name = $1 WHERE id = $2 RETURNING *`,
                [name, id]
            );

            res.status(200).json({ message: "Category updated successfully", result: data.rows[0] });
        } else {
            const { name } = req.body;

            const data = await client.query(
                `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
                [name]
            );

            res.status(201).json({ message: "Category added successfully", result: data.rows[0] });
        }
    } catch (error) {
        console.log("Error adding category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;