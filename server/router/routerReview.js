import express from 'express'
import { client } from '../config/connection.js'
import { authorize } from '../middleware/Authorize.js';

const router = express.Router();

router.post('/add', authorize('user'), async (req, res) => {
    try {
        const { id, productId, rating, comment } = req.body
        
        if (id) {
            await client.query(
                `UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 RETURNING *`,
                [rating, comment, id]
            )
        } else {
            await client.query(
                `INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
                [req.user.id, productId, rating, comment]
            )
        }

        res.status(201).json({ message: id ? 'Review updated successfully' : 'Review added successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

 

export default router