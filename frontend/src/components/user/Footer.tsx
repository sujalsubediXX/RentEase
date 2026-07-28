import { Link } from "react-router-dom";
const AMBER = "#d4922a";
import API_BASE_URL from "../../config/api";
import axios from "axios";
import { useEffect, useState } from "react";
const socialIcons: string[] = ["𝕏", "in", "f", "📸"];

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}
export const Footer = () => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
              try {
            const response = await axios.get(`${API_BASE_URL}/api/category/getcategory`);
            setCategories(response.data);
          } catch (error) {
            console.error("Error fetching categories:", error);
          } 
        };
    
        fetchCategories();
      }, []);
  return (

    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-[5vw]">
      <div className="max-w-300 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-14 mb-12">
          <div>
            <div className="font-display text-[26px] font-medium tracking-wide text-gray-900 mb-3.5">
              Rent<span style={{ color: AMBER }}>Ease</span>
            </div>
            <p className="text-[13.5px] text-gray-400 leading-[1.7] max-w-70">
              The marketplace where you can rent or list almost anything — safely, affordably, and conveniently.
            </p>
            <div className="flex gap-2.5 mt-5">
              {socialIcons.map((s, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[14px] text-gray-400 no-underline hover:border-amber-300 hover:text-amber-500 transition-all duration-200">
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>

            <h4 className="text-[12px] text-amber-500 tracking-widest uppercase mb-4 font-medium">Explore</h4>
            <ul className="list-none space-y-2.5">

              <li >
                <Link to="/categories" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">Browse Category</Link>
              </li>
              {
                categories.map((category) => (
                  <li key={category._id}>
                    <Link to={`/categories/${category._id}`} className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200"> {category.name}</Link>
                    </li>
                ))
              }

            </ul>
          </div>
          <div>

            <h4 className="text-[12px] text-amber-500 tracking-widest uppercase mb-4 font-medium">Company</h4>
            <ul className="list-none space-y-2.5">

              <li >
                <Link to="/about" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">About Us</Link>
              </li>
              <li >
                <Link to="/categories" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">Categories</Link>
              </li>
              <li >
                <Link to="/how-it-works" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">How It Works</Link>
              </li>

            </ul>
          </div>
          <div>

            <h4 className="text-[12px] text-amber-500 tracking-widest uppercase mb-4 font-medium">Support</h4>
            <ul className="list-none space-y-2.5">

              <li >
                <Link to="/contact" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">Contact Us</Link>
              </li>


            </ul>
          </div>
          {/* {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] text-amber-500 tracking-widest uppercase mb-4 font-medium">{col.title}</h4>
                <ul className="list-none space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-[13.5px] text-gray-400 no-underline hover:text-gray-600 transition-colors duration-200">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))} */}
        </div>
        <div className="flex items-center justify-center pt-6 border-t border-gray-100 gap-4">
          <p className="text-[12.5px] text-gray-400">© {new Date().getFullYear()} RentEase Pvt. Ltd. All rights reserved.</p>

        </div>
      </div>
    </footer>
  )
}
