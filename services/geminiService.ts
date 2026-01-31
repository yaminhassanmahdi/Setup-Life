import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIProposal, Priority, ProjectStatus, TaskStatus, ProjectCategory, ScheduleItem } from "../types";

// Helper to get API Key safely in both Dev and Prod (Vite) environments
const getApiKey = () => {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
     // @ts-ignore
     return process.env.API_KEY;
  }
  // @ts-ignore
  if (import.meta.env?.VITE_GOOGLE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_GOOGLE_API_KEY;
  }
  return undefined;
};

const proposalSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief summary of what was analyzed and proposed." },
    habits: {
      type: Type.ARRAY,
      description: "Daily recurring habits suggested.",
      items: { 
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            timeOfDay: { type: Type.STRING, enum: ['Morning', 'Afternoon', 'Evening', 'Anytime'] }
        },
        required: ["title", "timeOfDay"]
      }
    },
    weeklyGoals: {
      type: Type.ARRAY,
      description: "High-level goals to achieve during the current or next week.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING, enum: [ProjectCategory.Work, ProjectCategory.Personal, ProjectCategory.Education] }
        },
        required: ["title", "category"]
      }
    },
    schedule: {
      type: Type.ARRAY,
      description: "Specific time-bound items for the calendar/schedule.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          startTime: { type: Type.STRING, description: "24h format HH:mm" },
          endTime: { type: Type.STRING, description: "24h format HH:mm" },
          type: { type: Type.STRING, enum: ["Routine", "Appointment", "Work", "Task"] },
          date: { type: Type.STRING, description: "YYYY-MM-DD format. Infer from context." },
          description: { type: Type.STRING }
        },
        required: ["title", "startTime", "type", "date"]
      }
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          vision: { type: Type.STRING },
          category: { type: Type.STRING, enum: [ProjectCategory.Work, ProjectCategory.Personal, ProjectCategory.Education] },
          status: { type: Type.STRING, enum: [ProjectStatus.Active, ProjectStatus.Paused, ProjectStatus.Archived] },
        },
        required: ["name", "vision", "status", "category"],
      },
    },
    goals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING, description: "The name of the project this goal belongs to." },
          description: { type: Type.STRING },
        },
        required: ["projectName", "description"],
      },
    },
    kpis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          name: { type: Type.STRING },
          currentValue: { type: Type.NUMBER },
          targetValue: { type: Type.NUMBER },
          unit: { type: Type.STRING, description: "e.g., $, users, %" },
          updateFrequency: { type: Type.STRING },
        },
        required: ["projectName", "name", "currentValue", "targetValue", "unit", "updateFrequency"],
      },
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: [Priority.High, Priority.Medium, Priority.Low] },
          estimatedHours: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: [TaskStatus.Backlog, TaskStatus.InProgress, TaskStatus.Blocked, TaskStatus.Done] },
          subtasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["projectName", "title", "priority", "estimatedHours", "status"],
      },
    },
  },
  required: ["summary", "projects", "goals", "kpis", "tasks", "habits", "schedule", "weeklyGoals"],
};

export const parseBrainDump = async (text: string, referenceDate: string = new Date().toISOString().split('T')[0], userApiKey?: string): Promise<AIProposal | null> => {
  try {
    const apiKey = userApiKey || getApiKey();
    if (!apiKey) {
        throw new Error("Missing API Key. Please set your Personal API Key in Settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert Life and Project Manager AI. 
              Analyze the following unstructured text.
              Reference Date (Today): ${referenceDate}
              
              CRITICAL RULES:
              1. SCHEDULE: NEVER use generic titles. Be specific.
              2. EDUCATION CONTEXT: 
                 - If the text mentions "Studying", "University", "College", "Learning Skill", "Course", or "Exam", create a Project with category 'Education'.
                 - Map "Course Name" -> Project Name.
                 - Map "Syllabus/Learning Outcome" -> Goals.
                 - Map "Assignments", "Exams", "Homework" -> Tasks.
                 - Map "Grades", "GPA", "Chapters Read" -> KPIs.
              
              Input Text:
              "${text}"`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: proposalSchema,
        systemInstruction: "You are a precise assistant helping a founder organize their life, work, and education.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIProposal;
    }
    return null;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};

export const generateDailyPlan = async (currentTasks: any[], goals: any[], userApiKey?: string): Promise<any | null> => {
  try {
      const apiKey = userApiKey || getApiKey();
      if (!apiKey) throw new Error("Missing API Key");
      const ai = new GoogleGenAI({ apiKey });
      
      const planSchema: Schema = {
          type: Type.OBJECT,
          properties: {
              advice: { type: Type.STRING },
              top3TaskIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
      }

      const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
              role: "user",
              parts: [{
                  text: `Here are my current tasks: ${JSON.stringify(currentTasks)}. 
                  Here are my goals: ${JSON.stringify(goals)}.
                  Identify the top 3 most impactful tasks I should focus on today to move towards my goals.
                  Also provide a short paragraph of strategic advice.`
              }]
          }],
          config: {
              responseMimeType: "application/json",
              responseSchema: planSchema
          }
      });
      if (response.text) return JSON.parse(response.text);
      return null;
  } catch (e) {
      console.error(e);
      throw e;
  }
}

export const breakdownPlan = async (planTitle: string, currentHorizon: string, userApiKey?: string): Promise<string[] | null> => {
    try {
        const apiKey = userApiKey || getApiKey();
        if (!apiKey) throw new Error("Missing API Key");
        const ai = new GoogleGenAI({ apiKey });

        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                subPlans: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        };

        let nextHorizon = 'tasks';
        if (currentHorizon === '1 Year') nextHorizon = '3 Months';
        else if (currentHorizon === '3 Months') nextHorizon = '1 Month';
        else if (currentHorizon === '1 Month') nextHorizon = 'Weekly';

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{
                role: "user",
                parts: [{
                    text: `I have a ${currentHorizon} strategic plan: "${planTitle}".
                    Please break this down into 3-5 concrete ${nextHorizon} milestones/plans.
                    Return only the titles of these milestones.`
                }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        if(response.text) {
            const parsed = JSON.parse(response.text);
            return parsed.subPlans;
        }
        return null;

    } catch (e) {
        console.error("Plan breakdown error", e);
        return null;
    }
}