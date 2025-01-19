import { useState, useEffect } from "react";
import axios from "axios";
import "./style/login.scss";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;
const API_PATH = `${import.meta.env.VITE_API_PATH}`;

function ProductList({ products, onViewDetails }) {
  return (
    <div>
      <h2>產品列表</h2>
      <table className="table table-hover">
        <thead>
          <tr>
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
              <td>{product.title}</td>
              <td>{product.origin_price}</td>
              <td>{product.price}</td>
              <td>{product.isEnabled ? "啟用" : "未啟用"}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onViewDetails(product)}
                >
                  操作按鈕
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
  const [products, setProducts] = useState([]);

  const checkLogin = async () => {
    try {
      const token = localStorage.getItem("hexToken");
      const tokenExpiration = localStorage.getItem("tokenExpiration");
  
      if (!token || !tokenExpiration) {
        throw new Error("未登入或令牌不存在");
      }
  
      // 檢查是否超過過期時間
      const now = new Date().getTime();
      if (now > parseInt(tokenExpiration, 10)) {
        throw new Error("令牌已過期");
      }
  
      // 繼續檢查登入狀態
      axios.defaults.headers.common["Authorization"] = token;
      await axios.post(`${API_URL}/api/user/check`);
      const res = await axios.get(`${API_URL}/v2/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
      setIsAuth(true);
    } catch (err) {
      console.error("登入檢查失敗或令牌已過期", err);
  
      // 清除過期令牌
      localStorage.removeItem("hexToken");
      localStorage.removeItem("tokenExpiration");
      setIsAuth(false);
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
      checkLogin();
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
    const { value, name } = e.target;

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
      const productsRes = await axios.get(`${API_URL}/v2/api/${API_PATH}/admin/products`);
      setProducts(productsRes.data.products);
  
      setIsAuth(true);
    } catch (err) {
      alert("登入失敗");
    }
  };  

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-12">
              <ProductList
                products={products}
                onViewDetails={(product) => alert(`點擊產品: ${product.title}`)}
              />
            </div>
          </div>
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
