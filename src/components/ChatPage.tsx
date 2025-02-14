import { useAuth } from '@/context/AuthProvider';
import { Client } from '@stomp/stompjs';

let stompClient: Client | null = null;

export default function ChatPage() {
    const newLocal = useAuth();
    return <div>Chat page</div>;
}
