import { Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PromoCarousel() {
  const navigate = useNavigate();

  return (
    <section className="container my-5">
      <Carousel
        interval={3000}
        className="rounded-5 overflow-hidden shadow-sm"
      >
        <Carousel.Item
          onClick={() => navigate("/medicines")}
          style={{ cursor: "pointer" }}
        >
          <img
            src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/carousel3_opmipx.webp"
            className="d-block w-100"
            alt="Medicines"
          />
        </Carousel.Item>

        <Carousel.Item
          onClick={() => navigate("/categories")}
          style={{ cursor: "pointer" }}
        >
          <img
            src="https://res.cloudinary.com/dorv3lswe/image/upload/v1775886926/carousel2_lzkoxn.webp"
            className="d-block w-100"
            alt="Categories"
          />
        </Carousel.Item>
      </Carousel>
    </section>
  );
}