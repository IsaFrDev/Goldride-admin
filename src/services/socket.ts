

class AdminSocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: any) => void)[] = [];

    connect() {
        if (this.socket) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Use the same base URL as the API but with ws://
        const wsUrl = `ws://${window.location.hostname}:8000/ws/admin/?token=${token}`;
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.listeners.forEach(listener => listener(data));
        };

        this.socket.onclose = () => {
            this.socket = null;
            // Reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };

        this.socket.onerror = (error) => {
            console.error('Admin WebSocket Error:', error);
            this.socket?.close();
        };
    }

    subscribe(callback: (data: any) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    disconnect() {
        this.socket?.close();
        this.socket = null;
    }
}

export const adminSocketService = new AdminSocketService();
