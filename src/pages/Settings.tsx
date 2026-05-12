import React, { useState } from 'react';
import { Save, RefreshCcw, Info, DollarSign, Percent } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Common.css';
import './Settings.css';

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [baseFare, setBaseFare] = useState(5000);
  const [perKmRate, setPerKmRate] = useState(2000);
  const [sharedDiscount, setSharedDiscount] = useState(30);
  const [commission, setCommission] = useState(5);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminAPI.getSettings();
        const data = response.data;
        setBaseFare(data.base_fare);
        setPerKmRate(data.per_km_rate);
        setSharedDiscount(data.shared_discount * 100);
        setCommission(data.commission_rate * 100);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await adminAPI.updateSettings({
        base_fare: baseFare,
        per_km_rate: perKmRate,
        shared_discount: sharedDiscount / 100,
        commission_rate: commission / 100
      });
      alert("Sozlamalar muvaffaqiyatli saqlandi!");
    } catch (error) {
      alert("Saqlashda xatolik yuz berdi");
    }
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Tizim Sozlamalari</h2>
          <p className="page-subtitle">Tariflar, komissiyalar va umumiy sozlamalar</p>
        </div>
        <button className="save-btn" onClick={handleSave} disabled={loading}>
          <Save size={20} />
          <span>{loading ? 'Yuklanmoqda...' : 'Saqlash'}</span>
        </button>
      </div>

      <div className="settings-grid">
        <div className="settings-card glass">
          <div className="card-header">
            <DollarSign size={20} color="#6C5CE7" />
            <h3>Tariflar & Narxlar</h3>
          </div>
          <div className="card-body">
            <div className="input-group">
              <label>Boshlang'ich narx (Baza)</label>
              <div className="input-with-suffix">
                <input 
                  type="number" 
                  value={baseFare} 
                  onChange={(e) => setBaseFare(Number(e.target.value))} 
                />
                <span>UZS</span>
              </div>
              <p className="input-help">Safarning minimal narxi</p>
            </div>

            <div className="input-group">
              <label>Har 1 km uchun narx</label>
              <div className="input-with-suffix">
                <input 
                  type="number" 
                  value={perKmRate} 
                  onChange={(e) => setPerKmRate(Number(e.target.value))} 
                />
                <span>UZS</span>
              </div>
              <p className="input-help">Masofaga qarab qo'shiladigan narx</p>
            </div>

            <div className="input-group">
              <label>Sherikli safar chegirmasi</label>
              <div className="input-with-suffix">
                <input 
                  type="number" 
                  value={sharedDiscount} 
                  onChange={(e) => setSharedDiscount(Number(e.target.value))} 
                />
                <span>%</span>
              </div>
              <p className="input-help">2-3 yo'lovchi bo'lsa beriladigan chegirma</p>
            </div>
          </div>
        </div>

        <div className="settings-card glass">
          <div className="card-header">
            <Percent size={20} color="#FF9F43" />
            <h3>Biznes & Komissiya</h3>
          </div>
          <div className="card-body">
            <div className="input-group">
              <label>Xizmat Komissiyasi</label>
              <div className="input-with-suffix">
                <input 
                  type="number" 
                  value={commission} 
                  onChange={(e) => setCommission(Number(e.target.value))} 
                />
                <span>%</span>
              </div>
              <p className="input-help">Haydovchi safaridan olinadigan ulush (default 5%)</p>
            </div>

            <div className="info-box">
              <Info size={18} color="#00DBDE" />
              <p>Komissiya miqdori o'zgartirilsa, barcha yangi safarlarga ta'sir qiladi.</p>
            </div>
            
            <button className="reset-btn">
              <RefreshCcw size={16} />
              <span>Standartga qaytarish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
