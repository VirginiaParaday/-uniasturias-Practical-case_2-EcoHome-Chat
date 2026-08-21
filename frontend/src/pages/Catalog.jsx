import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProduct, getProducts } from '../api';
import { connectSocket } from '../socket';

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Catalog() {
  const { token, setProductsCount } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '' });

  async function loadProducts() {
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cargar el catálogo');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();

    const socket = connectSocket(token);
    function onProductCreated(payload) {
      const product = payload?.product;
      if (!product?.id) return;
      setProducts((current) => (current.some((item) => item.id === product.id) ? current : [product, ...current]));
    }
    socket.on('product-created', onProductCreated);
    return () => socket.off('product-created', onProductCreated);
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { product, productsCount } = await createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
      });
      setProducts((current) => [product, ...current]);
      setProductsCount(productsCount);
      setForm({ name: '', description: '', price: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo crear el producto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="catalog-page">
      <section className="catalog-form-card">
        <h3>Registrar producto</h3>
        <p className="catalog-hint">
          El creador se toma del JWT en el servidor. No se envía <code>created_by</code> desde el cliente.
        </p>
        <form onSubmit={handleSubmit} className="catalog-form">
          <label>
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Lámpara solar"
              required
            />
          </label>
          <label>
            Precio (COP)
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={handleChange}
              placeholder="89000"
              required
            />
          </label>
          <label className="span-2">
            Descripción
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear producto'}
          </button>
        </form>
      </section>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="empty-hint">Cargando catálogo...</p>
      ) : products.length === 0 ? (
        <p className="empty-hint">Aún no hay productos. Crea el primero.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <h4>{product.name}</h4>
              {product.description && <p>{product.description}</p>}
              <strong>{formatPrice(product.price)}</strong>
              <span className="product-creator">
                Creado por: {product.creator?.username || 'desconocido'}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
