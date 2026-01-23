import React,{ useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
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
                            <View style={styles.cardButton}>
                                <TouchableOpacity onPress={() => handleEdit(item)}>
                                    <Text style={styles.edit}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                    <Text style={styles.delete}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                {showAnalytics && total > 0 && (
                    <View style={styles.analytics}>
                        <Text style={styles.analyticsTitle}>Analytics</Text>
                        <Text style={styles.analyticsText}>{completedPercentage}%</Text>
                        <Text style={styles.analyticsText}>{inProgressPercentage}%</Text>
                        <Text style={styles.analyticsText}>{notStartedPercentage}%</Text>
                        <Text 
                            style={[
                                styles.productivity,
                                {
                                    color:
                                        getProductivity() === 'High'
                                            ? '#28a745'
                                            : getProductivity() === 'Medium'
                                            ? '#ffc107'
                                            : '#dc3545'
                                },
                        ]}
                        >
                            {completedPercentage}%
                        </Text>
                    </View>
                )}
                <TouchableOpacity 
                    style={styles.viewCalenderButton} 
                    onPress={() => setViewCalendarVisibile(true)}
                >
                    <Text style={styles.viewCalendarButtonText}>View Calendar</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
            <Modal visible={selectCalendarVisible} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.calendarContainer}>
                        <Calendar 
                            onLongPress={day => {
                                setDueDate(day.dayString);
                                setSelectCalendarVisibile(false);
                            }}
                            markedDates={
                                dueDate
                                    ? {
                                        [dueDate] : {
                                            selected: true,
                                            selectedColor: '#007bff'
                                        },
                                    }   
                                : {}
                            }
                        />
                        <TouchableOpacity 
                            onPress={() => setSelectCalendarVisibile(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={viewCalendarVisible} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.calendarContainer}>
                        <Calendar markedDates={markDeadLines} />
                        <TouchableOpacity
                            onPress={() => setViewCalendarVisibile(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )
}
const styles = StyleSheet.create({
    container: {flex: 1, padding: 16, backgroundColor: '#fff'},
    header: {fontSize: 24, fontWeight: 'bold', marginBottom: 16},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statusButton: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
    },
    statusSelected: {
        backgroundColor: '#d0f0c0',
    },
    statusText: {fontSize: 12},
    dueDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    calendarButton: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    calenderButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 60,
    },
    saveButtonText: {color: '#fff', fontWeight: 'bold'},
    list: {marginTop: 16},
    card: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        minWidth: '30%',
        maxWidth: '30%'
    },
    cardTitle: {fontWeight: 'bold'},
    cradDescription: {fontSize: 12, color: '#555'},
    cradStatus: {fontSize: 12, color: '#007bff', marginVertical: 4},
    cradDueDate: {fontSize: 12, color: '#888', marginBottom: 4},
    cradButtons: {flexDirection: 'row', justifyContent: 'space-between'},
    edit: {color: 'orange'},
    delete: {color: 'red'},
    ModalBackground: {
        flex: 1,
        backgroundColor: '#000000AA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        width: '90%',
        maxHeight: '70%',
    },
    closeButton: {
        marginTop: 12,
        backgroundColor: '#007bff',
        borderRadius: 6,
        padding: 10,
        alignItems: 'center',
    },
    closeButtonText: {color: '#fff', fontWeight: 'bold'},
    viewCalendarButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    viewCalenderButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
})