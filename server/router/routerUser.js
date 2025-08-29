import express from "express";
import { client } from "../config/connection.js";
import bcrypt from 'bcrypt';
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
                    res.cookie("token", token, { httpOnly: true });
                    res.status(200).json({ message: "Sign In successfully" })
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
            `SELECT * FROM users WHERE id = $1`,
            [req.user.id]
        )

        res.status(200).json({ message: "Get Data Successfully", result: data.rows })        
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

export default router;