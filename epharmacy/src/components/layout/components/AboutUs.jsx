import "../css/AboutUs.css";

export default function AboutUs() {
  return (
    <div className="about-container">
      <h2 className="fw-bold mb-4">About Us</h2>

      <p>
        Welcome to <strong>EPHARMACY</strong>, your trusted online healthcare
        partner. We aim to make medicines  accessible,
        affordable, and convenient for everyone.
      </p>

      <p>
        Our platform allows you to browse medicines, explore categories,
        and order medicines from the comfort of your home.
      </p>

      <h5 className="mt-4">Our Mission</h5>
      <p>
        To provide reliable pharmaceutical services with safety,
        transparency, and customer satisfaction as our top priority.
      </p>

      <h5 className="mt-4">Why Choose Us?</h5>
      <ul>
        <li> Trusted & verified medicines</li>
        <li> Easy online ordering</li>
        <li> Secure payment system</li>
        <li> Fast delivery</li>
      </ul>
    </div>
  );
}