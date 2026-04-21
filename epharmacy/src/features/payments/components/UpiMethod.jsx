// import { useState } from "react";
// import "../css/PaymentMethods.css"

// const UPI_APPS = [
//   { id: "PhonePe", label: "PhonePe", color: "#6739B7" },
//   { id: "Paytm",   label: "Paytm",   color: "#00BAF2" },
//   { id: "GPay",    label: "Google Pay", color: "#4285F4" },
// ];

// export default function UpiMethod({ onSelect }) {
//   const [selected, setSelected] = useState(null);

//   const pick = (id) => { setSelected(id); onSelect(id); };

//   return (
//     <div className="method-list">
//       {UPI_APPS.map(({ id, label }) => (
//         <div
//           key={id}
//           className={`method-item ${selected === id ? "selected" : ""}`}
//           onClick={() => pick(id)}
//         >
//           <span className="method-name">{label}</span>
//           <span className={`method-radio ${selected === id ? "checked" : ""}`}>
//             {selected === id ? "●" : ""}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }