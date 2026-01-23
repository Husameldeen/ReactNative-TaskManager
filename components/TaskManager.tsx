import React,{ useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

type TaskStatus = 'Not started' | 'In progress' | 'Completed';
type Task = {
    id: string,
    title: string,
    description: string,
    status: TaskStatus,
    dueDate?: string,
};

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>('Not started');
    const [dueDate, setDueDate] = useState<string | undefined>(undefined);
    const [editId, setEditId] = useState<string | null>(null);
    const [selectCalendarVisible, setSelectCalendarVisibile] = useState(false);
    const [viewCalendarVisible, setViewCalendarVisibile] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);   

    const handleSave = () => {
        if (!title.trim()) return;
        
        const newTask: Task = {
            id: editId || Date.now().toString(),
            title,
            description,
            status,
            dueDate,
        }
        const updatedTask = editId
            ? tasks.map(t => (t.id === editId ? newTask :t)) 
            : [...tasks, newTask];
        
        setTasks(updatedTask);
        setTitle('');
        setDescription('');
        setStatus('Not started');
        setDueDate(undefined);
        setEditId(null);
    };
    const handleEdit = (task: Task) => {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setDueDate(task.dueDate);
        setEditId(task.id);
    };
    const handleDelete = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id))
    };
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In progress').length;
    const notStarted = tasks.filter(t => t.status === 'Not started').length;
    const completedPercentage = total? Math.round((completed/total)*100) : 0;
    const inProgressPercentage = total? Math.round((inProgress/total)*100) : 0;
    const notStartedPercentage = total? Math.round((notStarted/total)*100) : 0; 
    const getProductivity = () => {
        if (completedPercentage >= 70) return 'High';
        if (completedPercentage >= 40) return 'Medium';
        return 'Low';
    };
    const markDeadLines = tasks.reduce((acc, task) => {
        if (task.dueDate) {
            acc[task.dueDate] = {
                marked: true,
                dotColor: '#007bff',
                activeOpacity: 0
            };
        }
        return acc;
    }, {} as Record<string, {marked: boolean, dotColor: string, activeOpacity: number}>);
    return (
        <>
            <KeyboardAvoidingView
                style = {styles.container}
                behavior = {Platform.OS === 'ios'?'padding':undefined}
            >
                {total > 0 && (
                    <TouchableOpacity
                        style = {styles.progressToggle}
                        onPress = {() => setShowAnalytics(prev => !prev)}
                    >
                        <Text style={styles.progressToggleText}>Progress</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.header}>Task Manager</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Task Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Task Description"
                    value={description}
                    onChangeText={setDescription}
                />
                <View style={styles.statusContainer}>
                    {(['Not started', 'In progress', 'Completed'] as TaskStatus[]).map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.statusButton, status === s && styles.statusSelected]}
                            onPress={() => setStatus(s)}
                        >
                            <Text style={styles.statusText}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.dueDateContainer}>
                    <Text style={{fontWeight: 'bold'}}>
                        Due Date: {dueDate? dueDate: 'none'}
                    </Text>
                    <TouchableOpacity
                        onPress={setSelectCalendarVisibile(true)}
                        style={styles.calendarButton}
                    >
                        <Text style={styles.calendarButtonText}>Select Due Date</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.saveButto} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{editId? 'Update Task' : 'Add Task'}</Text>
                </TouchableOpacity>
                <FlatList 
                    data={tasks}
                    keyExtractor={item => item.id}
                    numColumns={3}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles..card}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDescription}>{item.description}</Text>
                            <Text style={styles.cardStatus}>{item.status}</Text>
                            <Text style={styles.cardDueDate}>
                                Due: {item.dueDate? item.dueDate : 'No deadline'}
                            </Text>

                        </View>
                    )}
                />
            </KeyboardAvoidingView>
        </>
    )
}