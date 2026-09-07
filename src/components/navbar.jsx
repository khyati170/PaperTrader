function Navbar() {
  return (
    <nav className="bar">
      <div className="logo">
        <a href="/">Paper Trader</a>
      </div>
      <div className="links">
        <a href="/">Home</a>
        <a href="#">Market</a>
        <a href="#">Portfolio</a>
        <a href="#">WatchList</a>
      </div>
    </nav>
  );
}

export default Navbar;