import React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

const SortableTaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  darkMode,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
    style: { cursor: 'grab' },
    onClick: (e) => e.stopPropagation(),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className="absolute top-0 left-0 w-full h-8 z-10 cursor-grab"
        {...dragHandleProps}
      />
      <TaskCard
        task={task}
        onUpdate={onStatusChange}
        onSelect={() => {}}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        darkMode={darkMode}
      />
    </div>
  );
};

const KanbanColumn = ({
  id,
  title,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  darkMode,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const getColumnColor = (status) => {
    switch (status) {
      case 'Pending':
        return darkMode ? 'border-[#9c7a2c]/30 bg-[#2a2416]' : 'border-[#f8d79a] bg-[#fff8e7]';
      case 'In Progress':
        return darkMode ? 'border-[#7854c6]/30 bg-[#201b2d]' : 'border-[#d7c6ff] bg-[#f8f3ff]';
      case 'Completed':
        return darkMode ? 'border-[#367a56]/30 bg-[#132019]' : 'border-[#cce9d7] bg-[#f2fff6]';
      default:
        return darkMode ? 'border-white/8 bg-[#17131c]' : 'border-[#f1d1d8] bg-white';
    }
  };

  const getHeaderColor = (status) => {
    switch (status) {
      case 'Pending':
        return darkMode ? 'border-[#9c7a2c]/40 bg-[#3a3016] text-[#f3d98a]' : 'border-[#f1cd7b] bg-[#ffe9a9] text-[#8a5b00]';
      case 'In Progress':
        return darkMode ? 'border-[#7854c6]/40 bg-[#34264d] text-[#d4bfff]' : 'border-[#d7c6ff] bg-[#eadfff] text-[#6340a8]';
      case 'Completed':
        return darkMode ? 'border-[#367a56]/40 bg-[#1c3828] text-[#b9f0cf]' : 'border-[#b9dec6] bg-[#dff5e7] text-[#2c7c4f]';
      default:
        return darkMode ? 'border-white/8 bg-[#17131c] text-slate-100' : 'border-[#f1d1d8] bg-white text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`mx-2 flex-1 min-w-80 max-w-sm rounded-[28px] border-2 shadow-[0_14px_34px_rgba(163,82,104,0.08)] transition-colors ${
        isOver ? (darkMode ? 'border-[#b47dff] bg-[#271f35]' : 'border-[#b47dff] bg-[#f6efff]') : getColumnColor(title)
      }`}
    >
      <div className={`rounded-t-[26px] border-b-2 p-4 ${getHeaderColor(title)}`}>
        <h3 className="font-bold text-lg flex items-center justify-between">
          {title}
          <span className="rounded-full bg-white/70 px-2 py-1 text-sm font-medium">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div className="min-h-96 space-y-3 p-4">
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              darkMode={darkMode}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className={darkMode ? "py-8 text-center text-slate-500" : "py-8 text-center text-gray-500"}>
            <div className="text-4xl mb-2">No Tasks</div>
            <p>No tasks in {title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  darkMode,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [activeTask, setActiveTask] = React.useState(null);

  const tasksByStatus = React.useMemo(() => {
    return {
      'Pending': tasks.filter(task => task.taskStatus === 'Pending'),
      'In Progress': tasks.filter(task => task.taskStatus === 'In Progress'),
      'Completed': tasks.filter(task => task.taskStatus === 'Completed'),
    };
  }, [tasks]);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    console.log('Drag end:', { active: active.id, over: over?.id });

    if (!over) {
      console.log('No over target');
      setActiveTask(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(task => task._id === activeId);
    if (!activeTask) {
      console.log('Active task not found');
      setActiveTask(null);
      return;
    }

    console.log('Active task:', activeTask.taskStatus, 'Over ID:', overId);

    const columnStatuses = ['Pending', 'In Progress', 'Completed'];
    if (columnStatuses.includes(overId)) {
      const newStatus = overId;

      console.log('Dropping on column:', newStatus);
      if (activeTask.taskStatus !== newStatus) {
        console.log('Status changed from', activeTask.taskStatus, 'to', newStatus);
        const updatedTask = { ...activeTask, taskStatus: newStatus };
        onStatusChange(updatedTask);
      } else {
        console.log('Status unchanged');
      }
    } else {
      console.log('Not dropping on column, overId:', overId);
      const overTask = tasks.find(task => task._id === overId);
      if (!overTask || activeTask.taskStatus !== overTask.taskStatus) {
        console.log('Invalid drop target');
        setActiveTask(null);
        return;
      }

      console.log('Dropping on another task in same column');
    }

    setActiveTask(null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(task => task._id === activeId);
    if (!activeTask) return;

    const columnStatuses = ['Pending', 'In Progress', 'Completed'];

    if (columnStatuses.includes(overId)) {
      const newStatus = overId;

      if (activeTask.taskStatus !== newStatus) {
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex min-h-screen flex-wrap justify-center gap-4 overflow-x-auto p-4">
        <KanbanColumn
          id="Pending"
          title="Pending"
          tasks={tasksByStatus.Pending}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          darkMode={darkMode}
        />
        <KanbanColumn
          id="In Progress"
          title="In Progress"
          tasks={tasksByStatus['In Progress']}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          darkMode={darkMode}
        />
        <KanbanColumn
          id="Completed"
          title="Completed"
          tasks={tasksByStatus.Completed}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          darkMode={darkMode}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              onUpdate={() => {}}
              onSelect={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              darkMode={darkMode}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
