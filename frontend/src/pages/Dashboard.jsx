import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Book, CheckSquare, Clock, Plus, Trash2, Edit, BellRing } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [activeDialog, setActiveDialog] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Load data from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('student-subjects');
    const savedTasks = localStorage.getItem('student-tasks');
    const savedSchedule = localStorage.getItem('student-schedule');
    
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check for reminders
    checkReminders();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('student-subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('student-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('student-schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Notification permission granted!');
      } else {
        toast.error('Notification permission denied');
      }
    }
  };

  // Send notification
  const sendNotification = (title, body) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  // Check for reminders
  const checkReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    subjects.forEach(subject => {
      if (subject.spacedRepetition) {
        const createdDate = new Date(subject.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        
        const diffTime = today - createdDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 7 || diffDays === 30 || diffDays === 60) {
          sendNotification('Revision Reminder', `Time to revise: ${subject.name}`);
        }
      }
    });

    tasks.forEach(task => {
      if (task.dueDate && task.spacedRepetition) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          sendNotification('Task Due Today', task.name);
        } else if (diffDays === 1) {
          sendNotification('Task Due Tomorrow', task.name);
        }
      }
    });
  };

  // Subject functions
  const addSubject = (data) => {
    const newSubject = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      sessionsCompleted: 0
    };
    setSubjects([...subjects, newSubject]);
    toast.success('Subject added successfully!');
    setActiveDialog(null);
  };

  const updateSubject = (id, data) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, ...data } : s));
    toast.success('Subject updated successfully!');
    setActiveDialog(null);
    setEditingItem(null);
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast.success('Subject deleted successfully!');
  };

  // Task functions
  const addTask = (data) => {
    const newTask = {
      id: Date.now(),
      ...data,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    toast.success('Task added successfully!');
    setActiveDialog(null);
  };

  const updateTask = (id, data) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...data } : t));
    toast.success('Task updated successfully!');
    setActiveDialog(null);
    setEditingItem(null);
  };

  const toggleTaskComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task deleted successfully!');
  };

  // Schedule functions
  const addSchedule = (data) => {
    const newSchedule = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    };
    setSchedule([...schedule, newSchedule]);
    toast.success('Class added to schedule!');
    setActiveDialog(null);
  };

  const updateSchedule = (id, data) => {
    setSchedule(schedule.map(s => s.id === id ? { ...s, ...data } : s));
    toast.success('Schedule updated successfully!');
    setActiveDialog(null);
    setEditingItem(null);
  };

  const deleteSchedule = (id) => {
    setSchedule(schedule.filter(s => s.id !== id));
    toast.success('Class removed from schedule!');
  };

  // Statistics
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalStudySessions = subjects.reduce((acc, s) => acc + s.sessionsCompleted, 0);
  const upcomingClasses = schedule.length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">Study Tracker</h1>
              <p className="text-base text-gray-600">Manage your routines, stay organized, excel academically</p>
            </div>
            
            {notificationPermission !== 'granted' && (
              <Button
                onClick={requestNotificationPermission}
                className="pill-button bg-blue-500 hover:bg-blue-600 text-white"
                data-testid="enable-notifications-btn"
              >
                <BellRing className="mr-2 h-4 w-4" />
                Enable Reminders
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 fade-in">
          <Card className="glass-card hover-lift stat-card before:bg-green-500" data-testid="completed-tasks-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Tasks</CardTitle>
              <CheckSquare className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{completedTasks}</div>
              <p className="text-xs text-gray-500 mt-1">out of {tasks.length} total</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift stat-card before:bg-purple-500" data-testid="study-sessions-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Study Sessions</CardTitle>
              <Book className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{totalStudySessions}</div>
              <p className="text-xs text-gray-500 mt-1">across {subjects.length} subjects</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift stat-card before:bg-orange-500" data-testid="upcoming-classes-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Classes</CardTitle>
              <Calendar className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{upcomingClasses}</div>
              <p className="text-xs text-gray-500 mt-1">in your schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="subjects" className="fade-in">
          <TabsList className="mb-6 glass-card p-1" data-testid="main-tabs">
            <TabsTrigger value="subjects" className="px-6" data-testid="subjects-tab">Subjects</TabsTrigger>
            <TabsTrigger value="tasks" className="px-6" data-testid="tasks-tab">Tasks</TabsTrigger>
            <TabsTrigger value="schedule" className="px-6" data-testid="schedule-tab">Schedule</TabsTrigger>
          </TabsList>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card className="glass-card" data-testid="subjects-section">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Study Subjects</CardTitle>
                    <CardDescription>Track your subjects and enable spaced repetition</CardDescription>
                  </div>
                  <SubjectDialog onSave={addSubject} trigger={
                    <Button className="pill-button bg-purple-500 hover:bg-purple-600 text-white" data-testid="add-subject-btn">
                      <Plus className="mr-2 h-4 w-4" /> Add Subject
                    </Button>
                  } />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.length === 0 ? (
                    <p className="text-center text-gray-400 py-8" data-testid="no-subjects-message">No subjects added yet. Start by adding your first subject!</p>
                  ) : (
                    subjects.map(subject => (
                      <div key={subject.id} className="glass-card p-4 hover-lift" data-testid={`subject-item-${subject.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                              {subject.spacedRepetition && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700" data-testid={`spaced-rep-badge-${subject.id}`}>
                                  <Clock className="h-3 w-3 mr-1" /> Spaced Rep
                                </Badge>
                              )}
                            </div>
                            {subject.description && (
                              <p className="text-sm text-gray-600 mb-2">{subject.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Sessions: {subject.sessionsCompleted}</span>
                              <span>Added: {format(new Date(subject.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <SubjectDialog 
                              editData={subject}
                              onSave={(data) => updateSubject(subject.id, data)}
                              trigger={
                                <Button variant="ghost" size="icon" data-testid={`edit-subject-${subject.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteSubject(subject.id)}
                              data-testid={`delete-subject-${subject.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="glass-card" data-testid="tasks-section">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daily Tasks & Habits</CardTitle>
                    <CardDescription>Manage your to-dos and build consistent habits</CardDescription>
                  </div>
                  <TaskDialog onSave={addTask} trigger={
                    <Button className="pill-button bg-green-500 hover:bg-green-600 text-white" data-testid="add-task-btn">
                      <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                  } />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <p className="text-center text-gray-400 py-8" data-testid="no-tasks-message">No tasks created yet. Add your first task to get started!</p>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="glass-card p-4 hover-lift" data-testid={`task-item-${task.id}`}>
                        <div className="flex items-start gap-4">
                          <Checkbox 
                            checked={task.completed} 
                            onCheckedChange={() => toggleTaskComplete(task.id)}
                            className="mt-1"
                            data-testid={`task-checkbox-${task.id}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {task.name}
                              </h3>
                              {task.spacedRepetition && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700" data-testid={`task-spaced-rep-badge-${task.id}`}>
                                  <Clock className="h-3 w-3 mr-1" /> Reminder
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-gray-500">
                                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <TaskDialog 
                              editData={task}
                              onSave={(data) => updateTask(task.id, data)}
                              trigger={
                                <Button variant="ghost" size="icon" data-testid={`edit-task-${task.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteTask(task.id)}
                              data-testid={`delete-task-${task.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card className="glass-card" data-testid="schedule-section">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Class Schedule</CardTitle>
                    <CardDescription>Organize your weekly class timetable</CardDescription>
                  </div>
                  <ScheduleDialog onSave={addSchedule} trigger={
                    <Button className="pill-button bg-orange-500 hover:bg-orange-600 text-white" data-testid="add-schedule-btn">
                      <Plus className="mr-2 h-4 w-4" /> Add Class
                    </Button>
                  } />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.length === 0 ? (
                    <p className="text-center text-gray-400 py-8" data-testid="no-schedule-message">No classes scheduled yet. Add your first class!</p>
                  ) : (
                    schedule.map(item => (
                      <div key={item.id} className="glass-card p-4 hover-lift" data-testid={`schedule-item-${item.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{item.className}</h3>
                              <Badge className="bg-orange-100 text-orange-700">{item.day}</Badge>
                            </div>
                            {item.instructor && (
                              <p className="text-sm text-gray-600 mb-1">Instructor: {item.instructor}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> {item.startTime} - {item.endTime}
                              </span>
                              {item.location && <span>📍 {item.location}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <ScheduleDialog 
                              editData={item}
                              onSave={(data) => updateSchedule(item.id, data)}
                              trigger={
                                <Button variant="ghost" size="icon" data-testid={`edit-schedule-${item.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteSchedule(item.id)}
                              data-testid={`delete-schedule-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Subject Dialog Component
const SubjectDialog = ({ trigger, onSave, editData }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    spacedRepetition: false
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        description: editData.description || '',
        spacedRepetition: editData.spacedRepetition || false
      });
    }
  }, [editData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
      setFormData({ name: '', description: '', spacedRepetition: false });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="subject-dialog">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          <DialogDescription>Enter the details of your subject</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject-name">Subject Name *</Label>
              <Input
                id="subject-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics, Physics"
                required
                data-testid="subject-name-input"
              />
            </div>
            <div>
              <Label htmlFor="subject-description">Description</Label>
              <Textarea
                id="subject-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes about this subject"
                data-testid="subject-description-input"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="subject-spaced-rep"
                checked={formData.spacedRepetition}
                onCheckedChange={(checked) => setFormData({ ...formData, spacedRepetition: checked })}
                data-testid="subject-spaced-rep-switch"
              />
              <Label htmlFor="subject-spaced-rep" className="cursor-pointer">
                Enable spaced repetition reminders (7 days, 1 month, 2 months)
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600" data-testid="save-subject-btn">
              {editData ? 'Update' : 'Add'} Subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Task Dialog Component
const TaskDialog = ({ trigger, onSave, editData }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: null,
    spacedRepetition: false
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        description: editData.description || '',
        dueDate: editData.dueDate ? new Date(editData.dueDate) : null,
        spacedRepetition: editData.spacedRepetition || false
      });
    }
  }, [editData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null
      };
      onSave(submitData);
      setFormData({ name: '', description: '', dueDate: null, spacedRepetition: false });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="task-dialog">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>Create a task or habit to track</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name *</Label>
              <Input
                id="task-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Complete assignment, Exercise"
                required
                data-testid="task-name-input"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details"
                data-testid="task-description-input"
              />
            </div>
            <div>
              <Label>Due Date (Optional)</Label>
              <CalendarComponent
                mode="single"
                selected={formData.dueDate}
                onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                className="rounded-md border"
                data-testid="task-due-date-calendar"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="task-spaced-rep"
                checked={formData.spacedRepetition}
                onCheckedChange={(checked) => setFormData({ ...formData, spacedRepetition: checked })}
                data-testid="task-spaced-rep-switch"
              />
              <Label htmlFor="task-spaced-rep" className="cursor-pointer">
                Enable due date reminders
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="bg-green-500 hover:bg-green-600" data-testid="save-task-btn">
              {editData ? 'Update' : 'Add'} Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Schedule Dialog Component
const ScheduleDialog = ({ trigger, onSave, editData }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    instructor: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    location: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (editData) {
      setFormData({
        className: editData.className || '',
        instructor: editData.instructor || '',
        day: editData.day || 'Monday',
        startTime: editData.startTime || '',
        endTime: editData.endTime || '',
        location: editData.location || ''
      });
    }
  }, [editData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.className.trim() && formData.startTime && formData.endTime) {
      onSave(formData);
      setFormData({ className: '', instructor: '', day: 'Monday', startTime: '', endTime: '', location: '' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="schedule-dialog">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          <DialogDescription>Add a class to your weekly schedule</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="class-name">Class Name *</Label>
              <Input
                id="class-name"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g., Calculus 101"
                required
                data-testid="class-name-input"
              />
            </div>
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="e.g., Dr. Smith"
                data-testid="instructor-input"
              />
            </div>
            <div>
              <Label htmlFor="day">Day *</Label>
              <select
                id="day"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
                data-testid="day-select"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  data-testid="start-time-input"
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  data-testid="end-time-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 205, Building A"
                data-testid="location-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" data-testid="save-schedule-btn">
              {editData ? 'Update' : 'Add'} Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Dashboard;