import { useState, useEffect } from "react";
import {
  fetchProperties, fetchPropertyTypes, fetchAgents, fetchBlogPosts,
  createViewingRequest, fetchRequests, createProperty,
  login as apiLogin, logout as apiLogout, register as apiRegister,
  fetchCurrentUser,
} from "./api";

function App() {
  const [page, setPage] = useState("home");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((r) => setUser(r.authenticated ? r.user : null))
      .finally(() => setAuthLoading(false));
  }, []);

  async function handleLogout() {
    await apiLogout();
    setUser(null);
    setPage("home");
  }

  if (authLoading) return <div style={{ padding: 50, textAlign: 'center' }}>Загрузка…</div>;

  return (
    <div className="app">
      <Header page={page} setPage={setPage} user={user} onLogout={handleLogout} />

      {page === "home" && <HomePage setPage={setPage} />}
      {page === "catalog" && <Catalog setPage={setPage} onRequest={(p) => setSelectedProperty(p)} />}
      {page === "add-property" && <AddProperty onAdded={() => setPage("catalog")} />}
      {page === "agents" && <AgentsPage />}
      {page === "blog" && <BlogPage />}
      {page === "contacts" && <ContactsPage />}
      {page === "requests" && user?.is_staff && <Requests />}

      {page === "login" && <Login
        onLogin={async (u, p) => { await apiLogin(u, p); setUser((await fetchCurrentUser()).user); setPage("home"); }}
        setPage={setPage}
      />}
      {page === "register" && <Register
        onRegister={async (u, p, n) => { await apiRegister(u, p, n); setUser((await fetchCurrentUser()).user); setPage("home"); }}
        setPage={setPage}
      />}

      {selectedProperty && (
        <RequestModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
}

/* ============================================================
   HEADER
   ============================================================ */
function Header({ page, setPage, user, onLogout }) {
  return (
    <header className="header">
      <div className="logo" onClick={() => setPage("home")}>
        <div className="logo-icon">🏠</div> Дом на Волге
      </div>

      <nav className="nav">
        <button className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>Главная</button>
        <button className={page === "catalog" ? "active" : ""} onClick={() => setPage("catalog")}>Объекты ▾</button>
        {user && (
          <button className={page === "add-property" ? "active" : ""} onClick={() => setPage("add-property")} style={{ color: '#8c5e35', fontWeight: 'bold' }}>
            + Добавить объект
          </button>
        )}
        <button className={page === "agents" ? "active" : ""} onClick={() => setPage("agents")}>Агенты ▾</button>
        <button className={page === "blog" ? "active" : ""} onClick={() => setPage("blog")}>Блог ▾</button>
        <button className={page === "contacts" ? "active" : ""} onClick={() => setPage("contacts")}>Контакты</button>
        {user?.is_staff && (
          <button className={page === "requests" ? "active" : ""} onClick={() => setPage("requests")}>Заявки</button>
        )}
      </nav>

      <div className="header-right">
        <span className="header-phone">📞 +7 (831) 000-00-00</span>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{user.first_name || user.username}</span>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={onLogout}>Выйти</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setPage("login")}>Войти</button>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setPage("register")}>Регистрация</button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function HomePage({ setPage }) {
  return (
    <main className="home-container">
      <div className="hero-card">
        <div className="hero-content">
          <h1 className="hero-title">Найдите свой<br/>дом на Волге</h1>
          <p className="hero-desc">
            Квартиры в Нижнем Новгороде, дома и участки в Богородском
            районе, коммерческие помещения в центре. Показываем только
            объекты с проверенными документами.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setPage("catalog")}>Смотреть объекты</button>
            <button className="btn-outline" onClick={() => setPage("contacts")}>Получить подборку</button>
          </div>
        </div>
        <div className="hero-image-wrapper">
           <img src="/dom.jpg" alt="Дом" className="hero-img" />
        </div>
        <div className="search-bar">
          <div className="search-field">
            <label>РАЙОН ИЛИ АДРЕС</label>
            <input type="text" placeholder="Например, Верхние Печёры" />
          </div>
          <div className="search-field">
            <label>ТИП</label>
            <select><option>Любой тип</option></select>
          </div>
          <button className="btn-primary search-btn" onClick={() => setPage("catalog")}>Найти</button>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   CATALOG
   ============================================================ */
function Catalog({ setPage, onRequest }) {
  const [properties, setProperties] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({ type: "", location: "", deal: "" });

  useEffect(() => { fetchPropertyTypes().then((r) => setTypes(r.data)); }, []);

  useEffect(() => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.location) params.location = filters.location;
    if (filters.deal) params.deal = filters.deal;
    fetchProperties(params).then((r) => setProperties(r.data));
  }, [filters]);

  return (
    <main className="catalog-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Найдите свой<br/>дом на Волге</h2>
        <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setPage("catalog")}>Смотреть объекты</button>
        <div className="sidebar-image-wrapper">
           <img src="/dom.jpg" alt="Дом" className="sidebar-img" />
        </div>
        <div className="sidebar-search">
          <label>РАЙОН ИЛИ АДРЕС</label>
          <input type="text" placeholder="Например, Верхние Печёры" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        </div>
      </aside>

      <section className="catalog-main">
        <div className="catalog-header">
          <h1>Каталог объектов</h1>
        </div>

        <div className="filters-panel">
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Любой тип</option>
            {types.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
          <select value={filters.deal} onChange={(e) => setFilters({ ...filters, deal: e.target.value })}>
            <option value="">Покупка и аренда</option>
            <option value="sale">Продажа</option>
            <option value="rent">Аренда</option>
          </select>
          <p className="found-text">Найдено объектов: {properties.length}</p>
        </div>

        <div className="grid">
          {properties.map((p) => (
            <div className="card" key={p.id}>
              <div className="card-image">
                {p.image_url ? <img src={p.image_url} alt={p.title} /> : <div className="no-image">Нет фото</div>}
                <span className="badge badge-deal">{p.deal_display}</span>
              </div>
              <div className="card-body">
                <h3>{p.title}</h3>
                <p className="address">{p.address}</p>
                <p className="features">{p.rooms} комн. · {p.area} м²</p>
                {p.author_name && <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Автор: {p.author_name}</p>}
                <div className="card-footer">
                  <strong>{Number(p.price).toLocaleString("ru-RU")} ₽</strong>
                  <button className="btn-primary" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => onRequest(p)}>Записаться</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   ADD PROPERTY
   ============================================================ */
function AddProperty({ onAdded }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    title: "", address: "", district: "", property_type_id: "", deal: "sale",
    price: "", rooms: 1, area: "", floor: 1, total_floors: 1, description: "", image_url: ""
  });
  const [error, setError] = useState(null);

  useEffect(() => { fetchPropertyTypes().then(r => setTypes(r.data)); }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await createProperty(form);
      alert("Объект успешно добавлен!");
      onAdded();
    } catch (err) {
      setError("Ошибка добавления. Проверьте поля.");
    }
  }

  return (
    <main className="container" style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
      <div className="card" style={{ padding: 40 }}>
        <h1 style={{ fontFamily: 'Playfair Display', marginBottom: 20 }}>Добавить объект</h1>
        {error && <p style={{ color: 'red', marginBottom: 15 }}>{error}</p>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <input placeholder="Название (например, 2-комн. квартира)" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
          <input placeholder="Адрес" required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" />
          <input placeholder="Район" required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="input-field" />

          <select required value={form.property_type_id} onChange={e => setForm({ ...form, property_type_id: e.target.value })} className="input-field">
            <option value="">Выберите тип...</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 10 }}>
            <input type="number" placeholder="Цена" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
            <input type="number" placeholder="Комнат" required value={form.rooms} onChange={e => setForm({ ...form, rooms: e.target.value })} className="input-field" />
            <input type="number" step="0.1" placeholder="Площадь м²" required value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="input-field" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input type="number" placeholder="Этаж" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} className="input-field" />
            <input type="number" placeholder="Всего этажей" value={form.total_floors} onChange={e => setForm({ ...form, total_floors: e.target.value })} className="input-field" />
          </div>

          <select value={form.deal} onChange={e => setForm({ ...form, deal: e.target.value })} className="input-field">
            <option value="sale">Продажа</option>
            <option value="rent">Аренда</option>
          </select>

          <input placeholder="Ссылка на фото (URL)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-field" />
          <textarea placeholder="Описание" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows="4"></textarea>

          <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>Опубликовать</button>
        </form>
      </div>
    </main>
  );
}

