import React, { useEffect, useState } from "react";
import { useGetCityQuery, useGetDistrictQuery, useGetProvincesQuery, useGetVillageQuery, useUpdateAddressMutation } from "../../api/request/Address";
import { toast } from "react-toastify";
import { useLoadUserMutation } from "../../api/request/Auth";

const Address = ({ user }) => {
    const [formData, setFormData] = useState({
        id: "",
        province_id: "",
        province: "",
        city_id: "",
        city: "",
        district_id: "",
        district: "",
        village_id: "",
        village: "",
        detail: "",
    })

    useEffect(() => {
        if (user) {
            setFormData({
                id: user?.address?.id || "",
                province_id: user?.address?.province_id || "",
                province: user?.address?.province_name || "",
                city_id: user?.address?.city_id || "",
                city: user?.address?.city_name || "",
                district_id: user?.address?.district_id || "",
                district: user?.address?.district_name || "",
                village_id: user?.address?.village_id || "",
                village: user?.address?.village_name || "",
                detail: user?.address?.detail || "",
            })
        }
    }, [user])

    const { data: provinces } = useGetProvincesQuery();
    const { data: cities } = useGetCityQuery(formData.province_id, { skip: !formData.province_id });
    const { data: district } = useGetDistrictQuery(formData.city_id, { skip: !formData.city_id })
    const { data: villages } = useGetVillageQuery(formData.district_id, { skip: !formData.district_id })

    const [updateAddress, { data, isSuccess, isLoading, error, reset }] = useUpdateAddressMutation()
    const [loadUser] = useLoadUserMutation();

    const handleChange = (e, list, idKey, nameKey) => {
        try {
            e.preventDefault();
            const { name, value } = e.target
            const selectedItem = list?.find(item => item[idKey] == value)

            setFormData((prev) => ({
                ...prev,
                [name]: value,
                [name.replace("_id", "")]: selectedItem ? selectedItem[nameKey] : ""
            }))

        } catch (error) {
            console.log(error)
        }
    }

    const handleUpdate = (e) => {
        e.preventDefault();
        updateAddress(formData)
    }

    useEffect(() => {
        if (isSuccess) {
            toast.success('Berhasil update alamat!')
            reset()

            setFormData({
                id: "",
                province_id: "",
                province: "",
                city_id: "",
                city: "",
                district_id: "",
                district: "",
                village_id: "",
                village: "",
                detail: "",
            })

            loadUser()
        }

        if (error) {
            toast.error('Gagal update alamat!')
            reset()
        }
    }, [isSuccess, error, data])

    return (
        <form className="d-flex flex-column gap-3">
            <select name="province_id" 
            id="province" 
            className="form-select" 
            value={formData.province_id || ""} 
            onChange={(e) => handleChange(e, provinces, "id", "name")}>
                <option value="">Select Province...</option>
                {
                    provinces?.map((item, index) => {
                        return (
                            <option key={index} value={item.id}>{item.name}</option>
                        )
                    })
                }
            </select>

            <select name="city_id" 
            id="city" 
            className="form-select" 
            value={formData.city_id || ""} 
            onChange={(e) => handleChange(e, cities, "id", "name")}>
                <option value="" hidden>
                    Select City...
                </option>
                {
                    cities?.map((item, index) => {
                        return (
                            <option key={index} value={item.id}>{item.name}</option>
                        )
                    })
                }
            </select>

            <select name="district_id" 
            id="district" 
            className="form-select" 
            value={formData.district_id || ""} 
            onChange={(e) => handleChange(e, district, "id", "name")}>
                <option value="" hidden>
                    Select District...
                </option>
                {
                    district?.map((item, index) => {
                        return (
                            <option key={index} value={item.id}>{item.name}</option>
                        )
                    })
                }
            </select>

            <select name="village_id" 
            id="village" 
            className="form-select" 
            value={formData.village_id || ""} 
            onChange={(e) => handleChange(e, villages, "id", "name")}>
                <option value="" hidden>
                    Select Village...
                </option>
                {
                    villages?.map((item, index) => {
                        return (
                            <option key={index} value={item.id}>{item.name}</option>
                        )
                    })
                }
            </select>

            <textarea
            name="address"
            id="address"
            className="form-control"
            placeholder="Alamat Lengkap"
            rows={4}
            value={formData.detail || ""} 
            onChange={(e) => setFormData({...formData, detail: e.target.value})}
            ></textarea>

            <div className="text-end">
                <button className="btn btn-success" onClick={handleUpdate} disabled={isLoading}>Update</button>
            </div>
        </form>
    )
}

export default Address;