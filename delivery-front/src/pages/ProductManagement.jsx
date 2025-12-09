
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from '../contexts/CartContext'
import { storage } from "../firebase/firebaseConfig";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";


const categoryImages = {
  pizza: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png",
  burger: "https://cdn-icons-png.flaticon.com/512/3082/3082031.png",
  drink: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
  dessert: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  default: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
};

export default function ProductManagement() {
  
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const restaurantId = user?.restaurantId;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("pizza");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [adminTargetRestaurantId, setAdminTargetRestaurantId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); 
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  


  const fetchProducts = async () => {
    setLoading(true);

    let url = "";

    if (isAdmin) {
      
      url = "/products";
    } else if (restaurantId) {
      
      url = "/products/me";
    } else {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      
      const res = await api.get(url); 
      setProducts(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);


  useEffect(() => {
    if (!imageFile) return setPreviewUrl("");
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  
  useEffect(() => {
    if (!editImageFile) return setEditPreviewUrl(currentProduct?.imageUrl || categoryImages.default);
    const url = URL.createObjectURL(editImageFile);
    setEditPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [editImageFile, currentProduct]);
  


  const uploadFileToFirebase = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);

      const filename = `${Date.now()}_${file.name}`;
      const fileRef = storageRef(storage, `products/${filename}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      setUploading(true);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          setUploading(false);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(downloadURL);
        }
      );
    });
  };
  

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    let finalImageUrl = "";

    if (imageFile) finalImageUrl = await uploadFileToFirebase(imageFile);
    else if (imageUrlInput) finalImageUrl = imageUrlInput.trim();
    else finalImageUrl = categoryImages[category];

    const baseData = {
      name,
      description,
      price: Number(price),
      category,
      imageUrl: finalImageUrl,
    };

    let finalData = baseData;
    if (isAdmin) {
      if (!adminTargetRestaurantId) {
        alert(
          "Como Administrador, você deve fornecer o ID do Restaurante Alvo."
        );
        return;
      }
      finalData = { ...baseData, restaurantId: adminTargetRestaurantId };
    }

    try {
      const res = await api.post("/products", finalData);

      setProducts((prev) => [res.data.data, ...prev]);

      
      setName("");
      setPrice("");
      setDescription("");
      setCategory("pizza");
      setImageFile(null);
      setImageUrlInput("");
      setPreviewUrl("");
      setAdminTargetRestaurantId("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Erro ao criar produto:", errorMessage);
      alert(`Falha ao criar produto. Verifique o console: ${errorMessage}`);
    }
  };

  
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditDescription(product.description);
    setEditCategory(product.category);
    setEditImageUrlInput(product.imageUrl);
    setEditPreviewUrl(product.imageUrl || categoryImages[product.category] || categoryImages.default);
    setEditImageFile(null); 
    setIsEditing(true);
  };

  
  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!currentProduct) return;

    let finalImageUrl = currentProduct.imageUrl;

    try {
      
      if (editImageFile) {
        finalImageUrl = await uploadFileToFirebase(editImageFile);
      } else if (editImageUrlInput) {
        finalImageUrl = editImageUrlInput.trim();
      } else {
        finalImageUrl = categoryImages[editCategory]; 
      }

      
      const updateData = {
        name: editName,
        description: editDescription,
        price: Number(editPrice),
        category: editCategory,
        imageUrl: finalImageUrl,
      };

      
      const res = await api.put(`/products/${currentProduct._id}`, updateData);

      
      setProducts((prev) =>
        prev.map((p) => (p._id === currentProduct._id ? res.data.data : p))
      );

      alert("Produto atualizado com sucesso!");
      setIsEditing(false);
      setCurrentProduct(null);

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Erro ao atualizar produto:", errorMessage);
      alert(`Falha ao atualizar produto: ${errorMessage}`);
    }
  };


  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto? Esta ação é irreversível.")) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      
      
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      alert("Produto deletado com sucesso!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Erro ao deletar produto:", errorMessage);
      alert(`Falha ao deletar produto. Verifique o console: ${errorMessage}`);
    }
  };

  
  const EditProductModal = () => {
    if (!isEditing || !currentProduct) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl transform transition-all duration-300 scale-100">
          <h2 className="text-2xl font-bold text-purple-700 mb-6 border-b pb-2">
            Editar Produto: {currentProduct.name}
          </h2>

          <form onSubmit={handleUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">Nome</label>
              <input
                className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            {}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
            </div>

            {}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">Categoria</label>
              <select
                className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <option value="pizza">🍕 Pizza</option>
                <option value="burger">🍔 Hambúrguer</option>
                <option value="drink">🥤 Bebida</option>
                <option value="dessert">🍰 Sobremesa</option>
              </select>
            </div>
            
            {}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">URL da imagem</label>
              <input
                className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Cole uma URL de imagem"
                value={editImageUrlInput}
                onChange={(e) => setEditImageUrlInput(e.target.value)}
              />
            </div>

            {}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-medium text-gray-700">Descrição</label>
              <textarea
                rows="2"
                className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </div>

            {}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {}
              <div className="flex flex-col gap-1">
                <label className="font-medium text-gray-700">Nova Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  className="p-2 border border-purple-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  onChange={(e) => setEditImageFile(e.target.files[0])}
                />
              </div>

              {}
              <div className="flex flex-col items-center justify-center gap-1 border border-dashed border-gray-300 p-2 rounded-xl">
                <label className="font-medium text-gray-700">
                  Pré-visualização
                </label>
                <img
                  src={editPreviewUrl}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                  alt="Pré-visualização do produto"
                />
              </div>

              {}
              <div className="flex flex-col justify-end h-full pt-6 md:pt-0 gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full px-6 py-3 rounded-xl text-white font-semibold 
                  bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Enviando..." : "Salvar Alterações"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };
 

  return (
    
    <div className="p-4 md:p-8 space-y-10 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
        Gerenciar Produtos 🍕
      </h1>

      {}
      <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 border border-purple-200">
        <h2 className="text-2xl font-semibold text-purple-700 mb-6">
          Criar Novo Produto
        </h2>

        <form
          onSubmit={handleCreateProduct}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {}
          {isAdmin && (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-medium text-red-600">
                ID do Restaurante Alvo (Apenas Admin)
              </label>
              <input
                className="p-3 border border-red-400 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-red-50/50"
                placeholder="Cole o ID do restaurante aqui (Ex: 60a1b2c3d4e5f67890123456)"
                value={adminTargetRestaurantId}
                onChange={(e) => setAdminTargetRestaurantId(e.target.value)}
                required
              />
            </div>
          )}

          {}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-purple-700">Nome</label>
            <input
              className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ex: Pizza Calabresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-purple-700">Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ex: 35.90"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-purple-700">Categoria</label>
            <select
              className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="pizza">🍕 Pizza</option>
              <option value="burger">🍔 Hambúrguer</option>
              <option value="drink">🥤 Bebida</option>
              <option value="dessert">🍰 Sobremesa</option>
            </select>
          </div>

          {}
          <div className="flex flex-col gap-1">
            <label className="font-medium text-purple-700">
              URL da imagem (opcional)
            </label>
            <input
              className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Cole uma URL de imagem"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
            />
          </div>

          {}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-medium text-purple-700">Descrição</label>
            <textarea
              rows="3"
              className="p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ex: Frango, molho, milho, mussarela, catupiry e orégano"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-purple-700">
                Enviar imagem
              </label>
              <input
                type="file"
                accept="image/*"
                className="p-2 border border-purple-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>

            {}
            <div className="flex flex-col items-center justify-center gap-1 border border-dashed border-gray-300 p-2 rounded-xl">
              <label className="font-medium text-purple-700">
                Pré-visualização
              </label>
              <img
                src={previewUrl || imageUrlInput || categoryImages[category]}
                className="w-24 h-24 object-cover rounded-lg shadow-md"
                alt="Pré-visualização do produto"
              />
            </div>

            {}
            <div className="flex flex-col justify-end h-full pt-6 md:pt-0">
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-6 py-3 rounded-xl text-white font-semibold 
                bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Enviando..." : "Criar Produto"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <hr className="border-purple-300/50" />

      {}
      <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 border border-purple-200">
        <h2 className="text-2xl font-semibold text-purple-700 mb-6">
          Produtos Cadastrados
        </h2>
        {loading ? (
          <p className="text-gray-600 italic">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">
            Nenhum produto cadastrado para gerenciamento.
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">
                    {isAdmin ? "Restaurante" : "Ações"}
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-purple-50 transition duration-150"
                  >
                    {}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-3">
                      <img
                        src={product.imageUrl || categoryImages.default}
                        alt={product.name}
                        
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                      />
                      {product.name}
                    </td>
                    {}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </td>
                    {}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    {}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isAdmin && product.restaurant?.name ? (
                        <span className="text-purple-600 font-medium">
                          {product.restaurant.name}
                        </span>
                      ) : (
                        <div className="flex space-x-2">
                          {}
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-500 hover:text-blue-700 transition duration-150 p-1 rounded-full hover:bg-blue-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.536a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z"
                              />
                            </svg>
                          </button>
                          {}
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-500 hover:text-red-700 transition duration-150 p-1 rounded-full hover:bg-red-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.86 11.14A2 2 0 0116.14 20H7.86a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6m-4-6h.01M3 6h18"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      
      <EditProductModal />
    </div>
  );
}