import React from 'react';
import { List } from 'antd';

const ItemsList = ({ items }) => (
  <div>
    <h2>Przedmioty</h2>
    <List
      dataSource={items}
      renderItem={(item) => (
        <List.Item>
          {item.name} - {item.category} - Price: {item.price} PLN
        </List.Item>
      )}
    />
  </div>
);

export default ItemsList;
