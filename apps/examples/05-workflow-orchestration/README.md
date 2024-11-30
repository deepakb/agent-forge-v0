# Workflow Orchestration Example

This example demonstrates how to use Agent Forge's workflow capabilities to orchestrate complex tasks across multiple agents. It shows how to define workflows, handle task dependencies, and manage workflow state.

## What You'll Learn
- Workflow definition and execution
- Task dependency management
- Error handling in workflows
- Workflow state tracking
- Dynamic workflow modification

## Features Demonstrated
1. Sequential task execution
2. Parallel task execution
3. Conditional branching
4. Error recovery
5. Dynamic workflow updates
6. Workflow state persistence

## Prerequisites
- Node.js >= 16
- npm or yarn

## Setup
1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
npm start
```

## Example Scenario
The example implements a document processing workflow that:
1. Receives a document
2. Extracts text content
3. Performs analysis in parallel:
   - Sentiment analysis
   - Topic classification
   - Key phrase extraction
4. Generates a summary report
5. Notifies completion

## Code Structure
- `workflow-definition.ts`: Define workflow steps and dependencies
- `document-processor.ts`: Agent for processing documents
- `analyzer-agents.ts`: Agents for different analysis tasks
- `report-generator.ts`: Agent for generating final reports
- `index.ts`: Main workflow orchestration example

## Key Concepts
- Workflow Definition
- Task Dependencies
- Error Handling
- State Management
- Dynamic Updates
