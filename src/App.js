import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import initialData from "./initial-data";
import Column from "./column";
import styled from "styled-components";
import "@atlaskit/css-reset";

const Container = styled.div`
  display: flex;
`;

// The InnerList is a PureComponent to prevent unnecessary
// render function calls when rendering a column.
class InnerList extends React.PureComponent {
  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);
    return <Column column={column} tasks={tasks} index={index} />;
  }
}

class App extends React.Component {
  state = initialData;

  // ONLY ALLOW RIGHTWARD MOVEMENT
  // onDragStart = start => {
  //   const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId);

  //   this.setState({
  //     homeIndex
  //   });
  // };

  onDragEnd = result => {
    // ONLY ALLOW RIGHTWARD MOVEMENT
    // this.setState({
    //   homeIndex: null
    // });

    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Logic for Column DnD (this is different from task DnD)
    if (type === "column") {
      const newColumnOrder = Array.from(this.state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder
      };

      this.setState(newState);
      return;
    }

    // Begin logic for Task DnD with ability to move between columns
    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];

    // If task was not moved to a new column
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds
      };

      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn
        }
      };

      this.setState(newState);
      return;
    }

    // If task was moved to a new column
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    };

    this.setState(newState);
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {/* This droppable is for columns DnD and is set to horizontal */}
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column" // only columns can be dropped
        >
          {/* Child must be a function. */}
          {provided => (
            <Container {...provided.droppableProps} ref={provided.innerRef}>
              {this.state.columnOrder.map((columnId, index) => {
                const column = this.state.columns[columnId];

                // ONLY ALLOW RIGHTWARD MOVEMENT (this would get passed to Column)
                // const isDropDisabled = index < this.state.homeIndex;

                return (
                  <InnerList
                    key={column.id}
                    column={column}
                    taskMap={this.state.tasks}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default App;
