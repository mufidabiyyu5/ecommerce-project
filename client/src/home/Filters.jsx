import React from "react";

const Filters = ({ setLimit }) => {

  const handleLimit = (e) => {
    setLimit(parseInt(e.target.value))
  }

  return (
    <div className="d-flex gap-4">
      <select name="price" id="sort" className="form-select pointer">
        <option value="" hidden>
          --Urutkan--
        </option>
        <option value="lowest">Terendah</option>
        <option value="lowest">Tertinggi</option>
        <option value="lowest">Terbaru</option>
        <option value="lowest">Terlaris</option>
      </select>

      <select name="price" id="sort" className="form-select pointer" onChange={(e) => handleLimit(e)}>
        <option value="" hidden>
          --Tampilkan Produk--
        </option>
        <option value="14">14</option>
        <option value="28">28</option>
        <option value="42">42</option>
      </select>
    </div>
  );
};

export default Filters;
