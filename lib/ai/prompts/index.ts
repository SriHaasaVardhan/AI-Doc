import { DocType } from "../types";

const BASE_SYSTEM_PROMPT = `You are an expert software engineer and technical writer. 
Generate concise, highly accurate documentation based ONLY on the provided repository data.
Do NOT hallucinate or invent information not present in the data.
Output strictly in Markdown format without any conversational filler like "Here is the documentation".`;

export function buildPrompt(docType: DocType, summary: string): { system: string, user: string } {
  let specificSystemPrompt = "";
  let userPromptTemplate = "";

  switch (docType) {
    case "readme":
      specificSystemPrompt = "You specialize in creating compelling README.md files.";
      userPromptTemplate = `Create a professional README.md for this repository.
Include:
1. Title and short description
2. Features list (inferred from stack/code)
3. Tech Stack (frameworks, databases, key libraries)
4. Project Structure overview
5. Getting Started / Quick Start

Keep it concise. Use badges if possible.

REPOSITORY DATA:
${summary}`;
      break;

    case "api-docs":
      specificSystemPrompt = "You specialize in REST API documentation. Create clear endpoint tables.";
      userPromptTemplate = `Create API Documentation for this repository.
List all detected routes/endpoints. For each, infer the likely purpose based on the path and handler name.
Use markdown tables for endpoints.

REPOSITORY DATA:
${summary}`;
      break;

    case "setup-guide":
      specificSystemPrompt = "You specialize in developer onboarding and environment setup guides.";
      userPromptTemplate = `Create a step-by-step Setup Guide for this repository.
Include:
1. Prerequisites (based on package manager and framework)
2. Installation steps (cloning, installing deps)
3. Environment variables (list detected ones)
4. Running the project (list detected npm scripts)

REPOSITORY DATA:
${summary}`;
      break;

    case "architecture":
      specificSystemPrompt = "You are a software architect. Explain the system design clearly.";
      userPromptTemplate = `Create an Architecture Summary for this repository.
Explain:
1. High-level architecture pattern (e.g., MVC, Layered, Microservices)
2. Core technologies used
3. Key components and their responsibilities
4. Data flow (if inferrable)

REPOSITORY DATA:
${summary}`;
      break;

    case "folder-structure":
      specificSystemPrompt = "You are a codebase navigator. Explain directory structures clearly.";
      userPromptTemplate = `Create a Folder Structure Explanation for this repository.
Break down the provided folder tree and explain the likely purpose of each top-level directory and key configuration file.

REPOSITORY DATA:
${summary}`;
      break;

    case "mermaid-diagrams":
      specificSystemPrompt = "You are an expert at creating Mermaid.js diagrams. Output ONLY valid Mermaid code blocks.";
      userPromptTemplate = `Based on the repository data, generate exactly ONE architecture diagram using Mermaid syntax (graph TD or LR).
Do not include any text outside the markdown \`\`\`mermaid block.

REPOSITORY DATA:
${summary}`;
      break;
  }

  return {
    system: `${BASE_SYSTEM_PROMPT}\n${specificSystemPrompt}`,
    user: userPromptTemplate
  };
}

export function buildCombinedPrompt(summary: string): { system: string, user: string } {
  return {
    system: BASE_SYSTEM_PROMPT,
    user: `You must generate 6 documentation sections for the following codebase.
You MUST separate each section exactly with the delimiters shown below. Do not add markdown code blocks around the delimiters.

===README===
Write a concise README.md including Title, Description, Features, Tech Stack, and Quick Start.
===API_DOCS===
List all API routes with their presumed methods and purposes.
===SETUP_GUIDE===
Write step-by-step installation instructions.
===ARCHITECTURE===
Write a short summary of the system architecture.
===FOLDER_STRUCTURE===
Explain the directory structure.
===MERMAID_DIAGRAMS===
Output ONLY a \`\`\`mermaid block with an architecture graph (graph TD).

Keep all sections relatively concise. Do not write introductory or concluding remarks outside the sections.

REPOSITORY DATA:
${summary}`
  };
}
