import express from 'express'
import { client } from '../config/connection.js'
import { authorize } from '../middleware/Authorize.js';

const router = express.Router();
const API_KEY = process.env.BINDER_BYTE_KEY

router.get('/get-provinces', authorize('user'), async (req, res) => {
    try {
        const response = await fetch(
            `https://api.binderbyte.com/wilayah/provinsi?api_key=${API_KEY}`
        )

        const data = await response.json();
        res.status(200).json(data.value);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get('/get-cities/:provinceId', authorize('user'), async (req, res) => {
    try {
        const body = { provinceId: 36 }
        const response = await fetch(
            `https://api.binderbyte.com/wilayah/kabupaten?api_key=${API_KEY}&id_provinsi=${req.params.provinceId}`
        )

        const data = await response.json()
        res.status(200).json(data.value);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get('/get-district/:cityId', authorize('user'), async (req, res) => {
    try {
        const body = { cityId: 3672 }
        const response = await fetch(
            `https://api.binderbyte.com/wilayah/kecamatan?api_key=${API_KEY}&id_kabupaten=${req.params.cityId}`
        )

        const data = await response.json()
        res.status(200).json(data.value)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get('/get-village/:districtId', authorize('user'), async (req, res) => {
    try {
        const body = { disrictId: 367201 }
        const response = await fetch(
            `https://api.binderbyte.com/wilayah/kelurahan?api_key=${API_KEY}&id_kecamatan=${req.params.disrictId}`
        )

        const data = await response.json()
        res.status(200).json(data.value)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post('/add', authorize('user'), async (req, res) => {
    try {
        const {  
            id,
            provinceId, 
            provinceName, 
            cityId, 
            cityName, 
            districtId, 
            districtName, 
            villageId,
            villageName, 
            detail
        } = req.body

        if (id) {
            const data = await client.query(
                `UPDATE adresses SET province_id = $1, province_name = $2, city_id = $3, city_name = $4, district_id = $5, district_name = $6, village_id = $7, village_name = $8, detail = $9 WHERE id = $10 RETURNING *`,
                [provinceId, provinceName, cityId, cityName, districtId, districtName, villageId, villageName, detail, id]
            )
            res.status(201).json({ message: "Address updated succesfully", result: data.rows[0] })
        } else {
            const data = await client.query(
                `INSERT INTO addresses (user_id, province_id, province_name, city_id, city_name, district_id, district_name, village_id, village_name, detail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [req.user.id, provinceId, provinceName, cityId, cityName, districtId, districtName, villageId, villageName, detail]
            )
            res.status(201).json({ message: "Address added succesfully", result: data.rows[0] })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

export default router