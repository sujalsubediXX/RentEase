import React, { useEffect, useState } from "react";
import { ConfirmDeleteModal } from "../../components/owner/ConfirmDeleteModal";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  FolderOpen,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}
import API_BASE_URL from "../../config/api";
import { TopBar } from "../../components/owner/TopBar";



const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
     await axios.delete(
        `${API_BASE_URL}/api/category/deletecategory/${categoryToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      }
      );

      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setCategoryToDelete(null);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [image, setImage] = useState<File | null>(null);

  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/category/getcategory`, {
        headers: { Authorization: `Bearer ${token}` },
      }
      );

      setCategories(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
    });

    setImage(null);
    setPreview("");
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

  const addCategory = async () => {
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("description", formData.description);

      if (image) {
        data.append("image", image);
      }

      await axios.post(
        `${API_BASE_URL}/api/category/addcategory`,
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );

      fetchCategories();
      resetForm();
    } catch (error) {
      console.log(error);
    }
  };

  const updateCategory = async () => {
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append(
        "description",
        formData.description
      );

      if (image) {
        data.append("image", image);
      }

      await axios.put(
        `${API_BASE_URL}/api/category/updatecategory/${editingId}`,
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );

      fetchCategories();
      resetForm();
    } catch (error) {
      console.log(error);
    }
  };


  const editCategory = (
    category: Category
  ) => {
    setEditingId(category._id);

    setFormData({
      name: category.name,
      description: category.description,
    });

    setPreview(
      `${API_BASE_URL}/uploads/categories/${category.image}`
    );
  };

  return (
    <main className="bg-gray-100 min-h-screen overflow-y-auto w-full">
      <TopBar title="Category Management" subtitle="  Manage rental categories" />
      <div className=" px-6 pt-4  h-[91vh]">


        <div className="flex gap-6  w-full ">
          {/* FORM */}
          <div className=" w-[32%]">
            <div className="bg-white rounded-3xl p-6  shadow-sm sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <FolderOpen
                    className="text-orange-500"
                    size={22}
                  />
                </div>

                <h2 className="text-xl font-semibold">
                  {editingId
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Category Name
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      })
                    }
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Category Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="w-full border rounded-xl p-3"
                  />
                </div>

                {preview && (
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-48 object-cover rounded-xl border"
                  />
                )}

                {editingId ? (
                  <div className="flex gap-3">
                    <button
                      onClick={
                        updateCategory
                      }
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl flex justify-center items-center gap-2"
                    >
                      <Save size={18} />
                      Update
                    </button>

                    <button
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 py-3 rounded-xl flex justify-center items-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={addCategory}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl flex justify-center items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Category
                  </button>
                )}
              </div>
            </div>
          </div>




          {loading ? (
            <div className="text-center py-20">
              Loading...
            </div>
          ) : (
            <div className="max-h-[87vh] overflow-y-auto w-[68%] ">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(
                  (category, index) => {
                    const colors = [
                      "bg-blue-100",
                      "bg-green-100",
                      "bg-yellow-100",
                      "bg-purple-100",
                      "bg-pink-100",
                    ];

                    return (
                      <div
                        key={category._id}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition"
                      >
                        <div
                          className={`h-40 ${colors[
                            index %
                            colors.length
                          ]
                            }`}
                        >
                          <img
                            src={`${API_BASE_URL}/uploads/categories/${category.image}`}
                            alt={
                              category.name
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="p-5">
                          <h3 className="font-semibold text-lg mb-2">
                            {category.name}
                          </h3>

                          <p className="text-sm text-gray-500 line-clamp-3">
                            {
                              category.description
                            }
                          </p>

                          <div className="flex gap-3 mt-5">
                            <button
                              onClick={() =>
                                editCategory(
                                  category
                                )
                              }
                              className="flex-1 border border-blue-500 text-blue-500 py-2 rounded-xl flex justify-center"
                            >
                              <Edit
                                size={18}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteClick(
                                  category._id
                                )
                              }
                              className="flex-1 border border-red-500 text-red-500 py-2 rounded-xl flex justify-center"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-3xl min-h-75 flex flex-col justify-center items-center">
                  <Plus
                    size={40}
                    className="text-gray-400"
                  />

                  <p className="text-gray-500 mt-4">
                    Add New Category
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        message="This will permanently remove the category and may affect items listed under it. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </main>

  );
};

export default CategoryManagement;