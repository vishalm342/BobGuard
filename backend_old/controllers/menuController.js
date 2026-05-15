const prisma = require('../prismaClient');

const getMenu = async (req, res) => {
  try {
    const menu = await prisma.product.findMany();
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        imageUrl
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

module.exports = {
  getMenu,
  addMenuItem
};
