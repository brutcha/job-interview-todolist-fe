# Todo List Application - Assignment

## Overview

Build a todo list application with the ability to add, remove, and mark tasks as complete. All changes are persisted to a backend API.

## Evaluation Criteria

- **Functionality**: Does the app work correctly?
- **Code Quality**: Is the code clean and well-structured?
- **Best Practices**: Does the code follow good programming practices?
- **Usability**: Is the app user-friendly?
- **Styling**: Proper styling and responsiveness (tested in latest Chrome)
- **Mobile Support**: App should display correctly on mobile devices

## Required Technologies

- **TypeScript** - Required
- **React** - Required
- **Redux** - Required (RTK Query from Redux Toolkit recommended)

Redux was chosen to evaluate your ability to work with the company's technologies, even though it may be overkill for this use case.

## Technology Choices

You are free to choose:

- How to communicate with the backend
- Which additional libraries or frameworks to use
- The project structure and setup

**Deliverable**: Share your solution as a Git repository

## Backend

The backend API is available at: https://github.com/morosystems/todo-be

Refer to the README in that repository for setup instructions.

## Features

The application has a single page displaying a list of todos with the following capabilities:

- **Add todos** - Users can create new tasks
- **Remove todos** - Users can delete tasks
- **Rename todos** - Users can edit task names
- **Mark as complete** - Users can mark tasks as done
- **Filter todos** - Users can filter between completed and incomplete tasks
- **Mark all visible as complete** - One action to complete all visible tasks
- **Delete all completed** - One action to remove all completed tasks
- **Display completion count** - Show how many tasks are completed

## Reference

You can use [TodoMVC](http://todomvc.com/) as inspiration for how the app should behave, but exact behavior match is not required.

## Important Considerations

- **Error Handling**: Handle cases where the backend fails to perform an operation
- **Code Length**: Don't over-engineer solutions. The code will be reviewed in full, so keep it reasonable
- **Optional Enhancements**: If you want to add extra features (e.g., optimistic updates), feel free, but keep the implementation concise

## Notes

Good luck! We're looking forward to seeing your solution.
