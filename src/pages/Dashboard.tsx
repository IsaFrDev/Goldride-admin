import React from 'react';
import { 
  Users, 
  Car, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Activity,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { adminSocketService } from '../services/socket';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [recentRides, setRecentRides] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    adminSocketService.connect();
    const unsubscribe = adminSocketService.subscribe((data) => {
      if (data.type === 'admin_notification') {
        if (data.notification_type === 'fraud_alert') {
          setNotifications(prev => [data, ...prev].slice(0, 5));
        } else if (data.notification_type === 'ride_update') {
          // Real-time refresh of data when a ride is updated
          fetchStats(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStats = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await adminAPI.getStats();
      const { stats: statsRaw, chart_data, recent_rides } = response.data;
      
      // Map icons back to stats
      const icons = [
        <Car size={22} color="#000" />,
        <Users size={22} color="#000" />,
        <TrendingUp size={22} color="#000" />,
        <Clock size={22} color="#000" />
      ];
      const bgs = ['#FFB800', '#FFB800', '#FFB800', '#FFB800'];
      
      const statsWithIcons = statsRaw.map((s: any, i: number) => ({
        ...s,
        icon: icons[i],
        bg: bgs[i]
      }));

      setStats(statsWithIcons);
      setChartData(chart_data);
      setRecentRides(recent_rides);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(false), 5000); // 5s real-time polling
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="animate-spin" size={48} color="#6C5CE7" />
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Xatolik yuz berdi</h3>
        <p>Ma'lumotlarni yuklashda muammo bo'ldi. Iltimos, qayta urinib ko'ring.</p>
        <button onClick={() => fetchStats(true)} className="retry-btn">Qayta urinish</button>
      </div>
    );
  }
  return (
    <div className="dashboard animate-fade-in">
      <div className="welcome-header">
        <h2 className="page-title">Asosiy Dashboard</h2>
        <p className="page-subtitle">Bugungi ko'rsatkichlar va analitika</p>
      </div>

      <div className="stats-grid">
        {(stats.length > 0 ? stats : [
          { title: 'UMUMIY DAROMAD', value: '0 UZS', change: '0%', isUp: true, bg: '#FFB800', icon: <TrendingUp size={22} color="#000" /> },
          { title: 'AKTIV FOYDALANUVCHILAR', value: '0', change: '0%', isUp: true, bg: '#FFB800', icon: <Users size={22} color="#000" /> },
          { title: 'BAJARILGAN SAFARLAR', value: '0', change: '0%', isUp: true, bg: '#FFB800', icon: <Car size={22} color="#000" /> },
          { title: 'O\'RTACHA NARX', value: '0 UZS', change: '0%', isUp: true, bg: '#FFB800', icon: <Clock size={22} color="#000" /> }
        ]).map((stat, i) => (
          <div key={i} className="stat-card glass">
            <div className="stat-header">
              <div className="stat-icon" style={{ backgroundColor: stat.bg }}>
                {stat.icon}
              </div>
              <div className={`stat-change ${stat.isUp ? 'up' : 'down'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change || '0%'}
              </div>
            </div>
            <div className="stat-content">
              <span className="stat-title">{stat.title}</span>
              <h3 className="stat-value">{stat.value && stat.value !== 'NaN' ? stat.value : '0'}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card glass">
          <div className="chart-header">
            <h4 className="chart-title">Haftalik Safarlar O'sishi</h4>
            <button className="more-btn"><MoreVertical size={18} /></button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData.length > 0 ? chartData : [
                {name: 'Du', rides: 0}, {name: 'Se', rides: 0}, {name: 'Ch', rides: 0}, 
                {name: 'Pa', rides: 0}, {name: 'Ju', rides: 0}, {name: 'Sh', rides: 0}, {name: 'Ya', rides: 0}
              ]}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB800" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F0F0F', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', padding: '12px' }}
                  itemStyle={{ color: '#FFB800', fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(255, 184, 0, 0.2)', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="rides" stroke="#FFB800" strokeWidth={4} fillOpacity={1} fill="url(#colorRides)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-header">
            <h4 className="chart-title">Kunlik Daromad</h4>
            <button className="more-btn"><MoreVertical size={18} /></button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData.length > 0 ? chartData : [
               {name: 'Du', revenue: 0}, {name: 'Se', revenue: 0}, {name: 'Ch', revenue: 0}, 
               {name: 'Pa', revenue: 0}, {name: 'Ju', revenue: 0}, {name: 'Sh', revenue: 0}, {name: 'Ya', revenue: 0}
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748B', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0F0F0F', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                />
                <Bar dataKey="revenue" fill="#FFB800" radius={[8, 8, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="alerts-section glass animate-slide-in">
          <div className="section-header">
            <AlertTriangle size={24} color="#E53935" />
            <h4>⚠️ Diqqat: Shubhali Faollik</h4>
          </div>
          <div className="alerts-list">
            {notifications.map((notif, i) => (
              <div key={i} className="alert-card">
                <div className="alert-info">
                  <strong>{notif.user_phone}</strong>
                  <p>{notif.message}</p>
                </div>
                <button className="resolve-btn">Bog'lanish</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="activity-section glass">
        <div className="activity-header">
          <div className="activity-title">
            <Activity size={24} color="#FFB800" />
            <h4>So'nggi Faollik</h4>
          </div>
          <button className="view-all">Barcha Safarlar</button>
        </div>
        <div className="table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Yo'lovchi</th>
                <th>Haydovchi</th>
                <th>Yo'nalish / Narx</th>
                <th>Holat</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {recentRides.length > 0 ? recentRides.map((ride) => (
                <tr key={ride.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar" style={{backgroundColor: 'rgba(255,184,0,0.1)', color: '#FFB800'}}>
                        {ride.user.charAt(0)}
                      </div>
                      <div>
                        <div style={{fontWeight: 700}}>{ride.user}</div>
                        <div className="table-sub">{ride.user_phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontWeight: 600}}>{ride.driver}</div>
                  </td>
                  <td>
                    <div style={{fontWeight: 800, color: '#FFF'}}>{Number(ride.price).toLocaleString()} UZS</div>
                    <div className="table-sub">{ride.service_type || 'Oddiy'}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      ride.status === 'completed' ? 'success' : 
                      ride.status === 'cancelled' ? 'danger' : 'warning'
                    }`}>
                      {ride.status_display}
                    </span>
                  </td>
                  <td><button className="table-action">Batafsil</button></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '60px', color: '#94A3B8'}}>
                    <div style={{opacity: 0.5, marginBottom: '10px'}}><Activity size={48} /></div>
                    Hozircha faollik mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
