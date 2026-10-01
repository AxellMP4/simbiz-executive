import React, { useState } from 'react';
import { SystemMessage } from '../../types/simulation';
import { Mail, Check, AlertCircle, Clock, Send, ShieldAlert, UserCheck } from 'lucide-react';

interface MessagingViewProps {
  messages: SystemMessage[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  messages,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string>(
    messages[0]?.id || ''
  );
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.read;
    if (filter === 'urgent') return m.priority === 'urgent' || m.priority === 'high';
    return true;
  });

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || messages[0];

  return (
    <div className="flex-1 overflow-hidden p-6 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-pink-400" />
            <span>Messagerie & Alertes de Gouvernance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Communications du Conseil d'Administration, de la Direction Financière et des partenaires
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Functional filter segmented buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-md">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filter === 'all' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({messages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filter === 'unread' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Non lus ({messages.filter(m => !m.read).length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filter === 'urgent' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Urgents
            </button>
          </div>

          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tout marquer comme lu</span>
          </button>
        </div>
      </div>

      {/* Two-Pane Mail Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden border border-slate-800 rounded-lg bg-slate-900">
        {/* Left Pane: Message List */}
        <div className="w-80 sm:w-96 border-r border-slate-800 flex flex-col overflow-y-auto divide-y divide-slate-800/80">
          {filteredMessages.map(msg => {
            const isSelected = msg.id === selectedMessage?.id;
            return (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessageId(msg.id);
                  onMarkAsRead(msg.id);
                }}
                className={`p-3.5 cursor-pointer transition-colors text-left flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-sky-950/40 border-l-4 border-l-sky-500'
                    : msg.read
                    ? 'hover:bg-slate-850/60 opacity-80'
                    : 'bg-slate-900 hover:bg-slate-850 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate">{msg.sender}</span>
                  <span className="text-[10px] font-mono text-slate-500">{msg.date}</span>
                </div>
                <div className="text-xs text-slate-300 font-medium line-clamp-1">{msg.subject}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                  {msg.priority === 'urgent' && (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>URGENT</span>
                    </span>
                  )}
                  {msg.priority === 'high' && (
                    <span className="text-amber-400 font-semibold">PRIORITAIRE</span>
                  )}
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />}
                </div>
              </div>
            );
          })}
          {filteredMessages.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Aucun message dans cette catégorie.
            </div>
          )}
        </div>

        {/* Right Pane: Message Viewer */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-slate-950/60">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      {selectedMessage.sender.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{selectedMessage.sender}</div>
                      <div className="text-xs text-slate-400">{selectedMessage.role}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{selectedMessage.date}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-4">{selectedMessage.subject}</h3>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line space-y-3">
                {selectedMessage.content}
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>PolyTech - IBBA KEDGE Simulation</span>
                <span>Référence : {selectedMessage.id}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Sélectionnez un message pour l'afficher
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
