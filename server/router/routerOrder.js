import express from 'express'
import axios from 'axios'
import { nanoid } from 'nanoid'
import { authorize } from '../middleware/Authorize.js';
import { client } from '../config/connection.js';

const router = express.Router();

const config = {
    authorization: `Basic ${Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
}
const BASE_URL = process.env.MIDTRANS_BASE_URL;

// Define a route for processing payments
router.post('/create-order', authorize('user'), async (req, res) => {
  try {
    const { products, gross_amount } = req.body;
    const user = req.user;
    const orderId = `ORDER-${nanoid(5)}-${nanoid(5)}`
    const productsData = products

    await client.query(`BEGIN`)

    const rawData = await client.query(
        `INSERT INTO orders (transaction_id, user_id, total_price) 
        VALUES ($1, $2, $3) RETURNING *`, 
        [orderId, user.id, gross_amount]
    )

    const order = rawData.rows[0];

    for(const product of productsData) {
        await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price, shipping) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [order.id, product.id, product.quantity, product.price, product.shipping]
        )
    }

    await client.query(`COMMIT`)

    const data = {
        customer_details: {
            first_name: user.name,
            email: user.email,
            phone: user.phone,
        },
        transaction_details: {
            order_id: orderId,
            gross_amount: gross_amount,
        },
        credit_card: {
            secure: true,
        },
    }

    const response = await axios.post(BASE_URL + '/snap/v1/transactions', data, {
        headers: {
            'content-Type': 'application/json',
            ...config
        }
    })

    res.status(201).json(response.data);

  } catch (error) {
    console.log('Error processing payment:', error);
  }
});

const updateStatusPayment = async (status, orderId) => {
    console.log(status, orderId);

    await client.query(
        `UPDATE orders SET transaction_status = $1 WHERE transaction_id = $2`,
        [status, orderId]
    )
}

router.post('/transaction-notifications', async (req, res) => {
    try {
        const data = req.body;

        let orderId = data.order_id;
        let transactionStatus = data.transaction_status;
        let fraudStatus = data.fraud_status;

        // Sample transactionStatus handling logic

        if (transactionStatus == 'capture'){
	        if (fraudStatus == 'accept'){
                // TODO set transaction status on your database to 'success'
                // and response with 200 OK
                updateStatusPayment(transactionStatus, orderId)
            }
        } else if (transactionStatus == 'settlement'){
            // TODO set transaction status on your database to 'success'
            // and response with 200 OK
            updateStatusPayment(transactionStatus, orderId)
        } else if (transactionStatus == 'cancel' ||
          transactionStatus == 'deny' ||
          transactionStatus == 'expire'){
          // TODO set transaction status on your database to 'failure'
          // and response with 200 OK
          updateStatusPayment(transactionStatus, orderId)
        } else if (transactionStatus == 'pending'){
          // TODO set transaction status on your database to 'pending' / waiting payment
          // and response with 200 OK
          updateStatusPayment(transactionStatus, orderId)
        }

        res.status(200).json({ status: "success", message: "OK" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/confirm/:id", authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const status = "processing";

        await client.query(
            `UPDATE orders SET status_order = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        )

        res.status(200).json({ message: "Data updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

router.put("/shipping/:id", authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const { resi } = req.body;
        const status = "shipping";

        const checkOrder = await client.query(
            `SELECT * FROM orders WHERE id = $1`,
            [id]
        )
        const order = checkOrder.rows[0]

        const checkProduct = await client.query(
            `SELECT * FROM products WHERE id = $1`,
            [order.product_id]
        )
        const product = checkProduct.rows[0]
        const stock = product.stock - order.items

        await client.query(
            `UPDATE products SET stock = $1 WHERE id = $2`,
            [stock, order.product_id]
        )

        await client.query(
            `UPDATE orders SET resi = $1, status_order = $2 WHERE id = $3 RETURNING *`,
            [resi, status, id]
        )

        res.status(200).json({ message: "Data updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

router.put("/cancel/:id", authorize("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const status = "cancelled";

        await client.query(
            `UPDATE orders SET status_order = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        )

        res.status(200).json({ message: "Data updated successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

router.get("/get-orders", authorize("user", "admin"), async (req, res) => {
    try {
        const level = req.user.level
        const user_id = req.user.id
        let data;

        if (level === 'admin') {
            data = await client.query(
                `SELECT orders.*, users.*, addresses.*, 
                users.name AS user_name, 
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', products.id, 
                'name', products.name, 
                'price', order_items.price, 
                'quantity', order_items.quantity, 
                'profit', (order_items.price - (order_items.quantity * products.capital)), 
                'shipping', order_items.shipping 
                )) FILTER (WHERE products.id IS NOT NULL), '[]') AS product 
                FROM orders 
                INNER JOIN order_items ON orders.id = order_items.order_id 
                INNER JOIN users ON orders.user_id = users.id 
                INNER JOIN products ON order_items.product_id = products.id 
                INNER JOIN addresses ON users.id = addresses.user_id 
                GROUP BY orders.id, users.id, addresses.id`
            )
        } else {
            data = await client.query(
                `SELECT orders.*, users.*, addresses.*, 
                users.name AS user_name, 
                COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', products.id, 
                'name', products.name, 
                'price', order_items.price, 
                'quantity', order_items.quantity, 
                'shipping', order_items.shipping 
                )) FILTER (WHERE products.id IS NOT NULL), '[]') AS product
                FROM orders 
                INNER JOIN order_items ON orders.id = order_items.order_id 
                INNER JOIN users ON orders.user_id = users.id 
                INNER JOIN products ON order_items.product_id = products.id 
                INNER JOIN addresses ON users.id = addresses.user_id WHERE orders.user_id = $1 
                GROUP BY orders.id, users.id, addresses.id`,
                [user_id]
            )
        }

        const rawData = data.rows;

        const orders = rawData?.map(order => ({
            id: order.id,
            transaction_id: order.transaction_id,
            transaction_status: order.transaction_status,
            status_order: order.status_order,
            resi: order.resi,
            user: {
                user_id: order.user_id,
                name: order.user_name,
                email: order.email,
                phone: order.phone
            },
            products: order.product, 
            gross_amount: Number(order.total_price),
            address: {
                province: order.province_name,
                city: order.city_name,
                district: order.district_name,
                village: order.village_name,
                detail: order.detail
            },
            create_date: order.created_at
        }))

        res.status(200).json({ message: "Data retrieve succesfully", result: orders })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

export default router;