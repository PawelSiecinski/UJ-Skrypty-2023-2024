import React from 'react';
import { List } from 'antd';

const CategoriesList = ({ categories }) => (
  <div>
    <h2>Kategorie</h2>
    <List
      dataSource={categories}
      renderItem={(category) => (
        <List.Item>{category}</List.Item>
      )}
    />
  </div>
);

export default CategoriesList;
