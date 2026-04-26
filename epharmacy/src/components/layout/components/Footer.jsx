import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../../features/categories/slices/categoryThunks";

export default function Footer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categories = useSelector(
    (state) => state.categories.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  function toSlug(name) {
    return (name || "").toLowerCase().replace(/\s+/g, "-");
  }

  function handleCatClick(cat) {
    if (cat === "medicines") navigate("/medicines");
    else navigate(`/categories?cat=${cat}`);
  }

  return (
    <footer className="footer-bg py-5">
      <div className="container">
        <div className="row text-dark gy-4">

           
          <div className="col-md-3">
            <h6 className="fw-bold mb-3">Our Services</h6>
            <ul className="list-unstyled footer-links">
              <li>Order medicines</li>
              <li>Healthcare products</li>
            </ul>
          </div>

          
          <div className="col-md-3">
            <h6 className="fw-bold mb-3">Featured Categories</h6>
            <ul className="list-unstyled footer-links">
              {categories?.map((cat) => {
                const name =
                  cat.name ||
                  cat.categoryName ||
                  cat.category_name ||
                  "Unknown";

                const slug = cat.slug || toSlug(name);

                return (
                  <li
                    key={cat.id}
                    onClick={() => handleCatClick(slug)}
                    style={{ cursor: "pointer" }}
                  >
                    {name}
                  </li>
                );
              })}

              <li
                onClick={() => handleCatClick("medicines")}
                style={{ cursor: "pointer" }}
              >
                Medicines
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-md-3">
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled footer-links">
              <li
                onClick={() => navigate("/about")}
                style={{ cursor: "pointer" }}
              >
                About us
              </li>

              <li
                onClick={() => navigate("/privacy")}
                style={{ cursor: "pointer" }}
              >
                Privacy policy
              </li>

              <li
                onClick={() => navigate("/contact")}
                style={{ cursor: "pointer" }}
              >
                Contact us
              </li>
            </ul>

            <p className="mt-4 copyright-text">
              ©Copyright {new Date().getFullYear()} All rights Reserved
            </p>
          </div>

           
<div className="col-md-3 text-md-end">
  <h6 className="fw-bold mb-3">FOLLOW US ON:</h6>
  <div className="social-icons d-flex justify-content-md-end justify-content-center gap-3">

    
    <a href="#" className="social-icon-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </a>

  
    <a href="#" className="social-icon-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    </a>

   
    <a href="#" className="social-icon-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    </a>

   
    <a href="#" className="social-icon-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    </a>

  </div>
</div>

        </div>
      </div>
    </footer>
  );
}