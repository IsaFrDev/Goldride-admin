import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign,
  ArrowUpRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { adminAPI } from '../services/api';
import './Common.css';

const COLORS = ['#6C5CE7', '#00DBDE', '#FF9F43', '#FF5E62'];

const Analytics: React.FC = () => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading-container">Analitika yuklanmoqda...</div>;
  }

  const pieData = [
    { name: 'Sherikli', value: data?.overview?.shared_count || 0 },
    { name: 'Oddiy', value: data?.overview?.regular_count || 0 },
  ];

  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analitika Markazi</h2>
          <p className="page-subtitle">Tizimning 30 kunlik ko'rsatkichlari</p>
        </div>
        <div className="date-picker-mock">
          <Calendar size={18} />
          <span>Oxirgi 30 kun</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{background: '#F0EDFF'}}>
            <DollarSign size={24} color="#6C5CE7" />
          </div>
          <div className="stat-content">
            <label>Umumiy Daromad</label>
            <h3>{data?.overview?.total_revenue?.toLocaleString()} UZS</h3>
            <span className="trend up"><ArrowUpRight size={14} /> +12%</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{background: '#E0F9FA'}}>
            <Users size={24} color="#00DBDE" />
          </div>
          <div className="stat-content">
            <label>Aktiv Foydalanuvchilar</label>
            <h3>{data?.growth_data?.reduce((acc: any, curr: any) => acc + curr.users, 0)}</h3>
            <span className="trend up"><ArrowUpRight size={14} /> +5%</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{background: '#FFF4E8'}}>
            <Car size={24} color="#FF9F43" />
          </div>
          <div className="stat-content">
            <label>Bajarilgan Safarlar</label>
            <h3>{data?.overview?.shared_count + data?.overview?.regular_count}</h3>
            <span className="trend up"><ArrowUpRight size={14} /> +8%</span>
          </div>
        </div>
      </div>

      <div className="charts-main-grid">
        <div className="chart-card glass large">
          <div className="chart-header">
            <h3><TrendingUp size={18} /> O'sish Grafiklari</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data?.growth_data}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="rides" stroke="#6C5CE7" strokeWidth={3} fillOpacity={1} fill="url(#colorRides)" name="Safarlar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-secondary-column">
          <div className="chart-card glass">
            <div className="chart-header">
              <h3><PieChartIcon size={18} /> Safar Turlari</h3>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                <div className="legend-item"><span className="dot" style={{background: COLORS[0]}}></span> Sherikli</div>
                <div className="legend-item"><span className="dot" style={{background: COLORS[1]}}></span> Oddiy</div>
              </div>
            </div>
          </div>

          <div className="chart-card glass">
            <div className="chart-header">
              <h3><BarChartIcon size={18} /> Daromad Ulushi</h3>
            </div>
            <div className="chart-body">
              <div className="revenue-split">
                <div className="split-item">
                  <label>Oddiy Safarlar</label>
                  <div className="progress-bar">
                    <div className="progress" style={{width: '65%', background: COLORS[0]}}></div>
                  </div>
                  <span>{data?.overview?.regular_revenue?.toLocaleString()} UZS</span>
                </div>
                <div className="split-item">
                  <label>Sherikli Safarlar</label>
                  <div className="progress-bar">
                    <div className="progress" style={{width: '35%', background: COLORS[1]}}></div>
                  </div>
                  <span>{data?.overview?.shared_revenue?.toLocaleString()} UZS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
