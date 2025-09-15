import React from "react";
import Layout from "../layout/Layout";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useUpdateUserMutation } from "../../api/request/Users";
import { useLoadUserMutation } from "../../api/request/Auth";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Address from "./Address";

const UserDash = () => {
  const { user } = useSelector((state) => state.auth);
  const [updateUser, { data, isLoading, isSuccess, error, reset }] = useUpdateUserMutation();
  const [loadUser] = useLoadUserMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
    province_id: "",
    province: "",
    city_id: "",
    city: "",
    district_id: "",
    district: "",
    village_id: "",
    village: "",
    detail: "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      oldPassword: "",
      newPassword: "",
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
  }, [user])

  const updateProfile = (e) => {
    e.preventDefault();
    const data = formData;

    updateUser(data);
  }

  useEffect(() => {
    if(isSuccess) {
      toast.success(data?.message || "Update Berhasil")
      reset();

      setFormData({
        name: "",
        email: "",
        phone: "",
        oldPassword: "",
        newPassword: "",
      })

      loadUser();
    }

    if(error) {
      toast.error(error?.data?.message || "Terjadi Kesalahan")
      reset();
    }
  }, [isSuccess, error, data])

  return (
    <Layout username={user?.name}>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom bg-white border p-2 rounded shadow">
        <h1 className="h2">Dashboard</h1>
      </div>

      <div className="bg-white p-4 border shadow rounded orverflow-auto">
        <div className="row">
          <div className="col-lg-6 col-12">
            <form className="d-flex flex-column gap-3 mb-4">
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Username"
                className="form-control"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <input
                type="email"
                name="Email"
                id="email"
                placeholder="Email"
                className="form-control"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <input
                type="number"
                name="phone"
                id="phone"
                placeholder="No Whatsapp"
                className="form-control"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <input
                type="password"
                name="oldPassword"
                id="oldPassword"
                placeholder="Password Lama"
                className="form-control"
                value={formData.oldPassword || ""}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              />

              <input
                type="password"
                name="newPassword"
                id="newPassword"
                placeholder="Password Baru"
                className="form-control"
                value={formData.newPassword || ""}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />

              <div className="text-end">
                <button className="btn btn-success" onClick={updateProfile} disabled={isLoading}>Update</button>
              </div>
            </form>
          </div>
          <div className="col-lg-6 col-12">
            <Address user={user}/>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDash;
