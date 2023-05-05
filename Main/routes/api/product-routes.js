const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

router.get('/', async (req, res) => { // get all products
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => { // get a single product by its id
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => { // create a new product
  try {
    const product = await Product.create(req.body); // create the product record
    if (req.body.tagIds.length) { // create any product tag associations
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => { // update a product
  try {
    const productData = await Product.update(req.body, {
      where: { id: req.params.id },
    });
    if (!productData[0]) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }
    // remove all existing product tag associations
    await ProductTag.destroy({
      where: { product_id: req.params.id },
    });
    if (req.body.tagIds && req.body.tagIds.length) { // create any new product tag associations
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: parseInt(req.params.id),
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }
    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => { // delete a product by its id
  try {
    const productData = await Product.destroy({
      where: { id: req.params.id },
    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
