export default function Loading() {
  return (
    <div className="global-loading-overlay">
      <div className="spinner-container">
        <div className="spinner"></div>
        <div className="spinner-inner"></div>
      </div>
      <div className="loading-text">Yükleniyor...</div>
    </div>
  );
}
