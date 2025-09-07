import React from "react";
import Desc from "./Desc";
import Images from "./Images";
import Counter from "./Counter";
import Layout from "../components/layout/Layout";
import { useGetProductQuery } from "../api/request/Product";
import { useParams } from "react-router-dom";

const Detail = () => {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProductQuery(id, {skip: !id});

  if (isLoading) {
    return (
      <Layout>
        <div className="container text-center py-5">
          <span>Loading...</span>
        </div>
      </Layout>
    );
  }

  if (error || !product?.result) {
    return (
      <Layout>
        <div className="container text-center py-5">
          <span>Product not found.</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <div className="container">
          <div className="row align-items-start">
            <div className="col-lg-3 col-md-4 col-sm-12 mb-3">
              <Images product={product?.result} />
            </div>
            <div className="col-lg-6 col-md-8 col-sm-12 mb-3">
              <Desc product={product?.result} />
            </div>
            <div className="col-lg-3 col-md-4 col-sm-12">
              <Counter product={product?.result} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Detail;