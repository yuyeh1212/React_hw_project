import { useState, useEffect } from "react";
import axios from "axios";
import ProductModal from "./ProductModal";
import "./style/login.scss";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;
const API_PATH = `${import.meta.env.VITE_API_PATH}`;

function ProductList({ products, onEdit, onDelete, onAddProduct }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>產品列表</h2>
        <button className="btn btn-success" onClick={onAddProduct}>
          新增產品
        </button>
      </div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>分類</th>
            <th>產品名稱</th>
            <th>原價</th>
            <th>售價</th>
            <th>是否啟用</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.category}</td>
              <td>{product.title}</td>
              <td>{product.origin_price}</td>
              <td>{product.price}</td>
              <td>
                {product.is_enabled ? (
                  <span className="text-success">啟用</span>
                ) : (
                  <span className="text-danger">未啟用</span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => onEdit(product)}
                >
                  編輯
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => onDelete(product.id)}
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });
  const [products, setProducts] = useState([]); // 產品列表
  const [modalProduct, setModalProduct] = useState(null); // 當前正在新增或編輯的產品
  const handleAddProduct = () => {
    setModalProduct({
      title: "",
      category: "",
      origin_price: 0,
      price: 0,
      unit: "",
      description: "",
      content: "",
      is_enabled: 0,
      imageUrl: "",
      imagesUrls: [],
    });
  };

  const checkLogin = async () => {
    try {
      const token = localStorage.getItem("hexToken");
      const tokenExpiration = localStorage.getItem("tokenExpiration");

      if (!token || !tokenExpiration) {
        throw new Error("未登入或令牌不存在");
      }

      const now = new Date().getTime();
      if (now > parseInt(tokenExpiration, 10)) {
        throw new Error("令牌已過期");
      }

      // 驗證登入狀態
      await axios.post(`${API_URL}/api/user/check`);
      setIsAuth(true);
      return true;
    } catch (err) {
      console.error("登入檢查失敗或令牌已過期", err);

      // 清除過期令牌
      localStorage.removeItem("hexToken");
      localStorage.removeItem("tokenExpiration");
      setIsAuth(false);
      return false;
    }
  };

  useEffect(() => {
    // 獲取 token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    if (token) {
      // 設置 axios 預設的 Authorization
      axios.defaults.headers.common["Authorization"] = token;

      // 自動檢查登入狀態
      checkLogin().then((isLoggedIn) => {
        if (isLoggedIn) {
          // 成功登入後載入產品列表
          fetchProducts();
        }
      });
    }

    // 檢查 token 過期
    const tokenExpiration = localStorage.getItem("tokenExpiration");
    const now = new Date().getTime();

    if (tokenExpiration) {
      const expirationTime = parseInt(tokenExpiration, 10);
      const timeLeft = expirationTime - now;

      if (timeLeft > 0) {
        // 設置定時器到期檢查
        const timer = setTimeout(() => {
          alert("您的登入已過期，請重新登入");
          localStorage.removeItem("hexToken");
          localStorage.removeItem("tokenExpiration");
          setIsAuth(false);
        }, timeLeft);

        // 清理定時器
        return () => clearTimeout(timer);
      } else {
        // 已過期，立即處理
        alert("您的登入已過期，請重新登入");
        localStorage.removeItem("hexToken");
        localStorage.removeItem("tokenExpiration");
        setIsAuth(false);
      }
    }
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/v2/admin/signin`, account);
      const { token, expired } = res.data;

      // 設置過期時間
      const expirationTime = new Date().getTime() + 5 * 60 * 1000;
      document.cookie = `hexToken=${token}; expires=${new Date(
        expirationTime
      ).toUTCString()}; path=/; SameSite=None; Secure`;

      // 儲存到本地
      localStorage.setItem("hexToken", token);
      localStorage.setItem("tokenExpiration", expirationTime);

      axios.defaults.headers.common["Authorization"] = token;

      // 獲取產品列表
      await fetchProducts();

      setIsAuth(true);
    } catch (err) {
      alert("登入失敗");
    }
  };

  const handleEditProduct = (product) => {
    setModalProduct(product);
  };

  const handleSubmitProduct = async () => {
    const token = localStorage.getItem("hexToken");

    if (!token) {
      alert("Token 無效，請先登入！");
      return;
    }

    const payload = {
      data: { ...modalProduct },
    };

    try {
      if (modalProduct.id) {
        // 編輯產品
        await axios.put(
          `${API_URL}/v2/api/${API_PATH}/admin/product/${modalProduct.id}`,
          payload,
          {
            headers: { Authorization: token },
          }
        );
        alert("產品更新成功！");
      } else {
        // 新增產品
        await axios.post(
          `${API_URL}/v2/api/${API_PATH}/admin/product`,
          payload,
          {
            headers: { Authorization: token },
          }
        );
        alert("產品新增成功！");
      }

      // 清空 Modal 狀態
      setModalProduct(null);

      // 重新載入產品列表
      await fetchProducts();
    } catch (err) {
      alert(`操作失敗: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("確定要刪除此產品嗎？")) {
      try {
        await axios.delete(
          `${API_URL}/v2/api/${API_PATH}/admin/product/${productId}`
        );
        setProducts(products.filter((product) => product.id !== productId));
        alert("刪除成功");
      } catch (err) {
        console.error("刪除產品失敗", err);
        alert("刪除失敗，請稍後再試");
      }
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem("hexToken");

    if (!token) {
      alert("Token 無效，請先登入！");
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/v2/api/${API_PATH}/admin/products`,
        {
          headers: { Authorization: token },
        }
      );
      setProducts(res.data.products || []); // 更新產品列表
    } catch (err) {
      console.error("載入產品列表失敗:", err.response?.data || err.message);
      alert("載入產品列表失敗，請稍後再試");
    }
  };

  const handleSubmitEdit = () => {
    const token = localStorage.getItem("hexToken") || getCookie("hexToken");

    if (!token) {
      alert("Token 無效，請先登入！");
      return;
    }

    const payload = {
      data: { ...currentProduct },
    };

    axios
      .put(
        `${API_URL}/v2/api/${API_PATH}/admin/product/${currentProduct.id}`,
        payload,
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then(() => {
        alert("產品更新成功！");
        setShowEditModal(false);

        // 重新獲取產品列表
        fetchProducts();
      })
      .catch((error) => {
        console.error("更新失敗:", error.response?.data || error.message);
        alert(`更新失敗: ${error.response?.data?.message || error.message}`);
      });
  };

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-12">
              <ProductList
                products={products}
                onEdit={handleEditProduct} // 編輯按鈕
                onDelete={handleDeleteProduct} // 刪除按鈕
                onAddProduct={handleAddProduct} // 新增按鈕
              />
            </div>
          </div>

          {/* 渲染共用的 Modal */}
          {modalProduct && (
            <ProductModal
              product={modalProduct}
              isEditMode={!!modalProduct?.id}
              onClose={() => {
                setModalProduct(null); // 清空 modalProduct
              }}
              onInputChange={(e) => {
                const { name, value } = e.target;
                setModalProduct((prev) => ({
                  ...prev,
                  [name]:
                    name === "origin_price" || name === "price"
                      ? Number(value)
                      : value, // 確保數字類型
                }));
              }}
              onSubmit={async () => {
                await handleSubmitProduct(); // 提交後更新產品
                await fetchProducts(); // 確保主列表即時更新
              }}
            />
          )}
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <h1 className="mb-4">會員登入</h1>
            <form onSubmit={handleLogin}>
              <div className="form-floating mb-3">
                <input
                  name="username"
                  value={account.username}
                  onChange={handleInputChange}
                  type="email"
                  className="form-control"
                  id="username"
                  placeholder="name@example.com"
                />
                <label htmlFor="username">請輸入email</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  name="password"
                  value={account.password}
                  onChange={handleInputChange}
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                />
                <label htmlFor="password">請輸入密碼</label>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                登入
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
