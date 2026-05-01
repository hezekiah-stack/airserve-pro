import { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/pages.css';

const ICONS = { 'AC Unit': '❄️', 'Refrigerant': '🌡️', 'Parts': '🔩', 'Supplies': '🧴', 'Materials': '🔌' };

export default function Inventory() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ name:'', sku:'', category:'Parts', price:'', stock_quantity:'', description:'' });

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.products || []))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    try {
      await api.post('/products', form);
      const r = await api.get('/products');
      setProducts(r.data.products || []);
      setShowAdd(false);
      setForm({ name:'', sku:'', category:'Parts', price:'', stock_quantity:'', description:'' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product.');
    }
  };

  const lowStock  = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 5)).length;
  const outStock  = products.filter(p => p.stock_quantity === 0).length;
  const totalVal  = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1 className="page-title">Product Inventory</h1>
        <p className="page-sub">Manage parts, products, and stock levels.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total Products</div><div className="stat-val">{products.length}</div></div>
        <div className="stat-card"><div className="stat-label">Low Stock</div><div className="stat-val" style={{ color:'var(--warn)' }}>{lowStock}</div></div>
        <div className="stat-card"><div className="stat-label">Out of Stock</div><div className="stat-val" style={{ color:'var(--danger)' }}>{outStock}</div></div>
        <div className="stat-card"><div className="stat-label">Total Stock Value</div><div className="stat-val">₱{totalVal.toLocaleString()}</div></div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div style={{ fontWeight: 600, fontSize: 14 }}>All Products</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>
        </div>
        {loading ? <p className="muted">Loading...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {products.map(p => {
              const stockStatus = p.stock_quantity === 0 ? 'out'
                : p.stock_quantity <= (p.low_stock_threshold || 5) ? 'low' : 'ok';
              return (
                <div key={p.id} className="inv-card">
                  <div className="inv-icon">{ICONS[p.category] || '📦'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>SKU: {p.sku} · {p.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: stockStatus === 'out' ? 'var(--danger)' : stockStatus === 'low' ? 'var(--warn)' : 'var(--success)' }}>
                      Stock: {p.stock_quantity}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>₱{Number(p.price).toLocaleString()}</div>
                  </div>
                  <span className={`badge ${stockStatus === 'ok' ? 'badge-success' : stockStatus === 'low' ? 'badge-warn' : 'badge-danger'}`}>
                    {stockStatus === 'ok' ? 'OK' : stockStatus === 'low' ? 'Low' : 'Out'}
                  </span>
                  <button className={`btn btn-sm ${stockStatus === 'out' ? 'btn-primary' : 'btn-outline'}`}>
                    {stockStatus === 'out' ? 'Reorder' : 'Edit'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Product</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            {['name','sku','price','stock_quantity','description'].map(field => (
              <div key={field} className="form-group">
                <label className="form-label">{field.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                <input className="form-control" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['AC Unit','Refrigerant','Parts','Supplies','Materials'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-end">
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
