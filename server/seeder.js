const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Product = require('./models/Product');
const Party = require('./models/Party');
const Invoice = require('./models/Invoice');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const importData = async () => {
  try {
    await Product.deleteMany();
    await Party.deleteMany();
    await Invoice.deleteMany();
    await User.deleteMany();

    // Create default admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@textile.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create additional demo users
    await User.create([
      {
        name: 'Manager User',
        email: 'manager@textile.com',
        password: 'manager123',
        role: 'manager',
      },
      {
        name: 'Staff User',
        email: 'staff@textile.com',
        password: 'staff123',
        role: 'staff',
      },
      {
        name: 'Viewer User',
        email: 'viewer@textile.com',
        password: 'viewer123',
        role: 'viewer',
      },
    ]);

    console.log('Users created:');
    console.log('Admin: admin@textile.com / admin123');
    console.log('Manager: manager@textile.com / manager123');
    console.log('Staff: staff@textile.com / staff123');
    console.log('Viewer: viewer@textile.com / viewer123');

    const products = [];
    const productNames = ['Cotton Saree', 'Silk Saree', 'Khadi Cotton', 'Banarasi Fabric', 'Denim', 'Velvet', 'Satin', 'Chiffon', 'Georgette', 'Crepe', 'Rayon', 'Polyester', 'Nylon', 'Spandex', 'Pashmina', 'Woolen Shawl', 'Tweed', 'Flannel', 'Corduroy', 'Brocade'];
    const categories = ['Fabrics', 'Yarns', 'Blends'];
    const units = ['meters', 'kgs', 'pieces'];

    for (let i = 0; i < 20; i++) {
      const productCode = `INR_PROD${1000 + i}`;
      const name = productNames[i % productNames.length];
      const category = categories[i % categories.length];
      const unitOfMeasurement = units[i % units.length];
      // Generate INR prices between 500 and 5000
      const price = parseFloat((Math.random() * 4500 + 500).toFixed(2));
      const stock = Math.floor(Math.random() * 500);
      const minStock = Math.floor(Math.random() * 40 + 5);

      products.push({
        productCode,
        name,
        description: `${name} - premium Indian textile`,
        category,
        unitOfMeasurement,
        price,
        stock,
        minStock,
      });
    }
    const createdProducts = await Product.insertMany(products);

    const parties = [];
    const companyNames = ['Anand Textiles', 'Mumbai Fabrics', 'Kolkata Weavers', 'Delhi Drapes', 'Chennai Mills', 'Hyderabad Threads', 'Pune Cloth Co', 'Ahmedabad Looms', 'Surat Traders', 'Bengaluru Merchants'];
    const contactPersons = ['Amit Sharma', 'Priya Singh', 'Rahul Verma', 'Sneha Mehta', 'Rakesh Patel', 'Neha Gupta', 'Vikram Rao', 'Meera Nair', 'Suresh Joshi', 'Kavita Desai'];

    for (let i = 0; i < 10; i++) {
      const name = companyNames[i % companyNames.length];
      const type = i % 2 === 0 ? 'Customer' : 'Supplier';
      const contactPerson = contactPersons[i % contactPersons.length];
      const phone = `+91-${6000000000 + i}`;
      const email = `${name.toLowerCase().replace(/\s/g, '')}@example.in`;
      const address = `${Math.floor(Math.random() * 200)} MG Road, City, India`;
      const paymentStatus = i % 3 === 0 ? 'Paid' : 'Pending'; // Mix of statuses

      parties.push({
        name,
        type,
        contactPerson,
        phone,
        email,
        address,
        paymentStatus,
      });
    }
    const createdParties = await Party.insertMany(parties);

    const invoices = [];
    for (let i = 0; i < 8; i++) {
      const customers = createdParties.filter(p => p.type === 'Customer');
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const invoiceProducts = [];
      let totalAmount = 0;
      for (let j = 0; j < Math.floor(Math.random() * 4) + 1; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 20) + 1;
        const rate = product.price;
        const amount = parseFloat((quantity * rate).toFixed(2));
        totalAmount += amount;
        invoiceProducts.push({
          product: product._id,
          quantity,
          rate,
          amount,
        });
      }
      const paymentStatus = i % 4 === 0 ? 'Paid' : 'Pending'; // Mix of payment statuses
      
      invoices.push({
        invoiceNumber: `INR/INV/${2025000 + i}`,
        customer: customer._id,
        products: invoiceProducts,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paymentStatus,
        invoiceDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      });
    }
    await Invoice.insertMany(invoices);

    console.log('Indian Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Party.deleteMany();
    await Invoice.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}