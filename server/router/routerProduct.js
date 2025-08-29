import express from 'express';
import { client } from '../config/connection.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '../middleware/Authorize.js';


const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './assets')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
})

const upload = multer({ storage: storage })

router.post('/add', authorize("admin"), upload.array('images', 10), async (req, res) => {
    try {
        const { id, category_id, name, description, price, capital, stock, weight } = req.body;
        const profit = price - capital;

        let productId;

        await client.query("BEGIN");

        if (id) {
            await client.query(
                `UPDATE products SET category_id = $1, name = $2, description = $3, price = $4, capital = $5, profit = $6, stock = $7, weight = $8 WHERE id = $9 RETURNING *`, 
                [category_id, name, description, price, capital, profit, stock, weight, id]
            )

            productId = id;
        } else {
            const data = await client.query(
                `INSERT INTO products (category_id, name, description, price, capital, profit, stock, weight) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [category_id, name, description, price, capital, profit, stock, weight]
            );

            productId = data.rows[0].id;
        }

        if (req.files && req.files.length > 0) {
            const imageQueries = req.files.map(file => {
                const imagePath = path.join('assets', file.filename);
                return client.query(
                    `INSERT INTO images (product_id, url) VALUES ($1, $2)`,
                    [productId, imagePath]
                );
            });

            await Promise.all(imageQueries);
        }

        await client.query("COMMIT");

        res.status(201).json({ message: id ? "Product successfully updated" : "Product added successfully" });
    } catch (error) {
        console.log("Error adding product: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/list', async (req, res) => {
    try {
        let { search = '', page = 1, limit = 14, categoryId } = req.query;
        const offset = (page - 1) * limit;

        let query = `
        SELECT product.*, ROUND(AVG(review.rating), 1) AS rating, json_agg(
        json_build_object('id', image.id, 'url', image.url
        )) AS images, COALESCE(json_agg(
        DISTINCT jsonb_build_object('id', review.id, 'user', users.name, 'rating', review.rating, 'comment', review.comment))
        FILTER (WHERE review.id IS NOT NULL), '[]') AS reviews
        FROM products AS product
        LEFT JOIN images AS image ON product.id = image.product_id 
        LEFT JOIN reviews AS review ON product.id = review.product_id 
        LEFT JOIN users ON review.user_id = users.id 
        WHERE product.name ILIKE $1`

        let countQuery = `SELECT COUNT(*) AS total FROM products WHERE name ILIKE $1`
        let queryParams = [`%${search}%`]

        if (categoryId) {
            query += ` AND product.category_id = $2`
            countQuery += ` AND category_id = $2`
            queryParams.push(categoryId)
        }

        query += ` GROUP BY product.id ORDER BY product.id ASC LIMIT $${queryParams.length + 1} 
        OFFSET $${queryParams.length + 2}`
        queryParams.push(limit, offset)

        await client.query("BEGIN");

        const data = await client.query(query, queryParams);
        const countData = await client.query(countQuery, queryParams.slice(0, queryParams.length - 2))
        const totalProducts = parseInt(countData.rows[0].total)
        const totalPages = Math.ceil(totalProducts / limit);

        await client.query("COMMIT");

        res.status(200).json({ message: "Products retrieved successfully", result: data.rows, page, limit, totalProducts, totalPages });
    } catch (error) {
        console.log("Error retrieve data: ", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete('/delete/:id', authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        await client.query("BEGIN");

        await client.query("DELETE FROM products WHERE id = $1", [id]);
        await client.query("DELETE FROM images WHERE product_id = $1", [id]);

        await client.query("COMMIT");

        res.status(200).json({ message: "Data deleted successfully" })
    } catch (error) {
        console.log("Error deleted data: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

export default router;