import { useState, useEffect } from "react";
import axios from "axios";
import "./style/login.scss";

const API_URL = `${import.meta.env.VITE_BASE_URL}`;
const API_PATH = `${import.meta.env.VITE_API_PATH}`;

function ProductList({ products, onViewDetails, checkLogin }) {
  return (
    <div>
      <button onClick={checkLogin} type="button" className="btn btn-primary">
        確認是否登入
      </button>
      <h2>產品列表</h2>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>產品名稱</th>
            <th>原價</th>
            <th>售價</th>
            <th>是否啟用</th>
            <th>查看細節</th>
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
                  查看細節
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductDetails({ product }) {
  return product ? (
    <div>
      <h2>單一產品細節</h2>
      <div className="card mb-3 shadow">
        <img
          src={product.imageUrl}
          className="card-img-top primary-image"
          alt="主圖"
        />
        <div className="card-body">
          <h5 className="card-title d-flex align-items-center">
            {product.title}
            <span className="badge bg-info ms-2">{product.category}</span>
          </h5>
          <p className="card-text">商品描述：{product.description}</p>
          <p className="card-text">商品內容：{product.content}</p>
          <p className="card-text text-danger">
            售價：{product.price} 元 / {product.unit}
          </p>
          <h5 className="mt-3">更多圖片：</h5>
          <div className="d-flex flex-wrap">
            {product.imagesUrls.map((img, index) => (
              <img
                key={index}
                src={img}
                className="img-thumbnail"
                alt={`圖片 ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p className="text-secondary">請選擇一個商品查看</p>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  useEffect(() => {
    if (isAuth) {
      axios
        .get(`${API_URL}/v2/api/${API_PATH}/admin/products`)
        .then((res) => {
          setProducts(res.data.products); // 假設 API 回傳資料中有 `products`
        })
        .catch((err) => console.error("取得產品資料失敗", err));
    }
  }, [isAuth]);

  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const hendleLogin = (e) => {
    e.preventDefault();
    axios
      .post(`${API_URL}/v2/admin/signin`, account)
      .then((res) => {
        const { token, expired } = res.data;
        document.cookie = `hexToken=${token}; expires=${new Date(
          expired
        )}; path=/; SameSite=None; Secure`;

        axios.defaults.headers.common["Authorization"] = token;

        axios
          .get(`${API_URL}/v2/api/${API_PATH}/admin/products`)
          .then((res) => {
            setProducts(res.data.products); // 假設 API 回傳資料中有 `products`
          })
          .catch((err) => alert("產品取得失敗"));
        setIsAuth(true);
      })
      .catch((err) => alert("登入失敗"));
  };

  // 修正 checkLogin 函數，確保這個 URL 正確
  const checkLogin = () => {
    axios
      .post(`${API_URL}/api/user/check`)
      .then((res) => alert("已在登入狀態"))
      .catch((err) => console.error("未登入", err));
  };

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              {/* 傳遞 checkLogin 到 ProductList */}
              <ProductList
                products={products}
                onViewDetails={setTempProduct}
                checkLogin={checkLogin}
              />
            </div>
            <div className="col-md-6">
              <ProductDetails product={tempProduct} />
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <h1 className="mb-4">會員登入</h1>
            <form onSubmit={hendleLogin}>
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
