import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalCheckout = ({ amount, currency }) => {
  
  const paypalOptions = {
    "client-id": "BAAyx1ha025RcHTNYyMJwsx0YoB4-Gz6metHJV8XVMVCxD5OHpTen1wzhmqNOanP3XrXwxmcH42MU-i8vY",
    currency: currency || "USD", 
    intent: "capture",
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toString(), 
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      const name = details.payer.name.given_name;
      alert(`¡Pago completado con éxito por ${name}!`);
      console.log("Detalles de la transacción:", details);
      
    });
  };

  const onError = (err) => {
    console.error("Error en el pago de PayPal:", err);
    alert("Hubo un error al procesar el pago. Por favor, intenta de nuevo.");
  };

  return (
    <div className="paypal-button-wrapper" style={{ marginTop: "20px" }}>
      <PayPalScriptProvider options={paypalOptions}>
        <PayPalButtons
          style={{ 
            layout: "vertical", 
            color: "gold", 
            shape: "rect", 
            label: "pay" 
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCheckout;