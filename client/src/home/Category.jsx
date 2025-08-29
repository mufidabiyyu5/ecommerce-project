import React from "react";

const Category = ({ id, name, icon, setCategoryId }) => {
  const handleCategory = (id) => {
    setCategoryId(id)
  }

  return (
    <div className="d-flex gap-2 p-2 rounded bg-white border pointer" onClick={() => handleCategory(id)}>
      {/* <div>{icon}</div> */}
      <p className="m-0">{name}</p>
    </div>
  );
};

export default Category;
