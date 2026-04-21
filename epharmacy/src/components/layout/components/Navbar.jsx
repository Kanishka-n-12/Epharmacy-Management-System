import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCategories } from "../../../features/categories/slices/categorySlice";
import { useRef } from "react";
import "../css/Navbar.css";

export default function Navbar() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navRef = useRef();



 
  const currentCat = (searchParams.get("cat") || "").toLowerCase();
  const onMedicines = location.pathname === "/medicines";
  useEffect(() => {
  const active = navRef.current?.querySelector(".nav-active");
  active?.scrollIntoView({ inline: "center", behavior: "smooth" });
}, [currentCat, onMedicines]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  function handleClick(cat) {
    if (cat === "medicines") {
      navigate("/medicines");
    } else {
      navigate(`/categories?cat=${cat}`);
    }
  }

  function isActive(cat) {
    if (cat === "medicines") return onMedicines;
    return currentCat === cat;
  }

   
  function toSlug(name) {
    return (name || "").toLowerCase().replace(/\s+/g, "-");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-nav sticky-top shadow-sm">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavComp"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNavComp">
          <ul ref={navRef} className="navbar-nav gap-3 text-uppercase">

            
            {categories?.map((cat) => {
  const name = cat.name || "Unknown";
  const slug = cat.slug || toSlug(name);

  return (
    <li key={cat.id} className="nav-item">
      <span
        className={`nav-link${isActive(slug) ? " nav-active" : ""}`}
        style={{ fontWeight: 700, cursor: "pointer" }}
        onClick={() => handleClick(slug)}
      >
        {name}
      </span>
    </li>
  );
})}

           
            <li className="nav-item">
              <span
                className={`nav-link${onMedicines ? " nav-active" : ""}`}
                style={{ fontWeight: 700, cursor: "pointer" }}
                onClick={() => handleClick("medicines")}
              >
                Medicines
              </span>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}