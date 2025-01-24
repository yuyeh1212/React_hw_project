import { useState, useEffect } from "react";
import axios from "axios";
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
              <td>{product.isEnabled ? "啟用" : "未啟用"}</td>
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
    username: "herry861212@gmail.com",
    password: "a22447887",
  });
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "",
    origin_price: 0,
    price: 0,
    unit: "",
    description: "",
    content: "",
    is_enabled: 0,
    imageUrl: "",
    imagesUrl: [],
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (Object.keys(newProduct).includes(name)) {
      // 更新 newProduct 狀態
      setNewProduct({
        ...newProduct,
        [name]: value,
      });
    } else if (Object.keys(account).includes(name)) {
      // 更新 account 狀態（針對登入）
      setAccount({
        ...account,
        [name]: value,
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/v2/admin/signin`, account);
      const { token, expired } = res.data;

      // 設置過期時間為 5 分鐘
      const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 當前時間 + 5 分鐘
      document.cookie = `hexToken=${token}; expires=${new Date(
        expirationTime
      ).toUTCString()}; path=/; SameSite=None; Secure`;

      // 儲存到本地儲存
      localStorage.setItem("hexToken", token);
      localStorage.setItem("tokenExpiration", expirationTime);

      axios.defaults.headers.common["Authorization"] = token;

      // 獲取產品列表
      const productsRes = await axios.get(
        `${API_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(productsRes.data.products);

      setIsAuth(true);
    } catch (err) {
      alert("登入失敗");
    }
  };

  const handleEditProduct = (product) => {
    alert(`編輯產品：${product.title}`);
    // 在這裡可以彈出編輯表單，或導向編輯頁面。
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

  const handleAddProduct = () => {
    setShowModal(true); // 開啟 Modal
  };

  const handleSubmitProduct = () => {
    const token = localStorage.getItem("hexToken") || getCookie("hexToken");

    if (!token) {
      alert("Token 無效，請先登入！");
      return;
    }

    const payload = {
      data: {
        ...newProduct,
        origin_price: Number(newProduct.origin_price), // 強制轉換為數字
        price: Number(newProduct.price), // 強制轉換為數字
      },
    };

    axios
      .post(`${API_URL}/v2/api/${API_PATH}/admin/product`, payload, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log("產品儲存成功:", response.data);
        alert("產品儲存成功！");
        setShowModal(false);
      })
      .catch((error) => {
        console.error("儲存失敗:", error.response?.data || error.message);
        alert(`儲存失敗: ${error.response?.data?.message || error.message}`);
      });
  };

  const fetchProducts = () => {
    const token = localStorage.getItem("hexToken") || getCookie("hexToken");

    if (!token) {
      alert("Token 無效，請先登入！");
      return;
    }

    axios
      .get(`${API_URL}/v2/api/${API_PATH}/admin/products`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setProducts(response.data.products); // 更新產品列表狀態
      })
      .catch((error) => {
        console.error(
          "獲取產品列表失敗:",
          error.response?.data || error.message
        );
        alert(
          `獲取產品列表失敗: ${error.response?.data?.message || error.message}`
        );
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
                onEdit={(product) => alert(`編輯產品：${product.title}`)}
                onDelete={(productId) => alert(`刪除產品 ID：${productId}`)}
                onAddProduct={handleAddProduct}
              />
            </div>
          </div>
          {/* Modal 彈出視窗 */}
          {showModal && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">新增產品</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">產品名稱</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={newProduct.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">分類</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={newProduct.category}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">原價</label>
                      <input
                        type="number"
                        className="form-control"
                        name="origin_price"
                        value={newProduct.origin_price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">售價</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={newProduct.price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">單位</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={newProduct.unit}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">描述</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">內容</label>
                      <textarea
                        className="form-control"
                        name="content"
                        value={newProduct.content}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">主要圖片 URL</label>
                      <input
                        type="text"
                        className="form-control"
                        name="imageUrl"
                        value={newProduct.imageUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmitProduct}
                    >
                      新增
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
