import '../css/PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <h2 className="fw-bold mb-4">Privacy Policy</h2>
      <p><strong>Last updated:</strong> January 2026</p>

      <p>
        At <strong>EPHARMACY</strong>, we are committed to protecting
        your personal information and privacy.
      </p>

      <h5 className="mt-4">1. Information We Collect</h5>
      <ul>
        <li>Name, email, phone number</li>
        <li>Order history</li>
        <li>Prescription uploads</li>
      </ul>

      <h5 className="mt-4">2. How We Use Your Information</h5>
      <ul>
        <li>Order processing</li>
        <li>Customer support</li>
        <li>Platform improvement</li>
      </ul>

      <h5 className="mt-4">3. Data Security</h5>
      <p>
        We use secure servers and encryption technologies
        to protect your personal data.
      </p>

      <h5 className="mt-4">4. Contact Us</h5>
      <p>Email: support@epharmacy.in</p>
    </div>
  );
}