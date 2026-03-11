
import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNotification } from '../../contexts/NotificationContext';
import Plus from 'lucide-react/dist/esm/icons/plus';
import X from 'lucide-react/dist/esm/icons/x';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

interface Task {
    id: number;
    column_id: number;
    title: string;
    description?: string;
}

interface Column {
    id: number;
    title: string;
}

interface TaskNote {
    id: number;
    task_id: number;
    content: string;
    created_at: string;
}

// -- Components --

const TaskDetailsModal = ({ task, notes, onClose, onAddNote }: { task: Task, notes: TaskNote[], onClose: () => void, onAddNote: (content: string) => Promise<void> }) => {
    const [newNote, setNewNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!newNote.trim()) return;
        setSubmitting(true);
        await onAddNote(newNote);
        setNewNote('');
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>

                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" /> Notes
                    </h4>
                    <div className="space-y-3 mb-4">
                        {notes.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No notes yet.</p>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm">
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add update..."
                            value={newNote}
                            disabled={submitting}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newNote.trim()) {
                                    handleSubmit();
                                }
                            }}
                        />
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SortableTask = ({ task, onClick, isProcessing }: { task: Task, onClick: () => void, isProcessing: boolean }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: `task-${task.id}`, disabled: isProcessing });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={isProcessing ? undefined : onClick}
            className={`p-3 mb-2 bg-white dark:bg-gray-700 rounded shadow-sm text-sm border border-gray-200 dark:border-gray-600 transition-all relative ${isProcessing ? 'opacity-70 cursor-wait' : 'cursor-grab active:cursor-grabbing hover:border-primary/50'}`}
        >
            <p className="font-medium">{task.title}</p>
            {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded pointer-events-none">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
};

const getColumnColors = (title: string, isSource: boolean, isTarget: boolean) => {
    const t = title.toLowerCase();

    // Check if it's a drag target or source first
    if (isTarget) return 'ring-2 ring-primary ring-offset-2 bg-primary/5 dark:bg-primary/20 border-primary';
    if (isSource) return 'opacity-60 border-dashed border-2 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/20';

    // Default static colors
    if (t.includes('plan')) return 'border-t-4 border-t-gray-400 bg-gray-50/50 dark:bg-gray-800/50';
    if (t.includes('progress')) return 'border-t-4 border-t-blue-400 bg-blue-50/50 dark:bg-blue-900/10';
    if (t.includes('block')) return 'border-t-4 border-t-red-400 bg-red-50/50 dark:bg-red-900/10';
    if (t.includes('complet') || t.includes('done')) return 'border-t-4 border-t-green-400 bg-green-50/50 dark:bg-green-900/10';
    return 'border-t-4 border-t-gray-200';
};

const ColumnContainer = ({ column, tasks, onTaskClick, onAddTask, processingTaskId, isSource, isTarget }: { column: Column, tasks: Task[], onTaskClick: (task: Task) => void, onAddTask: () => void, processingTaskId: number | null, isSource: boolean, isTarget: boolean }) => {
    const { setNodeRef } = useSortable({ id: `col-${column.id}` });
    const colorClass = getColumnColors(column.title, isSource, isTarget);

    return (
        <div ref={setNodeRef} className={`p-4 rounded-lg w-72 flex-shrink-0 flex flex-col max-h-[calc(100vh-250px)] shadow-sm ${colorClass} transition-all duration-200 border-l border-r border-b border-gray-200 dark:border-gray-700`}>
            <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex justify-between items-center sticky top-0">
                {column.title}
                <span className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-500 shadow-sm">{tasks.length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto min-h-[100px] pr-2 custom-scrollbar">
                <SortableContext items={tasks.map(t => `task-${t.id}`)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <SortableTask key={task.id} task={task} onClick={() => onTaskClick(task)} isProcessing={processingTaskId === task.id} />
                    ))}
                </SortableContext>
            </div>
            <Button variant="ghost" className="mt-2 w-full justify-start text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onAddTask}>
                <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
        </div>
    );
};


