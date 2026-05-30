import { useState } from "react";
import { Avatar } from "../../components/owner/Avatar";
import { Send } from "lucide-react";
interface ChatMessage {
    from: "me" | "them";
    text: string;
    time: string;
}
interface Message {
    id: number;
    name: string;
    avatar: string;
    listing: string;
    lastMsg: string;
    time: string;
    unread: number;
    messages: ChatMessage[];
}
const mockMessages: Message[] = [
    { id: 1, name: "Arjun Sharma", avatar: "AS", listing: "Vintage Camera Kit", lastMsg: "Is the 50mm lens included?", time: "10:32 AM", unread: 2, messages: [
        { from: "them", text: "Hi! Is the 50mm lens included in the kit?", time: "10:28 AM" },
        { from: "them", text: "Also, can I pick it up early morning on Saturday?", time: "10:32 AM" },
    ]},
    { id: 2, name: "Priya Thapa", avatar: "PT", listing: "Mountain Bike - Trek", lastMsg: "Can you hold it for the weekend?", time: "9:15 AM", unread: 1, messages: [
        { from: "them", text: "Hello! Can you hold the bike for June 5-7?", time: "9:10 AM" },
        { from: "me", text: "Hi Priya! Yes, those dates are available. I'll hold it for you.", time: "9:12 AM" },
        { from: "them", text: "Can you hold it for the weekend?", time: "9:15 AM" },
    ]},
    { id: 3, name: "Sita Gurung", avatar: "SG", listing: "Camping Tent", lastMsg: "Perfect, see you then!", time: "Yesterday", unread: 0, messages: [
        { from: "me", text: "The tent is ready for pickup on June 10.", time: "Yesterday" },
        { from: "them", text: "Perfect, see you then!", time: "Yesterday" },
    ]},
];

export const Messages = () => {
    const [activeConv, setActiveConv] = useState<Message>(mockMessages[0]);
    const [newMsg, setNewMsg] = useState("");
    const [convs, setConvs] = useState<Message[]>(mockMessages);

    const send = () => {
        if (!newMsg.trim()) return;
        setConvs(cs => cs.map(c => c.id === activeConv.id
            ? { ...c, messages: [...c.messages, { from: "me", text: newMsg, time: "Now" }], lastMsg: newMsg, unread: 0 }
            : c
        ));
        setActiveConv(a => ({ ...a, messages: [...a.messages, { from: "me", text: newMsg, time: "Now" }] }));
        setNewMsg("");
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-stone-50">
            {/* Conversation List */}
            <div className="w-72 shrink-0 bg-white border-r border-stone-100 flex flex-col">
                <div className="p-4 border-b border-stone-100">
                    <h2 className="font-bold text-stone-800">Messages</h2>
                    <input placeholder="Search conversations..."
                        className="mt-2 w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-stone-50">
                    {convs.map(c => (
                        <button key={c.id} onClick={() => setActiveConv(c)}
                            className={`w-full flex gap-3 p-4 hover:bg-stone-50 transition-colors text-left ${activeConv.id === c.id ? "bg-amber-50" : ""}`}>
                            <div className="relative">
                                <Avatar initials={c.avatar} size="md" color={activeConv.id === c.id ? "bg-amber-600" : "bg-stone-600"} />
                                {c.unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">{c.unread}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-semibold text-sm text-stone-800 truncate">{c.name}</p>
                                    <span className="text-xs text-stone-400 shrink-0 ml-2">{c.time}</span>
                                </div>
                                <p className="text-xs text-stone-400 truncate">{c.listing}</p>
                                <p className="text-xs text-stone-500 truncate mt-0.5">{c.lastMsg}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-stone-100 px-5 py-4 flex items-center gap-3">
                    <Avatar initials={activeConv.avatar} size="md" color="bg-stone-600" />
                    <div>
                        <p className="font-bold text-stone-800">{activeConv.name}</p>
                        <p className="text-xs text-stone-400">{activeConv.listing}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <button className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">
                            View Booking
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-stone-50">
                    {activeConv.messages.map((m, i) => (
                        <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${m.from === "me"
                                    ? "bg-amber-600 text-white rounded-br-sm"
                                    : "bg-white text-stone-700 shadow-sm border border-stone-100 rounded-bl-sm"
                                }`}>
                                <p>{m.text}</p>
                                <p className={`text-xs mt-1 ${m.from === "me" ? "text-amber-200" : "text-stone-400"}`}>{m.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="bg-white border-t border-stone-100 p-4 flex gap-3 items-end">
                    <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        rows={1} placeholder="Type a message..."
                        className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                    <button onClick={send} className="bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl transition-colors shrink-0">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
