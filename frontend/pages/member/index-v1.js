import React, { useState } from "react";
import { createRoot, flushSync } from "react-dom";

// const ITEMS = [
//   {
//     title: "Bank Transfer",
//     subtitle: "Transfer money to bank account",
//     icon: <i class="fa-solid fa-building-columns"></i>
//   },
//   {
//     title: "Debit/Credit Card",
//     subtitle: "Send money from your card",
//     icon: <i class="fa-solid fa-credit-card"></i>
//   },
//   {
//     title: "Wallet",
//     subtitle: "Transfer money from your wallet",
//     icon: <i class="fa-solid fa-wallet"></i>
//   }
// ];

// const Card = ({ title, icon, onCancel, id, children }) => {
//   return (
//     <div className="card" id={id}>
//       <div className="card-title-row">
//         {icon && <div className="card-icon">{icon}</div>}
//         <div className="card-title">{title}</div>
//         {onCancel && (
//           <div className="close-btn" onClick={onCancel}>
//             <i class="fa-solid fa-x"></i>
//           </div>
//         )}
//       </div>
//       <div className="card-body">{children}</div>
//     </div>
//   );
// };

// const SelectionCard = ({ onSelect }) => {
//   return (
//     <Card title="Send Money">
//       <div className="selection">
//         {ITEMS.map((item) => (
//           <div className="item" key={item.title} onClick={() => onSelect(item)}>
//             <div className="item-icon">{item.icon}</div>
//             <div className="item-title">{item.title}</div>
//             <div className="item-subtitle">{item.subtitle}</div>
//           </div>
//         ))}
//       </div>
//     </Card>
//   );
// };

// const BankTransferCard = ({ onCancel }) => {
//   const { title, icon } = ITEMS[0];

//   return (
//     <Card title={title} icon={icon} id="bank-transfer" onCancel={onCancel}>
//       <form>
//         <div className="form-item">
//           <label htmlFor="fullname">Full Name</label>
//           <input id="fullname" />
//         </div>
//         <div className="form-item">
//           <label htmlFor="account-number">Account Number</label>
//           <input id="account-number" />
//         </div>
//         <div className="form-item">
//           <label htmlFor="bank-code">Bank Code</label>
//           <input id="bank-code" />
//         </div>
//         <button className="btn">Proceed</button>
//       </form>
//     </Card>
//   );
// };

// const DebitCard = ({ onCancel }) => {
//   const { title, icon } = ITEMS[1];

//   return (
//     <Card title={title} icon={icon} id="debit-card" onCancel={onCancel}>
//       <div className="row">
//         <div className="avaliable-cards">Avaliable Cards</div>
//         <button className="add-card-btn">
//           <i class="fa-solid fa-plus"></i>
//           Add Card
//         </button>
//       </div>
//       <div className="debit-card-radio-group">
//         <div className="debit-card-radio">
//           <input
//             type="radio"
//             id="debit-card-1"
//             name="debit-card"
//             value="debit-card-1"
//             checked
//           />
//           <label for="debit-card-1" className="row">
//             **** 6448
//             <i class="fa-brands fa-cc-visa"></i>
//           </label>
//         </div>

//         <div className="debit-card-radio">
//           <input
//             type="radio"
//             id="debit-card-2"
//             name="debit-card"
//             value="debit-card-2"
//           />
//           <label for="debit-card-2" className="row">
//             **** 1234
//             <i class="fa-brands fa-cc-mastercard"></i>
//           </label>
//         </div>
//       </div>
//       <button className="btn">Proceed</button>
//     </Card>
//   );
// };

// const Wallet = ({ onCancel }) => {
//   const { title, icon } = ITEMS[2];

//   return (
//     <Card id="wallet-card" title={title} icon={icon} onCancel={onCancel}>
//       <form>
//         <div className="form-item">
//           <label>Wallet Balance</label>
//           <div className="wallet-balance">$123,213</div>
//         </div>
//         <div className="form-item">
//           <label htmlFor="amount">Amount</label>
//           <input id="amount" type="number" />
//         </div>

//         <button className="btn">Proceed</button>
//       </form>
//     </Card>
//   );
// };

// const App = () => {
//   const [selectedItem, setSelectedItem] = useState(null);

//   const handleSelectItem = (item) => {
//     document.startViewTransition(() => {
//       flushSync(() => {
//         setSelectedItem(item);
//       });
//     });
//   };

//   const handleUnselect = () => {
//     document.startViewTransition(() => {
//       flushSync(() => {
//         setSelectedItem(null);
//       });
//     });
//   };

//   let card;

//   switch (selectedItem?.title) {
//     case "Bank Transfer":
//       card = <BankTransferCard onCancel={handleUnselect} />;
//       break;
//     case "Debit/Credit Card":
//       card = <DebitCard onCancel={handleUnselect} />;
//       break;
//     case "Wallet":
//       card = <Wallet onCancel={handleUnselect} />;
//       break;
//     default:
//       card = <SelectionCard onSelect={handleSelectItem} />;
//   }

//   return <>{card}</>;
// };

// const rootElement = document.getElementById("root");
// const root = createRoot(rootElement);
// root.render(<App />);