export const KanbanBoard: React.FC<{ projectId: string; columns: Column[]; tasks: Task[]; notes: TaskNote[]; onUpdate: () => void }> = ({ projectId, columns, tasks, notes, onUpdate }) => {
    const notify = useNotification();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags when clicking
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Drag Visual State
    const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
    const [overColumnId, setOverColumnId] = useState<number | null>(null);

    // Adding new task state
    const [isAddingTask, setIsAddingTask] = useState<{ columnId: number } | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [processingTaskId, setProcessingTaskId] = useState<number | null>(null);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
        // Parse ID
        const activeStr = String(event.active.id);
        if (activeStr.startsWith('task-')) {
            const taskId = parseInt(activeStr.replace('task-', ''));
            const task = tasks.find(t => t.id === taskId);
            if (task) setActiveColumnId(task.column_id);
        }
    };

    const handleDragOver = (event: any) => {
        const { over } = event;
        if (!over) {
            setOverColumnId(null);
            return;
        }

        const overStr = String(over.id);

        // Check if over a column directly
        if (overStr.startsWith('col-')) {
            const colId = parseInt(overStr.replace('col-', ''));
            setOverColumnId(colId);
            return;
        }

        // Check if over a task
        if (overStr.startsWith('task-')) {
            const taskId = parseInt(overStr.replace('task-', ''));
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                setOverColumnId(task.column_id);
                return;
            }
        }

        setOverColumnId(null);
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveColumnId(null);
        setOverColumnId(null);

        if (!over) return;

        const activeStr = String(active.id);
        const overStr = String(over.id);

        // Only handle task dragging
        if (!activeStr.startsWith('task-')) return;

        const activeTaskId = parseInt(activeStr.replace('task-', ''));

        // Determine target column
        let targetColumnId = null;

        if (overStr.startsWith('col-')) {
            targetColumnId = parseInt(overStr.replace('col-', ''));
        } else if (overStr.startsWith('task-')) {
            const overTaskId = parseInt(overStr.replace('task-', ''));
            const overTask = tasks.find(t => t.id === overTaskId);
            if (overTask) targetColumnId = overTask.column_id;
        }

        if (targetColumnId) {
            const task = tasks.find(t => t.id === activeTaskId);
            if (task && task.column_id !== targetColumnId) {

                // Set processing state
                setProcessingTaskId(activeTaskId);

                try {
                    await fetch(`/api/tasks/${activeTaskId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ column_id: targetColumnId })
                    });
                    await onUpdate();
                } catch (e) {
                    notify.error('Failed to move task');
                } finally {
                    setProcessingTaskId(null);
                }
            }
        }
    };

    const handleAddTask = async (columnId: number) => {
        if (!newTaskTitle.trim()) return;
        setIsSubmittingTask(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    column_id: columnId,
                    title: newTaskTitle,
                    description: newTaskDesc,
                    priority: 'medium'
                })
            });
            if (res.ok) {
                setNewTaskTitle('');
                setNewTaskDesc('');
                setIsAddingTask(null);
                onUpdate();
            } else {
                notify.error('Failed to create task');
            }
        } catch (e) {
            notify.error('Error creating task');
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const handleAddNote = async (content: string) => {
        if (!selectedTask) return;
        try {
            const res = await fetch('/api/task-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: selectedTask.id, content })
            });
            if (res.ok) {
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
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex space-x-4 overflow-x-auto pb-4 items-start">
                    <SortableContext items={columns.map(c => `col-${c.id}`)} strategy={horizontalListSortingStrategy}>
                        {columns.map(col => (
                            <div key={col.id} className="relative">
                                <ColumnContainer
                                    column={col}
                                    tasks={tasks.filter(t => t.column_id === col.id)}
                                    onTaskClick={setSelectedTask}
                                    onAddTask={() => setIsAddingTask({ columnId: col.id })}
                                    processingTaskId={processingTaskId}
                                    isSource={activeColumnId === col.id}
                                    isTarget={overColumnId === col.id && activeColumnId !== col.id}
                                />
                                {isAddingTask?.columnId === col.id && (
                                    <div className="absolute inset-0 bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col justify-center border-2 border-primary z-10 shadow-xl">
                                        <h4 className="mb-2 font-semibold">New Task for {col.title}</h4>
                                        <Input
                                            autoFocus
                                            placeholder="Task title..."
                                            value={newTaskTitle}
                                            disabled={isSubmittingTask}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                            className="mb-2"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                }
                                                if (e.key === 'Escape') setIsAddingTask(null);
                                            }}
                                        />
                                        <textarea
                                            placeholder="Description (optional)"
                                            value={newTaskDesc}
                                            disabled={isSubmittingTask}
                                            onChange={e => setNewTaskDesc(e.target.value)}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-2 resize-none"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setIsAddingTask(null)} disabled={isSubmittingTask}>Cancel</Button>
                                            <Button size="sm" onClick={() => handleAddTask(col.id)} disabled={isSubmittingTask}>
                                                {isSubmittingTask ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                                {isSubmittingTask ? 'Adding...' : 'Add'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="p-3 bg-white dark:bg-gray-700 rounded shadow-lg opacity-80 border border-indigo-500 w-64 transform rotate-3 cursor-grabbing">
                            Moving Task...
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    notes={notes.filter(n => n.task_id === selectedTask.id)}
                    onClose={() => setSelectedTask(null)}
                    onAddNote={handleAddNote}
                />
            )}
        </>
    );
};
