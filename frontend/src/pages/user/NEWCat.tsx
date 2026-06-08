import  { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ImageSlider } from "./ImageSlider";
import { ProductSkeleton } from "./ProductSkeleton";
import API_BASE_URL from "../../config/api";
import { useParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  rentalPrice: number;
  images: string[];
  location: string;
}

const NEWCat = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const { categoryId } = useParams();

  const fetchProducts = async () => {
    if (!hasMore) return;

    setLoading(true);

    const res = await axios.get(
      `${API_BASE_URL}/items/getitems?categoryId=${categoryId}&page=${page}&limit=6`
    );

    const newItems = res.data.items.map((item: any) => ({
      id: item._id,
      name: item.title,
      description: item.description,
      rentalPrice: item.price,
      location: item.location,
      images: item.images.map(
        (img: string) => `http://localhost:3000${img}`
      )
    }));

    setProducts(prev => [...prev, ...newItems]);

    if (page >= res.data.totalPages) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  // reset on category change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [categoryId]);

  const lastRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mt-12">
      
      {products.map((p, i) => {
        if (i === products.length - 1) {
          return (
            <div ref={lastRef} key={p.images[0]}>
              <div className="border rounded-xl p-3">
                <ImageSlider images={p.images} />
                <h2 className="font-bold mt-2">{p.name}</h2>
                <p className="text-sm">{p.description}</p>
                <p className="text-blue-600">Rs {p.rentalPrice}/day</p>
              </div>
            </div>
          );
        }
      

        return (
          <div key={p.id} className="border rounded-xl p-3">
            <ImageSlider images={p.images} />
            <h2 className="font-bold mt-2">{p.name}</h2>
            <p className="text-sm">{p.description}</p>
            <p className="text-blue-600">Rs {p.rentalPrice}/day</p>
          </div>
        );
      })}

      {loading &&
        Array(6)
          .fill(0)
          .map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  );
};

export default NEWCat;