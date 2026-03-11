
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNotification } from '../../contexts/NotificationContext';
import Plus from 'lucide-react/dist/esm/icons/plus';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';

interface Ticket {
    id: number;
    project_id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in-progress' | 'closed';
    created_at: string;
}

interface TicketNote {
    id: number;
    ticket_id: number;
    content: string;
    created_at: string;
}

export const TicketSystem: React.FC<{ projectId: string; tickets: Ticket[]; notes: TicketNote[]; onUpdate: () => void }> = ({ projectId, tickets, notes, onUpdate }) => {
    const notify = useNotification();
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [newNote, setNewNote] = useState('');

    const handleCreate = async () => {
        if (!newTitle) return;

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, title: newTitle, description: newDesc, priority: newPriority, status: 'open' }),
            });

            if (res.ok) {
                setNewTitle('');
                setNewDesc('');
                setNewPriority('medium');
                notify.success('Ticket created');
                onUpdate();
            } else {
                notify.error('Failed to create ticket');
            }
        } catch (e) {
            notify.error('Error creating ticket');
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) onUpdate();
            else notify.error('Failed to update status');
        } catch (e) {
            notify.error('Error updating status');
        }
    };

    const handleAddNote = async (ticketId: number) => {
        if (!newNote.trim()) return;
        try {
            const res = await fetch('/api/ticket-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticket_id: ticketId, content: newNote }),
            });
            if (res.ok) {
                setNewNote('');
                onUpdate();
                notify.success('Note added');
            } else {
                notify.error('Failed to add note');
            }
        } catch (e) {
            notify.error('Error adding note');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>New Ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Input placeholder="Ticket Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            <select
                                className="flex h-12 w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
                                value={newPriority}
                                onChange={e => setNewPriority(e.target.value)}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none"
                                placeholder="Description"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" /> Create Ticket
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {tickets.length === 0 && <p className="text-gray-500 text-center py-4">No tickets yet.</p>}
                {tickets.map(ticket => (
                    <div key={ticket.id} className={`border rounded-lg p-4 bg-white dark:bg-gray-800 transition-all ${activeTicketId === ticket.id ? 'border-primary ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => setActiveTicketId(activeTicketId === ticket.id ? null : ticket.id)}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{ticket.title}</h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                        {ticket.priority}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                            ticket.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{ticket.description}</p>
                            </div>
                            <div className="flex gap-2">
                                {ticket.status === 'open' && (
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, 'in-progress'); }}>
                                        <AlertCircle className="w-4 h-4 text-blue-500" />
                                    </Button>
                                )}
                                {ticket.status !== 'closed' && (
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, 'closed'); }}>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Collapsible details/notes section */}
                        {activeTicketId === ticket.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="font-semibold text-sm mb-2 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Notes & Updates
                                </h4>
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {notes.filter(n => n.ticket_id === ticket.id).length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No notes added.</p>
                                    ) : (
                                        notes.filter(n => n.ticket_id === ticket.id).map(note => (
                                            <div key={note.id} className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                                                <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddNote(ticket.id);
                                        }}
                                    />
                                    <Button size="sm" onClick={() => handleAddNote(ticket.id)}>Post</Button>
                                </div>
                            </div>
                        )}
                        <div className="mt-2 text-xs text-gray-400 flex justify-between">
                            <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                            <span>{notes.filter(n => n.ticket_id === ticket.id).length} notes</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
