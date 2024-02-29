import React from 'react';

const AddToBasketForm = ({
  addItemForm,
  items,
  handleAddItemFormChange,
  handleAddItemToBasket,
}) => (
  <div>
    <h2>Dodaj rzeczy do koszyka</h2>
    <form>
      <label>
        Przedmiot:
        <select name="itemId" value={addItemForm.itemId} onChange={handleAddItemFormChange}>
          <option value="">Wybierz przedmiot</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Ilość:
        <input
          type="number"
          name="quantity"
          value={addItemForm.quantity}
          onChange={handleAddItemFormChange}
        />
      </label>
      <br />
      <button type="button" onClick={handleAddItemToBasket}>
        Dodaj do koszyka
      </button>
    </form>
  </div>
);

export default AddToBasketForm;
