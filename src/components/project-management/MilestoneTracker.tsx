
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNotification } from '../../contexts/NotificationContext';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Circle from 'lucide-react/dist/esm/icons/circle';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';

interface Milestone {
    id: number;
    project_id: number;
    title: string;
    due_date: string;
    status: 'pending' | 'completed';
}

export const MilestoneTracker: React.FC<{ projectId: string; milestones: Milestone[]; onUpdate: () => void }> = ({ projectId, milestones, onUpdate }) => {
    const notify = useNotification();
    const [newMilestone, setNewMilestone] = useState('');
    const [newDate, setNewDate] = useState('');

    const handleCreate = async () => {
        if (!newMilestone || !newDate) return;

        try {
            const res = await fetch('/api/milestones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, title: newMilestone, due_date: newDate, status: 'pending' }),
            });

            if (res.ok) {
                setNewMilestone('');
                setNewDate('');
                notify.success('Milestone created');
                onUpdate();
            } else {
                notify.error('Failed to create milestone');
            }
        } catch (e) {
            notify.error('Error creating milestone');
        }
    };

    const handleToggleStatus = async (milestone: Milestone) => {
        const newStatus = milestone.status === 'pending' ? 'completed' : 'pending';
        try {
            const res = await fetch(`/api/milestones/${milestone.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                onUpdate();
            } else {
                notify.error('Failed to update milestone');
            }
        } catch (e) {
            notify.error('Error updating milestone');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this milestone?')) return;
        try {
            const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
            if (res.ok) {
                notify.success('Milestone deleted');
                onUpdate();
            } else {
                notify.error('Failed to delete');
            }
        } catch (e) {
            notify.error('Error deleting milestone');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mb-6">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Milestone Title"
                            value={newMilestone}
                            onChange={(e) => setNewMilestone(e.target.value)}
                        />
                        <Input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-48"
                        />
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" /> Add
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {milestones.length === 0 && <p className="text-gray-500 text-center py-4">No milestones yet.</p>}
                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleToggleStatus(milestone)} className="text-primary hover:scale-110 transition-transform">
                                    {milestone.status === 'completed' ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-400" />
                                    )}
                                </button>
                                <div>
                                    <p className={`font-semibold ${milestone.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>{milestone.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(milestone.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
