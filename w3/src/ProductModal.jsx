function ProductModal({
  product,
  isEditMode,
  onClose,
  onInputChange,
  onSubmit,
}) {
  if (!product) return null;

  return (
    <div
      id="productModal"
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fs-4">
              {isEditMode ? "編輯產品" : "新增產品"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Modal 內容 */}
            <div className="row g-4">
              {/* 主圖 */}
              <div className="col-md-4">
                <div className="mb-4">
                  <label htmlFor="primary-image" className="form-label">
                    主圖
                  </label>
                  <input
                    name="imageUrl"
                    type="text"
                    className="form-control"
                    placeholder="請輸入主圖連結"
                    value={product.imageUrl}
                    onChange={onInputChange}
                  />
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt="主圖"
                      className="img-fluid mt-2"
                    />
                  )}
                </div>

                {/* 副圖 */}
                <div
                  className="border border-2 border-dashed rounded-3 p-3"
                  style={{ overflowX: "auto", whiteSpace: "nowrap" }}
                >
                  {/* 副標題與按鈕同一行 */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0">副圖</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        const updatedImages = [
                          ...(product.imagesUrls || []),
                          "",
                        ];
                        onInputChange({
                          target: { name: "imagesUrls", value: updatedImages },
                        });
                      }}
                    >
                      新增副圖
                    </button>
                  </div>

                  {/* 副圖區域 */}
                  <div className="d-inline-flex gap-2 align-items-start">
                    {product.imagesUrls?.map((image, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column align-items-center"
                      >
                        <label
                          htmlFor={`imagesUrls-${index}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          id={`imagesUrls-${index}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                          value={image}
                          onChange={(e) => {
                            const updatedImages = [...product.imagesUrls];
                            updatedImages[index] = e.target.value;
                            onInputChange({
                              target: {
                                name: "imagesUrls",
                                value: updatedImages,
                              },
                            });
                          }}
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-thumbnail"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 產品資訊 */}
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">標題</label>
                  <input
                    name="title"
                    type="text"
                    className="form-control"
                    placeholder="請輸入標題"
                    value={product.title}
                    onChange={onInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">分類</label>
                  <input
                    name="category"
                    type="text"
                    className="form-control"
                    placeholder="請輸入分類"
                    value={product.category}
                    onChange={onInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">單位</label>
                  <input
                    name="unit"
                    type="text"
                    className="form-control"
                    placeholder="請輸入單位"
                    value={product.unit}
                    onChange={onInputChange}
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">原價</label>
                    <input
                      name="origin_price"
                      type="number"
                      className="form-control"
                      placeholder="請輸入原價"
                      value={product.origin_price}
                      onChange={onInputChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">售價</label>
                    <input
                      name="price"
                      type="number"
                      className="form-control"
                      placeholder="請輸入售價"
                      value={product.price}
                      onChange={onInputChange}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">產品描述</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="請輸入產品描述"
                    value={product.description}
                    onChange={onInputChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">說明內容</label>
                  <textarea
                    name="content"
                    className="form-control"
                    rows="3"
                    placeholder="請輸入說明內容"
                    value={product.content}
                    onChange={onInputChange}
                  ></textarea>
                </div>
                <div className="form-check mb-3">
                  <input
                    name="is_enabled"
                    type="checkbox"
                    className="form-check-input"
                    id="isEnabled"
                    checked={!!product.is_enabled} // 確保轉換為布林值
                    onChange={(e) =>
                      onInputChange({
                        target: {
                          name: "is_enabled",
                          value: e.target.checked ? 1 : 0,
                        },
                      })
                    }
                  />
                  <label className="form-check-label" htmlFor="isEnabled">
                    是否啟用
                  </label>

                  {/* 動態顯示狀態文字 */}
                  <div
                    className={`mt-2 fw-bold ${
                      product.is_enabled ? "text-success" : "text-danger"
                    }`}
                  >
                    {product.is_enabled ? "啟用" : "未啟用"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top bg-light">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
            >
              {isEditMode ? "儲存" : "新增"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
