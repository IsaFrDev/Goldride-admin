import React from 'react';
import { Navigation, Clock, CheckCircle, Trash2, XCircle, MapPin, ExternalLink, Car } from 'lucide-react';
import { adminAPI } from '../services/api';
import './Common.css';

const Rides: React.FC = () => {
  const [rides, setRides] = React.useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, item: any, type: 'ride' | 'request' } | null>(null);
  
  // External dispatch modal state
  const [dispatchModal, setDispatchModal] = React.useState<{
    show: boolean;
    request: any;
    provider: string;
    step: 'map' | 'eta' | 'waiting';
    etaMinutes: string;
    orderId: string;
  } | null>(null);

  const fetchRides = async () => {
    try {
      const response = await adminAPI.getRides();
      setRides(response.data.rides || []);
      setPendingRequests(response.data.pending_requests || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 10000);
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, item: any, type: 'ride' | 'request') => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, item, type });
  };

  const handleAction = async (action: 'cancel' | 'delete') => {
    if (!contextMenu) return;
    const { item, type } = contextMenu;
    const confirmMsg = action === 'cancel' 
      ? "Haqiqatan ham bekor qilmoqchimisiz? Yo'lovchi xabardor qilinadi."
      : "Haqiqatan ham bazadan o'chirib tashlamoqchimisiz?";
    if (!window.confirm(confirmMsg)) return;
    try {
      if (type === 'ride') {
        if (action === 'cancel') await adminAPI.cancelRide(item.id);
        else await adminAPI.deleteRide(item.id);
      } else {
        if (action === 'cancel') await adminAPI.cancelRequest(item.id);
        else await adminAPI.deleteRequest(item.id);
      }
      fetchRides();
    } catch (err) {
      alert('Amalni bajarishda xatolik yuz berdi');
    }
    setContextMenu(null);
  };

  // ===== EXTERNAL DISPATCH FLOW =====
  const openDispatchModal = (request: any, provider: string) => {
    let url = '';
    if (provider === 'Yandex') {
      url = `https://3.yandex.uz/ru_uz/?from_lat=${request.pickup_lat}&from_lon=${request.pickup_lng}&to_lat=${request.drop_lat}&to_lon=${request.drop_lng}&utm_source=goldride`;
    } else if (provider === 'Fasten') {
      url = `https://fasten.com/uz/tashkent/`;
    } else if (provider === 'Uklon') {
      url = `https://uklon.com.ua/`;
    }
    if (url) window.open(url, '_blank');

    setDispatchModal({
      show: true,
      request,
      provider,
      step: 'map',
      etaMinutes: '',
      orderId: ''
    });
  };

  const handleDispatchConfirm = async () => {
    if (!dispatchModal) return;
    const { request, provider, etaMinutes, orderId } = dispatchModal;
    if (!etaMinutes || isNaN(Number(etaMinutes))) {
      alert("Iltimos, taxminiy kelish vaqtini kiriting (daqiqa)");
      return;
    }
    try {
      await adminAPI.dispatchExternal(request.id, provider, orderId || `EXT_${Date.now()}`, Number(etaMinutes));
      setDispatchModal({ ...dispatchModal, step: 'waiting' });
      fetchRides();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleExternalArrived = async (requestId: number) => {
    if (!window.confirm("Tashqi haydovchi yetib keldimi? Yo'lovchiga xabar yuboriladi.")) return;
    try {
      await adminAPI.externalArrived(requestId);
      alert("Yo'lovchiga 'Haydovchi yetib keldi' xabari yuborildi!");
      setDispatchModal(null);
      fetchRides();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const handleUpdateEta = async (requestId: number) => {
    const newEta = prompt("Yangi taxminiy vaqtni kiriting (daqiqa):");
    if (!newEta || isNaN(Number(newEta))) return;
    try {
      await adminAPI.updateExternalEta(requestId, Number(newEta));
      alert("Vaqt yangilandi! Yo'lovchiga xabar yuborildi.");
      fetchRides();
    } catch (error) {
      alert('Xatolik yuz berdi');
    }
  };

  const getStatusIcon = (s: string) => {
    switch(s) {
      case 'started': return <Navigation size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'external_pending': return <Car size={14} style={{color: '#F59E0B'}} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusDisplay = (s: string) => {
    switch(s) {
      case 'searching': return 'Qidirilmoqda';
      case 'driver_found': return 'Topildi';
      case 'started': return 'Boshlandi';
      case 'completed': return 'Yakunlandi';
      case 'cancelled': return 'Bekor qilindi';
      case 'external_pending': return 'Tashqi Agregator';
      default: return s;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 60000);
    if (diff < 1) return 'Hozirgina';
    if (diff < 60) return `${diff} min oldin`;
    return `${Math.floor(diff / 60)} soat oldin`;
  };

  const isStuck = (date: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    return diff >= 5;
  };

  const getEtaRemaining = (etaDate: string) => {
    const eta = new Date(etaDate);
    const now = new Date();
    const diffMs = eta.getTime() - now.getTime();
    if (diffMs <= 0) return 'Yetib kelishi kerak!';
    const mins = Math.ceil(diffMs / 60000);
    return `~${mins} daqiqa qoldi`;
  };

  return (
    <div className="rides-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">
            Safarlar Monitori
            <span style={{fontSize: '14px', color: 'var(--text-dim)', marginLeft: '10px'}}>
              ({rides.length} safar, {pendingRequests.length} so'rov)
            </span>
          </h2>
          <p className="page-subtitle">Hozirgi faol safarlar va so'rovlar</p>
        </div>
      </div>

      {/* Stuck Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="alerts-section" style={{marginBottom: '30px'}}>
          <h3 className="section-title" style={{color: '#EF4444', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Clock size={18} /> Kutilayotgan so'rovlar (Haydovchi yo'q)
          </h3>
          <div className="rides-grid">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className={`ride-monitor-card glass ${isStuck(req.created_at) ? 'stuck-alert' : ''}`}
                onContextMenu={(e) => handleContextMenu(e, req, 'request')}
              >
                <div className="ride-card-header">
                  <span className={`status-tag ${req.status === 'external_pending' ? 'external' : 'pending'}`}>
                    {req.status === 'external_pending' ? `🚕 ${req.external_provider}` : 'Kutilmoqda'}
                  </span>
                  <span className="ride-time">{getTimeAgo(req.created_at)}</span>
                </div>
                <div className="route-info">
                  <div className="point-text"><label>Yo'lovchi:</label> <span>{req.user?.first_name} {req.user?.last_name || ''}</span></div>
                  <div className="point-text"><label>📍 Olish:</label> <span className="truncate">{req.pickup_address}</span></div>
                  <div className="point-text"><label>🏁 Borish:</label> <span className="truncate">{req.drop_address}</span></div>
                  <div className="point-text"><label>Tarif:</label> <span style={{textTransform: 'capitalize', color: '#FFB800'}}>{req.car_category || 'Economy'}</span></div>
                </div>

                {/* External pending: show ETA and actions */}
                {req.status === 'external_pending' ? (
                  <div style={{marginTop: '12px'}}>
                    {req.external_eta && (
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '10px', padding: '10px 14px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <Clock size={16} style={{color: '#F59E0B'}} />
                        <span style={{color: '#F59E0B', fontWeight: '600', fontSize: '13px'}}>
                          {getEtaRemaining(req.external_eta)}
                        </span>
                      </div>
                    )}
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        className="dispatch-btn yandex"
                        style={{flex: 1, background: '#10B981', borderColor: '#10B981'}}
                        onClick={() => handleExternalArrived(req.id)}
                      >
                        ✅ Keldi!
                      </button>
                      <button
                        className="dispatch-btn fasten"
                        style={{flex: 1}}
                        onClick={() => handleUpdateEta(req.id)}
                      >
                        🕐 Vaqtni o'zgartirish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="external-dispatch-actions" style={{marginTop: '15px', display: 'flex', gap: '8px'}}>
                    <button className="dispatch-btn yandex" onClick={() => openDispatchModal(req, 'Yandex')}>Yandex</button>
                    <button className="dispatch-btn fasten" onClick={() => openDispatchModal(req, 'Fasten')}>Fasten</button>
                    <button className="dispatch-btn uklon" onClick={() => openDispatchModal(req, 'Uklon')}>Uklon</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="section-title" style={{marginBottom: '15px'}}>Barcha Safarlar</h3>
      <div className="rides-grid">
        {loading ? (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#94A3B8'}}>Ma'lumotlar yuklanmoqda...</div>
        ) : rides.map((ride) => {
          const firstP = ride.passengers?.[0];
          const passengerName = firstP?.user?.first_name || 'Aniqlanmagan';
          const driverName = ride.driver?.user?.first_name ? `${ride.driver.user.first_name} ${ride.driver.user.last_name || ''}` : 'Qidirilmoqda...';
          return (
            <div
              key={ride.id}
              className="ride-monitor-card glass"
              onContextMenu={(e) => handleContextMenu(e, ride, 'ride')}
            >
              <div className="ride-card-header">
                <span className={`status-tag ${ride.status}`}>
                  {getStatusIcon(ride.status)}
                  {getStatusDisplay(ride.status)}
                </span>
                <span className="ride-time">{getTimeAgo(ride.created_at)}</span>
              </div>

              {ride.external_provider && (
                <div className="external-info" style={{fontSize: '11px', color: '#F59E0B', marginBottom: '10px'}}>
                  Hamkor: <strong>{ride.external_provider}</strong> | ID: {ride.external_order_id}
                </div>
              )}

              <div className="route-info">
                <div className="route-line"></div>
                <div className="route-point">
                  <div className="dot green"></div>
                  <div className="point-text">
                    <label>Chiqish (Qayerdan)</label>
                    <span className="truncate" title={firstP?.pickup_address}>{firstP?.pickup_address || 'Manzil aniqlanmagan'}</span>
                  </div>
                </div>
                <div style={{height: '24px'}}></div>
                <div className="route-point">
                  <div className="dot purple"></div>
                  <div className="point-text">
                    <label>Tushish (Qayerga)</label>
                    <span className="truncate" title={firstP?.drop_address}>{firstP?.drop_address || 'Manzil aniqlanmagan'}</span>
                  </div>
                </div>
              </div>

              <div className="ride-details-row">
                <div className="detail-item">
                  <label>Yo'lovchi</label>
                  <span>{passengerName}</span>
                </div>
                <div className="detail-item">
                  <label>Haydovchi / Mashina</label>
                  <span style={{color: ride.driver ? '#FFF' : 'var(--text-dim)'}}>{driverName}</span>
                  {ride.driver?.vehicle && (
                    <span style={{fontSize: '11px', color: '#10B981', display: 'block', marginTop: '2px'}}>
                      {ride.driver.vehicle.car_class_display || 'Ekonom'} • {ride.driver.vehicle.make}
                    </span>
                  )}
                </div>
                <div className="detail-item align-right">
                  <label>Narx / Masofa</label>
                  <span className="price-bold">{Number(ride.total_price || 0).toLocaleString()} UZS</span>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && rides.length === 0 && (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#94A3B8'}}>Hozircha safarlar mavjud emas</div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="admin-context-menu glass"
          style={{
            position: 'fixed', top: contextMenu.y, left: contextMenu.x,
            zIndex: 9999, padding: '6px', borderRadius: '12px', minWidth: '160px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', background: 'rgba(15, 15, 15, 0.95)'
          }}
        >
          <div
            onClick={() => handleAction('cancel')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', cursor: 'pointer', color: '#F59E0B',
              borderRadius: '8px', fontSize: '13px', fontWeight: '600'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <XCircle size={16} />
            <span>Bekor qilish</span>
          </div>
          <div
            onClick={() => handleAction('delete')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', cursor: 'pointer', color: '#EF4444',
              borderRadius: '8px', fontSize: '13px', fontWeight: '600'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 size={16} />
            <span>O'chirish (Bazadan)</span>
          </div>
        </div>
      )}

      {/* External Dispatch Modal */}
      {dispatchModal?.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setDispatchModal(null)}>
          <div
            className="glass"
            style={{
              width: '520px', maxHeight: '80vh', borderRadius: '20px',
              padding: '28px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(20, 20, 20, 0.98)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(255,204,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ExternalLink size={20} style={{color: '#FFB800'}} />
                </div>
                <div>
                  <h3 style={{color: '#FFF', fontSize: '18px', fontWeight: '700', margin: 0}}>{dispatchModal.provider}</h3>
                  <p style={{color: '#94A3B8', fontSize: '12px', margin: 0}}>Tashqi xizmatga yo'naltirish</p>
                </div>
              </div>
              <button onClick={() => setDispatchModal(null)} style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8',
                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px'
              }}>✕</button>
            </div>

            {/* Map */}
            <div style={{
              borderRadius: '14px', overflow: 'hidden', marginBottom: '16px',
              border: '1px solid rgba(255,255,255,0.08)', height: '220px'
            }}>
              <iframe
                width="100%" height="220" style={{border: 'none'}}
                title="Ride Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${dispatchModal.request.pickup_lng - 0.02}%2C${dispatchModal.request.pickup_lat - 0.01}%2C${dispatchModal.request.drop_lng + 0.02}%2C${dispatchModal.request.drop_lat + 0.01}&layer=mapnik&marker=${dispatchModal.request.pickup_lat}%2C${dispatchModal.request.pickup_lng}`}
              />
            </div>

            {/* Route info */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
              padding: '14px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
                <MapPin size={16} style={{color: '#10B981', flexShrink: 0, marginTop: '2px'}} />
                <div>
                  <span style={{color: '#94A3B8', fontSize: '11px'}}>Olish joyi</span>
                  <p style={{color: '#FFF', fontSize: '13px', margin: '2px 0 0 0'}}>{dispatchModal.request.pickup_address}</p>
                </div>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <MapPin size={16} style={{color: '#8B5CF6', flexShrink: 0, marginTop: '2px'}} />
                <div>
                  <span style={{color: '#94A3B8', fontSize: '11px'}}>Borish joyi</span>
                  <p style={{color: '#FFF', fontSize: '13px', margin: '2px 0 0 0'}}>{dispatchModal.request.drop_address}</p>
                </div>
              </div>
            </div>

            {dispatchModal.step === 'map' || dispatchModal.step === 'eta' ? (
              <>
                <div style={{marginBottom: '16px'}}>
                  <label style={{color: '#94A3B8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px'}}>
                    Taxminiy kelish vaqti (daqiqa)
                  </label>
                  <input
                    type="number"
                    value={dispatchModal.etaMinutes}
                    onChange={(e) => setDispatchModal({...dispatchModal, etaMinutes: e.target.value})}
                    placeholder="Masalan: 7"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#FFF', fontSize: '16px', fontWeight: '600',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{marginBottom: '20px'}}>
                  <label style={{color: '#94A3B8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px'}}>
                    {dispatchModal.provider} buyurtma ID (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={dispatchModal.orderId}
                    onChange={(e) => setDispatchModal({...dispatchModal, orderId: e.target.value})}
                    placeholder="Buyurtma raqami..."
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#FFF', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleDispatchConfirm}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                    border: 'none', color: '#000', fontSize: '15px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  <Car size={18} />
                  Buyurtmani yuborish
                </button>
              </>
            ) : (
              <div style={{textAlign: 'center', padding: '10px 0'}}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)', margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircle size={28} style={{color: '#10B981'}} />
                </div>
                <h4 style={{color: '#FFF', margin: '0 0 8px 0'}}>Buyurtma yuborildi!</h4>
                <p style={{color: '#94A3B8', fontSize: '13px', margin: '0 0 20px 0'}}>
                  {dispatchModal.provider} haydovchisi ~{dispatchModal.etaMinutes} daqiqada yetib keladi
                </p>
                <button
                  onClick={() => handleExternalArrived(dispatchModal.request.id)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none', color: '#FFF', fontSize: '15px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }}
                >
                  ✅ Haydovchi yetib keldi!
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rides;
