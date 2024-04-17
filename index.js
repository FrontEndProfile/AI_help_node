const express = require('express');
const ejs = require('ejs');
const fetch = require('node-fetch');
// const compression = require('compression');  // Import compression



const app = express();
// app.use(compression());  // Add compression middleware
app.set('view engine', 'ejs');

// Register header and footer partials (after app declaration)
app.locals.header = './components/header.ejs';
app.locals.footer = './components/footer.ejs';

// Middleware for fetching product data
async function getProductData(req, res, next) {
    try {
      const response = await fetch('https://firestore.googleapis.com/v1/projects/ng-asmco/databases/(default)/documents/media/');
      const data = await response.json();
      req.products = data.documents.map((doc) => ({
        name: doc.fields.card_name.stringValue,
        imageUrl: doc.fields.media_one_url.stringValue,
        description: doc.fields.description?.stringValue || '',
        // Add other product fields as needed:
        media_base_url: doc.fields.media_base_url?.stringValue || '',
        media_base_alt: doc.fields.media_base_alt?.stringValue || '',
        media_base_name: doc.fields.media_base_name?.stringValue || '',
        // ... (similar for other media fields)
        product_description_editor: doc.fields.product_description_editor?.stringValue || '',
        // ... (similar for other product detail fields)
      }));
      next();
    } catch (error) {
      console.error('Error fetching product data:', error);
      res.status(500).send('Internal Server Error getting products...');
    }
  }
  

// Routes
app.get('/', getProductData, (req, res) => {
    // console.log(`Rendering template: ${__dirname}/views/index.ejs`);
    res.render('index.ejs', { products: req.products }); // Assuming your EJS template is named 'index.ejs'
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/products', getProductData, (req, res) => {
  res.render('products', { products: req.products });
});

app.get('/product/:id', getProductData, (req, res) => {
    const productId = req.params.id;
    const product = req.products.find(p => p.name === productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    // Render the product detail template
    res.render('product-detail', { product });
});

app.get('/contact', (req, res) => {
  res.render('contact');
});


// Serve static assets
app.use(express.static('public'));

// Ensure the server is listening on the correct port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
