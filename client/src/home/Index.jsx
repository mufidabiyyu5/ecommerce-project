import React, { Fragment, useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { categories, products } from "../Data";
import Category from "./Category";
import Filters from "./Filters";
import Product from "./Product";
import Footer from "../components/footer/Footer";
import { useGetProductsQuery } from "../api/request/Product";
import { useGetCategoriesQuery } from "../api/request/Category";

const Index = () => {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(14)
  const [categoryId, setCategoryId] = useState("")

  const {data: products, isLoading: isLoadingProducts} = useGetProductsQuery({search, page, limit, categoryId})
  const {data: category, isLoading: isLoadingCategories} = useGetCategoriesQuery()

  return (
    <div className="bg-light">
      <Navbar setSearch={setSearch} />
      <div
        className="container-fluid d-flex flex-column gap-2"
        style={{ paddingTop: 80, minHeight: "100vh" }}
      >
        <div className="container overflow-auto d-flex gap-3 p-1">
          <button className="btn btn-secondary" onClick={() => setCategoryId("")}>Reset</button>
          {category?.result.map((category, index) => (
            <Category key={index} id={category.id} name={category.name} setCategoryId={setCategoryId} />
          ))}
        </div>
        <div className="container overflow-auto">
          <Filters setLimit={setLimit} />
        </div>
        <div
          className={`container overflow-auto d-flex flex-wrap gap-1 justify-content-center p-2`}
        >
          {products?.result.map((product, index) => (
            <Product key={index} product={product} />
          ))}
        </div>
      </div>

      <Footer categories={category?.result} />
    </div>
  );
};

export default Index;
