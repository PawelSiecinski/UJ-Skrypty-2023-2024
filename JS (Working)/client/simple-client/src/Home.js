import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemsList from "./components/ItemsList";
import CategoriesList from "./components/CategoriesList";
import AddToBasketForm from "./components/AddToBasketForm";
import Basket from "./components/Basket";
import Nickname from "./components/Nickname";
import { Link } from "react-router-dom";

function Home() {
  const [nickname, setNickname] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [basket, setBasket] = useState([]);
  const [addItemForm, setAddItemForm] = useState({
    itemId: "",
    quantity: 1,
  });

  const fetchBasketItems = () => {
    axios
      .get("http://localhost:3001/api/basket/items", {
        params: { buyer: nickname },
      })
      .then((response) => setBasket(response.data))
      .catch((error) =>
        console.error("Error fetching items from the basket:", error)
      );
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));

    axios
      .get("http://localhost:3001/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));

    if (nickname) {
      fetchBasketItems();
    }
    // eslint-disable-next-line
  }, [nickname]);

  const handleAddToBasket = (itemId, quantity) => {
    console.log(itemId,quantity)
    axios
      .post("http://localhost:3001/api/basket/add", {
        itemId,
        quantity,
        buyer: nickname,
      })
      .then((response) => {
        fetchBasketItems();
        setBasket([...basket, response.data.item]);
      })
      .catch((error) =>
        console.error("Error adding item to the basket:", error)
      );
  };

  const handleCheckout = () => {
    console.log(nickname)
    const total = basket.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
    );

    const items = basket.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
    }));

    axios
        .post("http://localhost:3001/api/basket/checkout", {
            buyer: nickname,
            total: total.toFixed(2),
            items: items,
        })
        .then((response) => {
            alert(response.data.message);
            setBasket([]);
        })
        .catch((error) => console.error("Error completing checkout:", error));
};

  const handleRemoveFromBasket = (itemId) => {
    axios
      .delete(`http://localhost:3001/api/basket/remove/${itemId}`)
      .then((response) => {
        console.log(response.data.message);
        fetchBasketItems();
      })
      .catch((error) =>
        console.error("Error removing item from the basket:", error)
      );
  };

  const handleAddItemFormChange = (event) => {
    const { name, value } = event.target;
    setAddItemForm({
      ...addItemForm,
      [name]: value,
    });
  };

  const handleAddItemToBasket = () => {
    const { itemId, quantity } = addItemForm;
    console.log(addItemForm)
    if (itemId && quantity > 0) {
      handleAddToBasket(itemId, quantity);
      setAddItemForm({
        itemId: "",
        quantity: 1,
      });
    }
  };

  const handleNicknameChange = (newNickname) => {
    setNickname(newNickname);
  };

  return (
    <div>
      <i style={{fontSize: '0.75rem'}}>Wiele rzeczy bym zrobil inaczej, jednakze czas goni :D</i>
      <h1>Sklep</h1>
      <h5>Kazdy uzytkownik ma wlasny koszyk i historie zamowien</h5>
      <Nickname onNicknameChange={handleNicknameChange} />
      {nickname && (
        <div>
          <h2>Poprzednie zamowienia</h2>
          <Link to="/orders">Przejdź do poprzednich zamówień</Link>
          <ItemsList items={items}/>
          <CategoriesList categories={categories} />
          <AddToBasketForm
            addItemForm={addItemForm}
            items={items}
            handleAddItemFormChange={handleAddItemFormChange}
            handleAddItemToBasket={handleAddItemToBasket}
          />
          <Basket
            basket={basket}
            handleRemoveFromBasket={handleRemoveFromBasket}
            handleCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  );
}

export default Home;
