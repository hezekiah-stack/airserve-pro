import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

const ICONS = {
  'AC Unit': '❄️', 'Refrigerant': '🌡️', 'Parts': '🔩', 'Supplies': '🧴', 'Materials': '🔌',
};

export default function Shop() {
  const [products, setProducts]   = useState([]);
  const [cart, setCart]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('All');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.products || []))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered   = category === 'All' ? products : products.filter(p => p.category === category);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const placeOrder = async () => {
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      });
      setSuccess('Order placed successfully! We will process it shortly.');
      setCart([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed.');
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Shop Products</h1>
        <p className="page-sub">Browse and purchase AC units, parts, and accessories.</p>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Category filter */}
          <div className="cat-filter">
            {categories.map(c => (
              <button key={c} className={`cat-btn${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          {loading ? <p className="muted">Loading products...</p> : (
            <div className="product-grid">
              {filtered.map(p => {
                const inCart = cart.find(i => i.id === p.id);
                return (
                  <div key={p.id} className="product-card">
                    <div className="prod-icon">{ICONS[p.category] || '📦'}</div>
                    <div className="prod-name">{p.name}</div>
                    <div className="prod-sku">SKU: {p.sku}</div>
                    <div className="prod-price">₱{Number(p.price).toLocaleString()}</div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      {p.stock_quantity === 0
                        ? <span className="badge badge-danger">Out of Stock</span>
                        : p.stock_quantity <= (p.low_stock_threshold || 5)
                        ? <span className="badge badge-warn">Low Stock ({p.stock_quantity})</span>
                        : <span className="badge badge-success">In Stock</span>}
                    </div>
                    {p.stock_quantity > 0 ? (
                      <button className={`btn btn-sm btn-block ${inCart ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => addToCart(p)}>
                        {inCart ? `In Cart (${inCart.qty})` : 'Add to Cart'}
                      </button>
                    ) : (
                      <button className="btn btn-outline btn-sm btn-block" disabled>Unavailable</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="cart-panel">
            <div className="card-title">🛒 Cart ({cart.length})</div>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="ci-name">{item.name}</div>
                <div className="ci-qty">
                  <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}>+</button>
                </div>
                <div className="ci-price">₱{(item.price * item.qty).toLocaleString()}</div>
                <button className="ci-remove" onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}>✕</button>
              </div>
            ))}
            <div className="cart-total">Total: <strong>₱{cartTotal.toLocaleString()}</strong></div>
            <button className="btn btn-gold btn-block" onClick={placeOrder}>Place Order</button>
            <button className="btn btn-outline btn-sm btn-block" style={{ marginTop: 6 }}
              onClick={() => setCart([])}>Clear Cart</button>
          </div>
        )}
      </div>
    </div>
  );
}
