import { useState } from "react";

export default function HeroBanner({ onSearch }) {
  const [query, setQuery] = useState("");

  function handleSearch() {
    onSearch?.(query);
  }

  return (
    <section className="container mt-4">
      <div className="hero-wrapper position-relative overflow-hidden rounded-5 shadow-sm">
        <img src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886927/banner_xj7z8y.png"
          alt="Banner"
          className="w-100 banner-img"
        />
        <div className="banner-overlay">
          <div className="container text-center">
            <h2 className="text-white fw-bold mb-4 banner-heading">
              BUY MEDICINES AND ESSENTIALS
            </h2>
            <div className="search-box-container mx-auto">
              <div className="input-group shadow-lg rounded-pill overflow-hidden bg-white p-1">
                <input
                  type="text"
                  className="form-control border-0 py-3"
                  placeholder="Search for medicines/general products"
                  value={query}
                  autoComplete="off"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onSearch?.(e.target.value);   
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <button
                  className="btn px-4 border-0 rounded-pill ms-2 bg-primary-green text-white fw-bold"
                  onClick={handleSearch}
                >
                  SEARCH
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}