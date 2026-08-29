import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api';
import { connectSocket } from '../socket';

function formatPrice(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

const emptyForm = { name: '', description: '', price: '' };

export default function Catalog() {
  const { token, user, setProductsCount } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const canManage = (product) =>
    user?.role === 'admin' || product.createdBy === user?.id || product.creator?.id === user?.id;

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
    function onCreated(payload) {
      const product = payload?.product;
      if (!product?.id) return;
      setProducts((current) => (current.some((item) => item.id === product.id) ? current : [product, ...current]));
    }
    function onUpdated(payload) {
      const product = payload?.product;
      if (!product?.id) return;
      setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
    }
    function onDeleted(payload) {
      if (!payload?.id) return;
      setProducts((current) => current.filter((item) => item.id !== payload.id));
      if (payload.userId === user?.id && typeof payload.productsCount === 'number') {
        setProductsCount(payload.productsCount);
      }
    }
    socket.on('product-created', onCreated);
    socket.on('product-updated', onUpdated);
    socket.on('product-deleted', onDeleted);
    return () => {
      socket.off('product-created', onCreated);
      socket.off('product-updated', onUpdated);
      socket.off('product-deleted', onDeleted);
    };
  }, [token, user?.id, setProductsCount]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
    };
    try {
      if (editingId) {
        const { product } = await updateProduct(editingId, payload);
        setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
        cancelEdit();
      } else {
        const { product, productsCount } = await createProduct(payload);
        setProducts((current) => [product, ...current]);
        setProductsCount(productsCount);
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    try {
      const data = await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (product.createdBy === user?.id || product.creator?.id === user?.id) {
        setProductsCount(data.productsCount);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo eliminar');
    }
  }

  return (
    <div className="catalog-page">
      <section className="catalog-form-card">
        <h3>{editingId ? 'Editar producto' : 'Registrar producto'}</h3>
        <p className="catalog-hint">
          El creador se toma del JWT. Editar/borrar: solo el autor o un admin.
        </p>
        <form onSubmit={handleSubmit} className="catalog-form">
          <label>
            Nombre
            <input name="name" value={form.name} onChange={handleChange} placeholder="Lámpara solar" required />
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
            <input name="description" value={form.description} onChange={handleChange} placeholder="Opcional" />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear producto'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
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
              {canManage(product) && (
                <div className="product-actions">
                  <button type="button" onClick={() => startEdit(product)}>Editar</button>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(product)}>
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
