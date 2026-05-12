import React from 'react';
import { Search, MoreHorizontal, ShieldCheck, Star, Edit2, Trash2, X } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Common.css';

const Drivers: React.FC = () => {
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
      // Faqat tasdiqlangan yoki boshqa (pending bo'lmagan) haydovchilarni ko'rsatamiz
      const approvedDrivers = data.filter((d: any) => d.status !== 'pending');
      setDrivers(approvedDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDrivers();
    const intervalId = setInterval(() => fetchDrivers(false), 5000);
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
    } else {
      setIsEditing(false);
      setFormData({ 
        id: null, phone: '+998', first_name: '', last_name: '', password: '',
        vehicle_make: '', vehicle_model: '', plate_number: '', vehicle_color: '',
        license_number: ''
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
        alert('Haydovchi muvaffaqiyatli tahrirlandi');
      } else {
        await adminAPI.createDriver(formData);
        alert('Yangi haydovchi yaratildi');
      }
      handleCloseModal();
      fetchDrivers();
    } catch (err: any) {
      alert('Xatolik yuz berdi: ' + (err.response?.data?.detail || err.response?.data?.error || 'Noma\'lum xatolik'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Rostdan ham ushbu haydovchini to'liq o'chirmoqchimisiz?")) {
      try {
        await adminAPI.deleteDriver(id);
        alert('Haydovchi o\'chirildi');
        fetchDrivers();
      } catch (err) {
        alert('O\'chirishda xatolik yuz berdi');
      }
    }
    setActiveMenu(null);
  };

  const handleApprove = async (id: number) => {
    try {
      await adminAPI.approveDriver(id);
      fetchDrivers(); 
      alert('Haydovchi tasdiqlandi');
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await adminAPI.driverAction(id, 'toggle_active');
      fetchDrivers(); 
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle?.plate_number?.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      case 'blocked': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'approved': return 'Faol';
      case 'pending': return 'Tasdiqlash kutilmoqda';
      case 'rejected': return 'Rad etilgan';
      case 'blocked': return 'Bloklangan';
      default: return status;
    }
  };

  return (
    <div className="drivers-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Haydovchilar</h2>
          <p className="page-subtitle">Ro'yxatdan o'tgan haydovchilar va ularning xolati</p>
        </div>
        <button className="add-btn pulsate green" onClick={() => handleOpenModal()}>
          <ShieldCheck size={20} />
          <span>Yangi haydovchi</span>
        </button>
      </div>

      <div className="table-card glass">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Ism, raqam yoki raqam..." 
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
                <th>Reyting</th>
                <th>Daromad</th>
                <th>Status</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: '40px'}}>Yuklanmoqda...</td></tr>
              ) : filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div className="driver-info-cell">
                      <div className="driver-avatar" style={{ 
                        background: `linear-gradient(135deg, ${['#FFB800', '#0EA5E9', '#F43F5E', '#8B5CF6'][driver.id % 4]}22, ${['#FFB800', '#0EA5E9', '#F43F5E', '#8B5CF6'][driver.id % 4]}44)`, 
                        color: ['#FFB800', '#0EA5E9', '#F43F5E', '#8B5CF6'][driver.id % 4],
                        border: `1px solid ${['#FFB800', '#0EA5E9', '#F43F5E', '#8B5CF6'][driver.id % 4]}33`
                      }}>{driver.user?.first_name?.[0] || '?'}</div>
                      <span className="driver-name-cell">{driver.user?.first_name} {driver.user?.last_name}</span>
                    </div>
                  </td>
                  <td>{driver.vehicle?.make} {driver.vehicle?.model || 'Noma\'lum'}</td>
                  <td className="plate-cell">
                    <span className="plate-badge">{driver.vehicle?.plate_number || '-'}</span>
                  </td>
                  <td className="rating-cell">
                    <Star size={16} color="#FFB800" fill="#FFB800" />
                    <span style={{fontWeight: 800, color: '#FFB800'}}>{driver.rating || '5.0'}</span>
                  </td>
                  <td className="earnings-cell" style={{fontWeight: 800}}>{Number(driver.total_earnings || 0).toLocaleString()} UZS</td>
                  <td>
                    <div className="switch-container" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <label className="switch" title={driver.user?.is_active ? 'Bloklash' : 'Faollashtirish'}>
                        <input 
                          type="checkbox" 
                          checked={driver.user?.is_active} 
                          onChange={() => handleToggleActive(driver.id)}
                        />
                        <span className="slider round"></span>
                      </label>
                      <span className={`badge ${getStatusBadge(driver.status)}`}>
                        {getStatusDisplay(driver.status)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions-cell" style={{ position: 'relative' }}>
                      <button 
                         className="icon-btn-more" 
                         onClick={() => setActiveMenu(activeMenu === driver.id ? null : driver.id)}
                      >
                         <MoreHorizontal size={20} />
                      </button>
                      
                      {activeMenu === driver.id && (
                        <div className="action-menu glass" style={{ right: 0 }}>
                          {driver.status === 'pending' && (
                            <button onClick={() => handleApprove(driver.id)} style={{color: '#10B981'}}><ShieldCheck size={16} /> Tasdiqlash</button>
                          )}
                          <button onClick={() => handleOpenModal(driver)}><Edit2 size={16} /> Tahrirlash</button>
                          <button onClick={() => handleDelete(driver.id)} className="danger"><Trash2 size={16} /> O'chirish</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredDrivers.length === 0 && (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: '40px', color: '#94A3B8'}}>Haydovchilar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '600px' }}>
             <div className="modal-header">
               <h3>{isEditing ? 'Haydovchini Tahrirlash' : 'Yangi Haydovchi'}</h3>
               <button className="close-btn" onClick={handleCloseModal}><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="crud-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <div className="form-group">
                 <label>Telefon raqam *</label>
                 <input type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+998901234567" />
               </div>
               <div className="form-group">
                 <label>Parol {isEditing && <small>(Kiritish ixtiyoriy)</small>}</label>
                 <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? 'Yangi parol' : 'taksi123'} />
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
                 <label>Prava (Guvohnoma) raqami</label>
                 <input type="text" value={formData.license_number} onChange={(e) => setFormData({...formData, license_number: e.target.value})} placeholder="AA1234567" />
               </div>
               <div className="form-group">
                 <label>Avtomobil rusumi</label>
                 <input type="text" value={formData.vehicle_model} onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})} placeholder="Cobalt" />
               </div>
               <div className="form-group">
                 <label>Davlat raqami</label>
                 <input type="text" value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} placeholder="01A123BC" />
               </div>
               <div className="form-group">
                 <label>Avto Rangi</label>
                 <input type="text" value={formData.vehicle_color} onChange={(e) => setFormData({...formData, vehicle_color: e.target.value})} placeholder="Oq" />
               </div>

               <div className="modal-footer" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
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

export default Drivers;