/* ============================================================
   AGENTS PAGE
   ============================================================ */
function AgentsPage() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAgents().then((r) => setAgents(r.data));
  }, []);

  return (
    <main className="container" style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 10 }}>Наши агенты</h1>
      <p style={{ color: '#666', marginBottom: 30 }}>Команда профессионалов, которая поможет найти идеальный дом.</p>

      {agents.length === 0 ? (
        <p style={{ color: '#888' }}>Пока нет агентов. Добавьте их через админку.</p>
      ) : (
        <div className="grid">
          {agents.map((a) => (
            <div className="card" key={a.id} style={{ textAlign: 'center', padding: 30 }}>
              <img src={a.photo_url || "/agent1.jpg"} alt={a.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 20px', background: '#eee' }} />
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 5 }}>{a.name}</h3>
              <p style={{ color: '#888', fontSize: 14 }}>{a.role}</p>
              {a.phone && <p style={{ color: '#555', fontSize: 14, marginTop: 10 }}>📞 {a.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* ============================================================
   BLOG PAGE
   ============================================================ */
function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchBlogPosts().then((r) => setPosts(r.data));
  }, []);

  return (
    <main className="container" style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 30 }}>Блог о недвижимости</h1>

      {posts.length === 0 ? (
        <p style={{ color: '#888' }}>Пока нет статей. Добавьте их через админку.</p>
      ) : (
        <div className="grid">
          {posts.map((post) => (
            <div className="card" key={post.id} style={{ padding: 30 }}>
              <p style={{ color: '#8c5e35', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{post.category.toUpperCase()}</p>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 22, marginBottom: 15 }}>{post.title}</h3>
              <p style={{ color: '#666', fontSize: 14, lineHeight: 1.5 }}>{post.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

/* ============================================================
   CONTACTS PAGE
   ============================================================ */
function ContactsPage() {
  return (
    <main className="container" style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36, marginBottom: 30 }}>Контакты</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>Наш офис в Нижнем Новгороде</h3>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 10 }}>📍 ул. Большая Покровская, д. 42, офис 305</p>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 10 }}>📞 +7 (831) 000-00-00</p>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 20 }}>✉️ info@domnavolge.ru</p>
          <p style={{ color: '#666', lineHeight: 1.6 }}>Режим работы: Пн-Пт с 09:00 до 19:00, Сб с 10:00 до 16:00</p>
        </div>

        <div style={{ background: '#fff', padding: 30, borderRadius: 20, border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Оставьте заявку на подборку</h3>
          <input placeholder="Ваше имя" className="input-field" style={{ marginBottom: 10 }} />
          <input placeholder="Телефон" className="input-field" style={{ marginBottom: 10 }} />
          <textarea placeholder="Что вы ищете?" className="input-field" style={{ marginBottom: 15 }} rows="3"></textarea>
          <button className="btn-primary" style={{ width: '100%' }}>Отправить</button>
        </div>
      </div>
    </main>
  );
}

/* ============================================================
   MODALS
   ============================================================ */
function RequestModal({ property, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", comment: "", preferred_date: "" });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      await createViewingRequest({ property: property.id, ...form });
      setStatus("ok");
    } catch (err) { setStatus("err"); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <h2>Заявка на просмотр</h2>
        <p>{property.title}</p>
        {status === "ok" ? <div style={{ background: '#e6f4ec', padding: 20, color: '#2f6f4f', borderRadius: 10 }}>Спасибо! Мы свяжемся с вами.</div> : (
          <form onSubmit={submit}>
            <input required placeholder="Ваше имя" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Телефон" className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <button type="submit" className="btn-primary btn-block">Отправить</button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LOGIN & REGISTER
   ============================================================ */
function Login({ onLogin, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try { await onLogin(username, password); }
    catch (err) { setError("Неверный логин или пароль"); }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 style={{ fontFamily: 'Playfair Display' }}>Вход</h1>
        <form onSubmit={submit}>
          <input placeholder="Логин" className="input-field" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Пароль" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
          <button className="btn-primary btn-block">Войти</button>
        </form>
        <p style={{ marginTop: 20, fontSize: 14, textAlign: 'center' }}>
          Нет аккаунта? <span style={{ color: '#8c5e35', cursor: 'pointer' }} onClick={() => setPage("register")}>Зарегистрируйтесь</span>
        </p>
      </div>
    </main>
  );
}

function Register({ onRegister, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try { await onRegister(username, password, firstName); }
    catch (err) { setError("Ошибка регистрации. Возможно, логин занят."); }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 style={{ fontFamily: 'Playfair Display' }}>Регистрация</h1>
        <form onSubmit={submit}>
          <input placeholder="Ваше имя" className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <input placeholder="Логин" className="input-field" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" placeholder="Пароль" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
          <button className="btn-primary btn-block">Создать аккаунт</button>
        </form>
        <p style={{ marginTop: 20, fontSize: 14, textAlign: 'center' }}>
          Уже есть аккаунт? <span style={{ color: '#8c5e35', cursor: 'pointer' }} onClick={() => setPage("login")}>Войти</span>
        </p>
      </div>
    </main>
  );
}

/* ============================================================
   REQUESTS
   ============================================================ */
function Requests() {
  const [requests, setRequests] = useState([]);
  useEffect(() => { fetchRequests().then(r => setRequests(r.data)); }, []);

  return (
    <main className="container" style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontFamily: 'Playfair Display', fontSize: 36 }}>Заявки</h1>
      {requests.map(r => (
        <div key={r.id} style={{ background: "#fff", padding: 20, marginTop: 15, borderRadius: 12, border: '1px solid #eaeaea' }}>
          <h3>{r.name} — {r.phone}</h3>
          <p>Объект: {r.property_title}</p>
        </div>
      ))}
    </main>
  );
}

export default App;