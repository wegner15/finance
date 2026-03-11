
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNotification } from '../contexts/NotificationContext';
// Will replace placeholders with actual components in subsequent steps
import { KanbanBoard } from '../components/project-management/KanbanBoard';
import { MilestoneTracker } from '../components/project-management/MilestoneTracker';
import { TicketSystem } from '../components/project-management/TicketSystem';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

const ProjectDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const notify = useNotification();
    const [loading, setLoading] = useState(true);
    const [projectData, setProjectData] = useState<any>(null);

    const fetchProjectDetails = async () => {
        try {
            const response = await fetch(`/api/projects/${id}/details`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.error || `Failed to fetch details: ${response.status}`);
                } catch {
                    throw new Error(`Failed to fetch details: ${response.status} ${errorText}`);
                }
            }
            const data = await response.json();
            setProjectData(data);
        } catch (error: any) {
            console.error('Error fetching project details:', error);
            notify.error(error.message || 'Failed to load project details');
            // Don't redirect immediately so user can see error
            // navigate('/projects'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!projectData) return null;

    const { project, columns, tasks, milestones, tickets, taskNotes, ticketNotes } = projectData;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Nav />
            <div className="ml-0 md:ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{project.description}</p>
                </div>

                <Tabs defaultValue="board" className="space-y-6">
                    <TabsList className="flex w-fit items-center gap-1 rounded-lg bg-muted/50 p-1 border border-gray-200 dark:border-gray-700">
                        <TabsTrigger
                            value="overview"
                            className="rounded-md px-4 py-2 text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-muted-foreground/10"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="board"
                            className="rounded-md px-4 py-2 text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-muted-foreground/10"
                        >
                            Tasks
                        </TabsTrigger>
                        <TabsTrigger
                            value="milestones"
                            className="rounded-md px-4 py-2 text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-muted-foreground/10"
                        >
                            Milestones
                        </TabsTrigger>
                        <TabsTrigger
                            value="tickets"
                            className="rounded-md px-4 py-2 text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-blue-600 data-[state=active]:text-white hover:bg-muted-foreground/10"
                        >
                            Tickets
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900">
                                        <h3 className="font-semibold">Total Tasks</h3>
                                        <p className="text-2xl">{tasks.length}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900">
                                        <h3 className="font-semibold">Milestones</h3>
                                        <p className="text-2xl">{milestones.length}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-purple-100 dark:bg-purple-900">
                                        <h3 className="font-semibold">Open Tickets</h3>
                                        <p className="text-2xl">{tickets.filter((t: any) => t.status !== 'closed').length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="board">
                        <KanbanBoard projectId={id!} columns={columns} tasks={tasks} notes={taskNotes} onUpdate={fetchProjectDetails} />
                    </TabsContent>

                    <TabsContent value="milestones">
                        <MilestoneTracker projectId={id!} milestones={milestones} onUpdate={fetchProjectDetails} />
                    </TabsContent>

                    <TabsContent value="tickets">
                        <TicketSystem projectId={id!} tickets={tickets} notes={ticketNotes} onUpdate={fetchProjectDetails} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ProjectDetails;
