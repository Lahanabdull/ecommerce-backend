import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const API_URL = "https://ecommerce-backend-zxtw.onrender.com";

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  });

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!formData.name) return "Enter your name";
    if (!formData.phone) return "Enter your phone number";
    if (!formData.address1) return "Enter address";
    if (!formData.city) return "Enter city";
    if (!formData.pincode) return "Enter pincode";
    return null;
  };

  // ================= PLACE ORDER =================
  const placeOrder = async () => {

    // 🛑 Cart empty check
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // 🛑 Form validation
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    // 🛑 Razorpay check
    if (!window.Razorpay) {
      alert("Payment system not loaded. Refresh page.");
      return;
    }

    setLoading(true);

    try {
      // 🔥 Wake backend (Render fix)
      await fetch(`${API_URL}/health`);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ================= CREATE ORDER =================
      const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: getTotalPrice()
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.id) {
        alert("Order creation failed");
        setLoading(false);
        return;
      }

      // ================= RAZORPAY OPTIONS =================
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY, // 🔁 replace if needed

        amount: orderData.amount,
        currency: "INR",
        name: "M&L Store",
        description: "Order Payment",
        order_id: orderData.id,

        handler: function (response) {
          console.log("PAYMENT SUCCESS:", response);

          setLoading(false); // Stop loading spinner

          // Navigate immediately to success page
          navigate("/order-success", {
            state: {
              total: getTotalPrice(),
              paymentId: response.razorpay_payment_id
            }
          });

          // Verify payment in background
          fetch(`${API_URL}/api/payment/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user: formData,
              items: cartItems,
              total: getTotalPrice(),
              userId: currentUser.uid
            })
          })
          .then(response => response.json())
          .then(data => {
            console.log("VERIFY RESULT:", data);
            if (data.success) {
              console.log("✅ PAYMENT + ORDER SAVED");
              clearCart(); // Clear cart after successful verification
            } else {
              console.error("Payment verification failed in background");
              // Optionally, you could show a notification or update the success page
            }
          })
          .catch(err => {
            console.error("VERIFY ERROR:", err);
            // Optionally, handle error
          });
        },

        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },

        theme: {
          color: "#000"
        }
      };

      const rzp = new window.Razorpay(options);

      // ================= PAYMENT FAILED =================
      rzp.on("payment.failed", function (response) {
        console.log("PAYMENT FAILED:", response);
        setLoading(false);
        alert(response.error.description || "Payment Failed");
      });

      rzp.open();

    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      setLoading(false);
      alert("Something went wrong");
    }
  };

  return (
    <div className="checkout-container">

      <Navbar />

      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-content">

        {/* ================= FORM ================= */}
        <div className="checkout-form">
          <h2>Delivery Information</h2>

          <input name="name" placeholder="Full Name" onChange={handleChange} />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} />
          <input name="email" placeholder="Email Address" onChange={handleChange} />
          <input name="address1" placeholder="Address Line 1" onChange={handleChange} />
          <input name="address2" placeholder="Address Line 2" onChange={handleChange} />
          <input name="landmark" placeholder="Landmark" onChange={handleChange} />

          <div className="checkout-row">
            <input name="city" placeholder="City" onChange={handleChange} />
            <input name="state" placeholder="State" onChange={handleChange} />
          </div>

          <input name="pincode" placeholder="PIN Code" onChange={handleChange} />
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div key={item._id} className="summary-item">
              <span>{item.name}</span>
              <span>{item.quantity} × ₹{item.price}</span>
            </div>
          ))}

          <h3>Total: ₹{getTotalPrice()}</h3>

          <button onClick={placeOrder} disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </button>

        </div>

      </div>

      <BottomNav />

    </div>
  );
};

export default Checkout;