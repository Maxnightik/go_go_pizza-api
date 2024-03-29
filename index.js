import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'node:fs/promises';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/img', express.static('img'));

const loadData = async () => {
  try {
    const data = await readFile('db.json');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

app.get('/api/products', async (req, res) => {
  try {
    const data = await loadData();
    const { toppings } = req.query;
    const selectedToppings = toppings ? toppings.split(',') : [];
    const filteredProducts = selectedToppings.length > 0 ?
      data.pizzas.filter(product =>
        selectedToppings.every(topping =>
          Object.values(product.toppings).some(toppingList =>
            toppingList.includes(topping)
          )
        )
      ) :
      data.pizzas;

    const productsWithImages = filteredProducts.map(product => {
      const images = product.img.map(img => `https://${req.get('host')}/${img}`);
      const { img, ...productWithoutImg } = product;
      return { ...productWithoutImg, images };
    });

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load products data' });
  }
});

// Решта маршрутів

app.post('/api/orders', async (req, res) => {
  // Код створення замовлення
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
