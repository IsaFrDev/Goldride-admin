import React from 'react';
import { Search, MoreHorizontal, ShieldCheck, Edit2, Trash2, X } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Common.css';

const NewDrivers: React.FC = () => {
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [showModal, setShowModal] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<number | null>(null);
  
  const [formData, setFormData] = React.useState({
    id: null as number | null,
    phone: '', first_name: '', last_name: '', password: '',
    vehicle_make: '', vehicle_model: '', plate_number: '', vehicle_color: '',
    license_number: ''
  });

  const fetchDrivers = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await adminAPI.getDrivers();
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      // Faqat kutilayotgan (pending) haydovchilarni filtrlaymiz
      const pendingDrivers = data.filter((d: any) => d.status === 'pending');
      setDrivers(pendingDrivers);
    } catch (error) {
      console.error('Error fetching new drivers:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDrivers();
    const intervalId = setInterval(() => fetchDrivers(false), 5000 * 2); // Pending uchun biroz sekinroq (10s)
    return () => clearInterval(intervalId);
  }, []);

  const handleOpenModal = (driver?: any) => {
    if (driver) {
      setIsEditing(true);
      setFormData({ 
        id: driver.id, 
        phone: driver.user?.phone || '', 
        first_name: driver.user?.first_name || '', 
        last_name: driver.user?.last_name || '', 
        password: '',
        vehicle_make: driver.vehicle?.make || '',
        vehicle_model: driver.vehicle?.model || '',
        plate_number: driver.vehicle?.plate_number || '',
        vehicle_color: driver.vehicle?.color || '',
        license_number: driver.license_number || ''
      });
    }
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await adminAPI.updateDriver(formData.id, formData);
        alert('Ma\'lumotlar yangilandi');
      }
      handleCloseModal();
      fetchDrivers();
    } catch (err: any) {
      alert('Xatolik: ' + (err.response?.data?.detail || 'Amalni bajarib bo\'lmadi'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham ushbu so'rovni o'chirib yubormoqchimisiz?")) {
      try {
        await adminAPI.deleteDriver(id);
        fetchDrivers();
      } catch (err) {
        alert('O\'chirishda xatolik');
      }
    }
    setActiveMenu(null);
  };

  const handleApprove = async (id: number) => {
    try {
      await adminAPI.approveDriver(id);
      fetchDrivers(); // Refresh - endi bu haydovchi pending bo'lmaydi va ro'yxatdan yo'qoladi
      alert('Haydovchi muvaffaqiyatli tasdiqlandi va asosiy ro\'yxatga o\'tkazildi!');
    } catch (error) {
      alert('Tasdiqlashda xatolik yuz berdi');
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle?.plate_number?.includes(searchTerm)
  );

  return (
    <div className="drivers-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Yangi Haydovchilar</h2>
          <p className="page-subtitle">Tasdiqlash kutilayotgan haydovchilar ro'yxati</p>
        </div>
      </div>

      <div className="table-card glass">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Ism yoki davlat raqami..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Haydovchi</th>
                <th>Avtomobil</th>
                <th>Davlat Raqami</th>
                <th>Guvohnoma</th>
                <th>Status</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px'}}>Yuklanmoqda...</td></tr>
              ) : filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div className="driver-info-cell">
                      <div className="driver-avatar" style={{ backgroundColor: '#F0EDFF', color: '#6C5CE7' }}>{driver.user?.first_name?.[0] || '?'}</div>
                      <span className="driver-name-cell">{driver.user?.first_name} {driver.user?.last_name}</span>
                    </div>
                  </td>
                  <td>{driver.vehicle?.make} {driver.vehicle?.model}</td>
                  <td className="plate-cell">
                    <span className="plate-badge">{driver.vehicle?.plate_number}</span>
                  </td>
                  <td>{driver.license_number}</td>
                  <td>
                    <span className="badge badge-warning">Kutilmoqda</span>
                  </td>
                  <td>
                    <div className="table-actions-cell" style={{ gap: '10px' }}>
                      <button 
                        className="action-btn approve pulsate green" 
                        onClick={() => handleApprove(driver.id)}
                        title="Tasdiqlash"
                        style={{ 
                          padding: '10px 20px', 
                          borderRadius: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          backgroundColor: '#10B981',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                          fontWeight: '700'
                        }}
                      >
                        <ShieldCheck size={18} />
                        <span>Tasdiqlash</span>
                      </button>
                      
                      <button 
                         className="icon-btn-more" 
                         onClick={() => setActiveMenu(activeMenu === driver.id ? null : driver.id)}
                      >
                         <MoreHorizontal size={18} />
                      </button>
                      
                      {activeMenu === driver.id && (
                        <div className="action-menu glass" style={{ right: 0 }}>
                          <button onClick={() => handleOpenModal(driver)}><Edit2 size={14} /> Tahrirlash</button>
                          <button onClick={() => handleDelete(driver.id)} className="danger"><Trash2 size={14} /> Rad etish</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredDrivers.length === 0 && (
                <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px', color: '#94A3B8'}}>Hozircha yangi haydovchilar so'rovi yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '600px' }}>
             <div className="modal-header">
               <h3>Xaydovchi Ma'lumotlarini Ko'rish</h3>
               <button className="close-btn" onClick={handleCloseModal}><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="crud-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <div className="form-group">
                 <label>Telefon raqam</label>
                 <input type="text" readOnly value={formData.phone} />
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
                 <label>Avtomobil</label>
                 <input type="text" value={formData.vehicle_model} onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})} />
               </div>
               <div className="form-group">
                 <label>Davlat raqami</label>
                 <input type="text" value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} />
               </div>
               <div className="modal-footer" style={{ gridColumn: 'span 2' }}>
                 <button type="button" className="cancel-btn" onClick={handleCloseModal}>Yopish</button>
                 <button type="submit" className="save-btn">Saqlash</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewDrivers;
