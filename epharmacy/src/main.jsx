
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/style1.css";

createRoot(document.getElementById("root")).render(
 
    <Provider store={store}>
      <App />
    </Provider>
  
);