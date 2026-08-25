function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-item">
        <i className="bi bi-truck"></i>

        <div>
          <strong>FREE SHIPPING</strong>
          <span>On orders over $75</span>
        </div>
      </div>

      <div className="top-item">
        <i className="bi bi-tag"></i>

        <div>
          <strong>EXTRA 10% OFF</strong>
          <span>On prepaid orders</span>
        </div>
      </div>

      <a href="#!" className="browser-link">
        View in Browser
      </a>
    </div>
  );
}

export default TopBar;