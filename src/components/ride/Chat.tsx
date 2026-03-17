import { useState, useEffect, FormEvent, useRef } from 'react';
import { User, Send } from 'lucide-react';
import { User as UserType } from '../../types';

export const Chat = ({ rideId, currentUser, otherUser }: { rideId: number, currentUser: UserType, otherUser: { id: number, name: string } }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = () => {
            fetch(`/api/messages/${rideId}`)
                .then(res => res.json())
                .then(setMessages);
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [rideId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ride_id: rideId,
                sender_id: currentUser.id,
                receiver_id: otherUser.id,
                content: newMessage
            })
        });
        if (res.ok) {
            setNewMessage('');
            // Optimistic update
            setMessages([...messages, { sender_id: currentUser.id, content: newMessage, timestamp: new Date() }]);
        }
    };

    return (
        <div className="flex flex-col h-[400px] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold">{otherUser.name}</h4>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Online</p>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender_id === currentUser.id
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-100 shadow-sm'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 bg-white">
                <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button className="bg-primary text-white p-2 rounded-lg hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};
