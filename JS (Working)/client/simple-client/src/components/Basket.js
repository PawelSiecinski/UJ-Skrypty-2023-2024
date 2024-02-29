import React from 'react';
import { Button, List } from 'antd';

const Basket = ({ basket, handleRemoveFromBasket, handleCheckout }) => (
  <div>
    <h2>Koszyk</h2>
    <List
      dataSource={basket}
      renderItem={(item) => (
        <List.Item>
          {item.name} - ile: {item.quantity} - Łącznie: {item.price ? `${(item.quantity * item.price).toFixed(2)} PLN ` : 'N/A'}
          <Button onClick={() => handleRemoveFromBasket(item.id)}>Usuń z koszyka</Button>
        </List.Item>
      )}
    />
    {basket.length > 0 ? (
      <div>
        <Button type="primary" onClick={handleCheckout}>Zakup przedmioty</Button>
      </div>
    ) : (
      <p>Koszyk jest pusty</p>
    )}
  </div>
);

export default Basket;
