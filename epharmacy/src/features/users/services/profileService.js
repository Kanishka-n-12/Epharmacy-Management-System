// features/profile/services/profileService.js
import api from "../../../api";

const profileService = {
  /** GET /users/profile */
  getProfile: () => api.get("/users/profile").then((r) => r.data),

  /** PUT /users/profile */
  updateProfile: (data) =>
    api
      .put("/users/profile", {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
      })
      .then((r) => r.data),

  /** PUT /users/profile/photo */
  updatePhoto: (imageUrl) =>
    api
      .put("/users/profile/photo", null, { params: { imageUrl } })
      .then((r) => r.data),
};

export default profileService;