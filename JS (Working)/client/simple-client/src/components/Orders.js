import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const nickname = localStorage.getItem('nickname');

  const fetchOrders = (buyer) => {
    axios
      .get(`http://localhost:3001/api/orders?buyer=${buyer}`)
      .then((response) => setOrders(response.data))
      .catch((error) => console.error('Error fetching orders:', error));
  };

  useEffect(() => {
    if (nickname) {
      fetchOrders(nickname);
    }
  }, [nickname]);

  if (!nickname) {
    return <>Nie jesteś zalogowany, <Link to="/">powróć do strony głównej</Link></>;
  }
  
  return (
    <div>
      <h2>Poprzednie zamówienia</h2>
      <Link to="/">Powróć do Strony Głównej</Link>
      <ul>
        {orders.length > 0 ? (
          orders.map((order) => {
            const parsedItems = JSON.parse(order.items);
            const total = order.total || 0;

            return (
              <li key={order.id}>
                <h3>Zamówienie nr: {order.id}</h3>
                <ul>
                  {parsedItems.map((item) => (
                    <li key={item.name}>
                      {item.name} - Ilość {item.quantity} - Cena: {item.price}
                    </li>
                  ))}
                </ul>
                <p>Calkowita wartosc zamowienia: {total.toFixed(2)}</p>
              </li>
            );
          })
        ) : (
          <p>Nie masz żadnych zamówień</p>
        )}
      </ul>
    </div>
  );
};
