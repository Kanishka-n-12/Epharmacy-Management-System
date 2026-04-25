
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProfile } from "../slice/profileSlice";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileForm from "../components/ProfileForm";
import LoadingState from "../../home/components/LoadingState";
import ErrorState from "../../home/components/ErrorState";
import "../css/MyProfile.css";

export default function MyProfile() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <div className="my-profile-page">

      {/* ── Breadcrumb ── */}
      <div className="profile-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep"> &gt; </span>
          <span className="active">My Profile</span>
        </div>
      </div>

      {/* ── Main ── */}
      <section className="profile-main">
        <div className="container">

          {loading && <LoadingState />}
          {!loading && error && <ErrorState error={error} />}

          {!loading && !error && (
            <div className="profile-layout">
              <aside className="profile-sidebar-col">
                <ProfileSidebar activeLink="profile" />
              </aside>
              <div className="profile-form-col">
                <ProfileForm />
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}