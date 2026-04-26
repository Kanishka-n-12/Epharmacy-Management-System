import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { fetchCategories } from "../../../features/categories/slices/categoryThunks";
import "../css/Navbar.css";

export default function Navbar() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.categories);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navRef = useRef();
  const wrapRef = useRef();

  const currentCat = (searchParams.get("cat") || "").toLowerCase();
  const onMedicines = location.pathname === "/medicines";

  useEffect(() => {
    const wrap = wrapRef.current;
    const active = navRef.current?.querySelector(".nav-active");
    if (!wrap || !active) return;

    const wrapLeft = wrap.getBoundingClientRect().left;
    const activeLeft = active.getBoundingClientRect().left;
    const offset =
      activeLeft - wrapLeft - wrap.clientWidth / 2 + active.offsetWidth / 2;

    wrap.scrollBy({ left: offset, behavior: "smooth" });
  }, [currentCat, onMedicines]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  function scrollNav(dir) {
    wrapRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  }

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
    <nav className="navbar navbar-dark custom-nav sticky-top shadow-sm">
      <div className="nav-scroll-wrapper">
        <button className="nav-scroll-btn" onClick={() => scrollNav(-1)}>
          &#8249;
        </button>

        <div ref={wrapRef} className="navbar-nav-wrap">
          <ul ref={navRef} className="navbar-nav text-uppercase">
            {categories?.map((cat) => {
              const name = cat.name || "Unknown";
              const slug = cat.slug || toSlug(name);
              return (
                <li key={cat.id} className="nav-item">
                  <span
                    className={`nav-link${isActive(slug) ? " nav-active" : ""}`}
                    style={{ cursor: "pointer" }}
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
                style={{ cursor: "pointer" }}
                onClick={() => handleClick("medicines")}
              >
                Medicines
              </span>
            </li>
          </ul>
        </div>

        <button className="nav-scroll-btn" onClick={() => scrollNav(1)}>
          &#8250;
        </button>
      </div>
    </nav>
  );
}