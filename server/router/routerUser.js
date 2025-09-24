import express from "express";
import { client } from "../config/connection.js";
import bcrypt, { hash } from 'bcrypt';
import jwt from "jsonwebtoken";
import { authorize } from "../middleware/Authorize.js";

const router = express.Router();
const saltRounds = 10;

router.post('/register', async (req, res) => {
    try {
        const { name, password, email, phone, level } = req.body;

        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                res.status(500).json({ message: err.message })
            } else {
                const data = await client.query(
                    `INSERT INTO users (name, email, phone, password, level) VALUES ($1, $2, $3, $4, $5) RETURNING *`, 
                    [name, email, phone, hash, level]
                )

                const user = data.rows[0]
                res.status(201).json({ message: "Sign Up successfully", user })
            }
        })
    } catch (error) {  
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post('/sign-in', async (req, res) => {
    try {
        const { email, password } = req.body;

        const data = await client.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (data) {
            const user = data.rows[0];

            bcrypt.compare(password, user.password, async (err, result) => {
                if (err) {
                    res.status(500).json({ message: err.message })
                }

                if(result){
                    const token = jwt.sign({ id: user.id, level: user.level }, process.env.privateKey, { expiresIn: '7d' })
                    res.cookie("token", token, { httpOnly: true, secure: process.env.ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 });
                    res.status(200).json({ message: "Sign In successfully", user })
                } else {
                    res.status(404).json({ message: "Wrong password!" })
                }
            })
        } else {
            res.status(404).json({ message: "User not found!" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/get-user', authorize('admin'), async (req, res) => {
    try {
        const data = await client.query(
            `SELECT * FROM users`
        )

        res.status(200).json({ message: "Get Data Successfully", result: data.rows })        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get('/load-user', authorize('user', 'admin'), async (req, res) => {
    try {
        const data = await client.query(
            `SELECT users.id, users.name, users.email, users.phone, users.level, 
            jsonb_build_object(
            'id', addresses.id, 
            'province_id', addresses.province_id, 
            'province_name', addresses.province_name, 
            'city_id', addresses.city_id, 
            'city_name', addresses.city_name, 
            'district_id', addresses.district_id, 
            'district_name', addresses.district_name, 
            'village_id', addresses.village_id, 
            'village_name', addresses.village_name, 
            'detail', addresses.detail
            ) AS address
            FROM users 
            LEFT JOIN addresses ON users.id = addresses.user_id 
            WHERE users.id = $1`,
            [req.user.id]
        )

        const user = data.rows[0]

        res.status(200).json({ message: "Get Data Successfully", result: data.rows[0] })        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete('/delete/:id', authorize('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        await client.query("DELETE FROM users WHERE id = $1", [id]);

        res.status(200).json({ message: "Data Deleted Successfully" })        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put('/update', authorize('user'), async (req, res) => {
    try {
        const { name, email, phone, oldPassword, newPassword } = req.body;

        if (newPassword && oldPassword) {
            console.log('test');
            const data = await client.query(
                `SELECT * FROM users WHERE id = $1`,
                [req.user.id]
            )

            const user = data.rows[0]

            bcrypt.compare(oldPassword, user.password, async (err, result) => {
                if (err) {
                    res.status(500).json({ message: err.message })
                }
                
                if(result) {
                    bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
                        if (err) {
                            res.status(500).json({ message: err.message })
                        } else {
                            const updateData = await client.query(
                                `UPDATE users SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5 RETURNING *`,
                                [name, email, phone, hash, req.user.id]
                            )

                            res.status(200).json({ message: "Data updated successfully", result: updateData.rows[0] })
                        }
                    })
                }
            })
        } else {
            const updateData = await client.query(
                `UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *`,
                [name, email, phone, req.user.id]
            )

            res.status(200).json({ message: "Data updated successfully", result: updateData.rows[0] })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

export default router;