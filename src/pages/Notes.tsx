import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import StickyNote from 'lucide-react/dist/esm/icons/sticky-note';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Search from 'lucide-react/dist/esm/icons/search';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Download from 'lucide-react/dist/esm/icons/download';
import X from 'lucide-react/dist/esm/icons/x';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirmation } from '../contexts/ConfirmationContext';

interface Note {
  id: number;
  title: string;
  content: string;
  updated_at: string;
}

interface Attachment {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
}

interface NoteDetail extends Note {
  attachments: Attachment[];
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const notify = useNotification();
  const confirm = useConfirmation();

  const [editData, setEditData] = useState({
    title: '',
    content: ''
  });

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      notify.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const fetchNoteDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/notes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedNote(data);
        setEditData({ title: data.title, content: data.content });
      }
    } catch (e) {
      notify.error('Failed to load note details');
    }
  }, [notify]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (selectedNoteId) {
      fetchNoteDetail(selectedNoteId);
    } else {
      setSelectedNote(null);
      setEditData({ title: '', content: '' });
    }
  }, [selectedNoteId, fetchNoteDetail]);

  const handleSave = async () => {
    if (!editData.title.trim()) {
      notify.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedNoteId,
          ...editData
        })
      });

      if (res.ok) {
        const result = await res.json();
        notify.success('Note saved successfully');
        if (!selectedNoteId) {
          setSelectedNoteId(result.id);
        }
        fetchNotes();
      }
    } catch (e) {
      notify.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm.confirm({
      title: 'Delete Note',
      message: 'Are you sure? This will permanently delete this note and all its attachments.',
      variant: 'danger',
      confirmText: 'Delete'
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify.success('Note deleted');
        if (selectedNoteId === id) setSelectedNoteId(null);
        fetchNotes();
      }
    } catch (e) {
      notify.error('Failed to delete note');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNoteId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/notes/${selectedNoteId}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        notify.success('File uploaded');
        fetchNoteDetail(selectedNoteId);
      } else {
        notify.error('Upload failed');
      }
    } catch (e) {
      notify.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-950 dark:to-indigo-950">
      <div className="ml-0 md:ml-64 flex h-screen overflow-hidden">
        {/* Notes Sidebar */}
        <div className="w-full md:w-80 border-r border-white/20 dark:border-white/10 flex flex-col bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold dark:text-gray-100">My Notes</h1>
              <Button 
                size="icon" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg h-8 w-8"
                onClick={() => setSelectedNoteId(null)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search notes..." 
                className="pl-9 bg-white/50 dark:bg-black/20 border-0 focus:ring-2 ring-indigo-500/50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center p-8">
                <StickyNote className="w-12 h-12 mx-auto text-gray-300 mb-2 opacity-50" />
                <p className="text-sm text-gray-400 font-medium">No notes found</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                    selectedNoteId === note.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-x-1' 
                    : 'hover:bg-white/60 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <h3 className="font-bold truncate pr-6">{note.title || 'Untitled Note'}</h3>
                  <p className={`text-xs truncate opacity-70 ${selectedNoteId === note.id ? 'text-white' : 'text-gray-500'}`}>
                    {note.content || 'No content yet...'}
                  </p>
                  <div className="mt-1 text-[10px] opacity-50 font-medium">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`absolute right-1 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${selectedNoteId === note.id ? 'text-white hover:bg-white/20' : 'text-red-400 hover:text-red-500'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor Area */}
        <div className="flex-1 flex flex-col bg-white/30 dark:bg-black/10 transition-all duration-300 overflow-hidden relative">
          <div className="p-6 flex-1 flex flex-col max-w-5xl mx-auto w-full space-y-6 overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center bg-white/60 dark:bg-white/5 p-4 rounded-2xl backdrop-blur-md shadow-sm border border-white/20">
              <div className="flex-1 mr-4">
                <input 
                  className="w-full bg-transparent text-3xl font-black outline-none border-none dark:text-gray-100 placeholder:opacity-30" 
                  placeholder="Note Title..."
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>

            <div className="flex-1 flex flex-col bg-white/60 dark:bg-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl border border-white/30 dark:border-white/10 min-h-[500px]">
              <textarea 
                className="flex-1 bg-transparent text-lg outline-none border-none resize-none dark:text-gray-200 placeholder:opacity-30 leading-relaxed custom-scrollbar"
                placeholder="Start writing your brilliant ideas here..."
                value={editData.content}
                onChange={e => setEditData({ ...editData, content: e.target.value })}
              />
            </div>

            {selectedNoteId && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center dark:text-gray-100">
                    <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                    Attachments
                  </h3>
                  <div className="relative">
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <Button 
                      asChild 
                      variant="outline" 
                      className="rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload File
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                  {selectedNote?.attachments?.map(att => (
                    <Card key={att.id} className="bg-white/80 dark:bg-white/5 border-0 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
                            <FileText className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate dark:text-gray-200">{att.file_name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{(att.file_size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ml-2"
                          onClick={() => window.open(`/api/attachments/${att.id}`, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {(!selectedNote?.attachments || selectedNote.attachments.length === 0) && (
                    <div className="col-span-full border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
                      <p className="text-gray-400 font-medium">No attachments yet. Drop a file to remember more details.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
