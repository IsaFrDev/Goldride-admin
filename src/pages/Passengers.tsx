import React from 'react';
import { Search, UserPlus, MoreHorizontal, Filter, Edit2, Trash2, X } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Common.css';

const Passengers: React.FC = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [showModal, setShowModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({ id: null, phone: '', first_name: '', last_name: '', password: '' });
  
  const [activeMenu, setActiveMenu] = React.useState<number | null>(null);

  const fetchUsers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await adminAPI.getUsers();
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      // Faqat yo'lovchilarni (passenger) filtrlaymiz
      const passengers = data.filter((u: any) => u.role === 'passenger');
      setUsers(passengers);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
    const intervalId = setInterval(() => fetchUsers(false), 5000 * 2);
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenModal = (user?: any) => {
    if (user) {
      setIsEditing(true);
      setFormData({ id: user.id, phone: user.phone, first_name: user.first_name || '', last_name: user.last_name || '', password: '' });
    } else {
      setIsEditing(false);
      setFormData({ id: null, phone: '+998', first_name: '', last_name: '', password: '' });
    }
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ id: null, phone: '', first_name: '', last_name: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await adminAPI.updateUser(formData.id, formData);
        alert('Yo\'lovchi tahrirlandi');
      } else {
        await adminAPI.createUser(formData);
        alert('Yangi yo\'lovchi yaratildi');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      alert('Xatolik: ' + (err.response?.data?.detail || 'Amalni bajarib bo\'lmadi'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham ushbu yo'lovchini o'chirmoqchimisiz?")) {
      try {
        await adminAPI.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('O\'chirishda xatolik');
      }
    }
    setActiveMenu(null);
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  return (
    <div className="users-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Yo'lovchilar</h2>
          <p className="page-subtitle">Ilovadan foydalanuvchi yo'lovchilar ro'yxati</p>
        </div>
        <button className="add-btn pulsate" onClick={() => handleOpenModal()}>
          <UserPlus size={20} />
          <span>Yangi yo'lovchi</span>
        </button>
      </div>

      <div className="table-card glass">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Ism yoki telefon..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Yo'lovchi</th>
                <th>Telefon</th>
                <th>Ro'yxatdan o'tdi</th>
                <th>Holati</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{textAlign: 'center', padding: '40px'}}>Yuklanmoqda...</td></tr>
              ) : filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar" style={{ 
                          background: `linear-gradient(135deg, ${['#FFB800', '#0EA5E9', '#F43F5E', '#10B981'][user.id % 4]}22, ${['#FFB800', '#0EA5E9', '#F43F5E', '#10B981'][user.id % 4]}44)`, 
                          color: ['#FFB800', '#0EA5E9', '#F43F5E', '#10B981'][user.id % 4],
                          border: `1px solid ${['#FFB800', '#0EA5E9', '#F43F5E', '#10B981'][user.id % 4]}33`
                        }}>
                          {user.first_name?.[0] || user.phone?.[1] || '?'}
                        </div>
                        <span className="user-name-cell">{user.first_name || 'Ismsiz'} {user.last_name || ''}</span>
                      </div>
                    </td>
                    <td>{user.phone}</td>
                    <td>{new Date(user.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {user.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td>
                      <div style={{ position: 'relative' }}>
                        <button 
                          className="icon-btn-more" 
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {activeMenu === user.id && (
                          <div className="action-menu glass" style={{ right: 0 }}>
                            <button onClick={() => handleOpenModal(user)}><Edit2 size={16} /> Tahrirlash</button>
                            <button onClick={() => handleDelete(user.id)} className="danger"><Trash2 size={16} /> O'chirish</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr><td colSpan={5} style={{textAlign: 'center', padding: '40px', color: '#94A3B8'}}>Yo'lovchilar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in">
             <div className="modal-header">
               <h3>{isEditing ? 'Yo\'lovchi Ma\'lumotlarini Tahrirlash' : 'Yangi Yo\'lovchi'}</h3>
               <button className="close-btn" onClick={handleCloseModal}><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="crud-form">
               <div className="form-group">
                 <label>Telefon raqam</label>
                 <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+998901234567" />
               </div>
               <div className="form-group">
                 <label>Ism</label>
                 <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
               </div>
               <div className="form-group">
                 <label>Familiya</label>
                 <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
               </div>
               <div className="form-group">
                 <label>Parol {isEditing && <small>(O'zgartirish uchun kiriting)</small>}</label>
                 <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? 'Yangi parol' : 'taksi123'} />
               </div>
               <div className="modal-footer">
                 <button type="button" className="cancel-btn" onClick={handleCloseModal}>Bekor qilish</button>
                 <button type="submit" className="save-btn">{isEditing ? 'Saqlash' : 'Yaratish'}</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passengers;
