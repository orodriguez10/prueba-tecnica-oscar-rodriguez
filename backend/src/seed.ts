import mongoose from 'mongoose';
import { ProductSchema } from './products/product.schema';
import { CustomerSchema } from './customers/customer.schema';
import { OrderSchema } from './orders/order.schema';

const MONGO_URI = 'mongodb://localhost:27017/tienda';

const CATEGORIES = ['Ropa', 'Calzado', 'Electrónica', 'Hogar', 'Deportes', 'Juguetes', 'Libros', 'Belleza'];
const ADJECTIVES = ['Clásico', 'Premium', 'Básico', 'Deluxe', 'Eco', 'Pro', 'Mini', 'Max', 'Urbano', 'Vintage'];
const NOUNS = ['Camisa', 'Zapato', 'Audífonos', 'Lámpara', 'Balón', 'Muñeco', 'Novela', 'Crema', 'Mochila', 'Reloj', 'Taza', 'Gorra'];
const CITIES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira'];
const STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

const rand = (max: number) => Math.floor(Math.random() * max);
const pick = <T>(arr: T[]): T => arr[rand(arr.length)];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB, limpiando colecciones...');

  const Product = mongoose.model('Product', ProductSchema);
  const Customer = mongoose.model('Customer', CustomerSchema);
  const Order = mongoose.model('Order', OrderSchema);

  await Promise.all([Product.deleteMany({}), Customer.deleteMany({}), Order.deleteMany({})]);

  // Productos
  const products = [];
  for (let i = 0; i < 5000; i++) {
    const noun = pick(NOUNS);
    products.push({
      name: `${noun} ${pick(ADJECTIVES)} ${i + 1}`,
      description: `${noun} de excelente calidad. Referencia #${10000 + i}.`,
      category: pick(CATEGORIES),
      price: Math.round((5 + Math.random() * 495) * 100) / 100,
      stock: rand(50),
      createdAt: new Date(Date.now() - rand(365) * 24 * 60 * 60 * 1000),
    });
  }
  products.push({
    name: 'Camisa (talla M) edición especial',
    description: 'La favorita de la temporada. <b>¡Últimas unidades!</b>',
    category: 'Ropa',
    price: 59.9,
    stock: 3,
  });
  products.push({
    name: 'Producto importado del proveedor',
    description: 'Descripción del proveedor <img src="x" onerror="alert(\'Hola desde la descripción del producto\')">',
    category: 'Hogar',
    price: 0.1,
    stock: 100,
  });
  products.push({
    name: 'Accesorio de regalo',
    description: 'Ideal para acompañar tu compra.',
    category: 'Hogar',
    price: 0.2,
    stock: 100,
  });
  const insertedProducts = await Product.insertMany(products);
  console.log(`${insertedProducts.length} productos creados`);

  // Clientes
  const customers = [];
  for (let i = 0; i < 300; i++) {
    customers.push({
      name: `Cliente ${i + 1}`,
      email: `cliente${i + 1}@correo.com`,
      password: `clave${1000 + i}`,
      city: pick(CITIES),
    });
  }
  const insertedCustomers = await Customer.insertMany(customers);
  console.log(`${insertedCustomers.length} clientes creados`);

  // Pedidos
  const orders = [];
  for (let i = 0; i < 800; i++) {
    const items = [];
    const itemsCount = 1 + rand(4);
    for (let j = 0; j < itemsCount; j++) {
      const product = pick(insertedProducts);
      items.push({ productId: product._id, quantity: 1 + rand(3), unitPrice: product.price });
    }
    const total = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    orders.push({
      customerId: pick(insertedCustomers)._id,
      items,
      total: Math.round(total * 100) / 100,
      status: pick(STATUSES),
      createdAt: new Date(Date.now() - rand(180) * 24 * 60 * 60 * 1000),
    });
  }
  await Order.insertMany(orders);
  console.log(`${orders.length} pedidos creados`);

  await mongoose.disconnect();
  console.log('Seed terminado ✔');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
