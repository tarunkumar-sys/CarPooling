import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, MessageSquare } from 'lucide-react';
import { User as UserType } from '../../types';
import { Chat } from '../ride/Chat';

export const Inbox = ({ user }: { user: UserType | null }) => {
    const [chats, setChats] = useState<any[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetch(`/api/inbox/${user.id}`)
                .then(res => res.json())
                .then(setChats);
        }
    }, [user]);

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 pt-24">
            <div className="flex items-center gap-3 mb-10">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <MessageSquare className="text-primary w-6 h-6" />
                </div>
                <h2 className="text-3xl font-display font-bold text-primary">Your Messages</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 h-[600px]">
                <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Active Conversations</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chats.map((chat, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveChat(chat)}
                                className={`w-full p-6 flex items-center gap-4 text-left border-b border-slate-50 transition-colors ${activeChat?.ride_id === chat.ride_id ? 'bg-orange-50/50 border-l-4 border-l-primary' : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <User className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate">{chat.other_party_name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{chat.origin} → {chat.destination}</p>
                                </div>
                            </button>
                        ))}
                        {chats.length === 0 && (
                            <div className="p-10 text-center text-slate-400">
                                <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">No messages yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    {activeChat ? (
                        <Chat
                            rideId={activeChat.ride_id}
                            currentUser={user}
                            otherUser={{ id: activeChat.other_party_id, name: activeChat.other_party_name }}
                        />
                    ) : (
                        <div className="h-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                            <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
                            <p className="font-medium">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
