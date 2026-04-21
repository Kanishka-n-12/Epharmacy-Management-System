// features/profile/components/ProfilePhotoUpload.jsx
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfilePhoto } from "../slice/profileSlice";
import "../css/ProfilePhotoUpload.css";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dorv3lswe/image/upload/v1775886924/account_eavxvn.png";

export default function ProfilePhotoUpload() {
  const dispatch = useDispatch();
  const { profile } = useSelector((s) => s.profile);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Convert to base64 / object URL for preview, then dispatch
    const reader = new FileReader();
    reader.onload = (ev) => {
      // For a real backend you'd upload to Cloudinary/S3 first.
      // Here we dispatch the base64 string as the imageUrl.
      dispatch(updateProfilePhoto(ev.target.result));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="photo-upload-wrap">
      <div
        className="photo-circle"
        onClick={() => inputRef.current?.click()}
        title="Click to change photo"
      >
        <img
          src={profile?.imageUrl || DEFAULT_AVATAR}
          alt="Profile"
          id="profilePhoto"
        />
        <div className="photo-overlay">📷</div>
      </div>

      <button
        type="button"
        className="btn-upload"
        onClick={() => inputRef.current?.click()}
      >
        UPLOAD
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}