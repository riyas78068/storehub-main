import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../services/productService'

export default function ViewProduct() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id)
      setProduct(response?.data || null)
    } catch (err) {
      setError('Unable to load product details')
      console.error('Product fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/product"
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50"
        >
          ← Back to Products
        </Link>

        {loading ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Loading product details...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : !product ? (
          <div className="rounded-3xl bg-white shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Product not found.</p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
              {product.product_image ? (
                <img
                  src={product.product_image}
                  alt={product.product_name}
                  className="w-full h-full max-h-[560px] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x600?text=No+Image'
                  }}
                />
              ) : (
                <div className="flex h-full min-h-[350px] items-center justify-center bg-gray-100 text-gray-400 text-xl">
                  No product image available
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.24em]">Featured Product</p>
                    <h1 className="mt-3 text-4xl font-bold text-gray-900">{product.product_name}</h1>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-blue-50 p-5">
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">{product.product_brand || 'Unknown'}</p>
                    </div>
                    <div className="rounded-3xl bg-green-50 p-5">
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">{product.product_rating || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-gray-100 p-5">
                    <p className="text-gray-600">Price</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">${product.price}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Details</h2>
                <p className="text-gray-600 leading-relaxed">{product.product_discription || 'No description available for this product.'}</p>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why you’ll love it</h2>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-blue-600">✔</span>
                    <span>High quality and reliable performance.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-blue-600">✔</span>
                    <span>Easy returns and dedicated customer support.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-blue-600">✔</span>
                    <span>Perfect for gifting or treating yourself.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
