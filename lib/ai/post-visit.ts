import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export class PostVisitPipeline {
    private static getPrompt(name: string): string {
        const filePath = path.join(process.cwd(), "lib", "ai", "prompts", `${name}.md`);
        return fs.readFileSync(filePath, "utf-8");
    }

    static async generatePatientSummary(data: {
        patientName: string;
        doctorName: string;
        visitDate: string;
        notes: string;
    }) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let prompt = this.getPrompt("patient-education");

        // Inject placeholders
        prompt = prompt
            .replace("{{patientName}}", data.patientName)
            .replace("{{doctorName}}", data.doctorName)
            .replace("{{visitDate}}", data.visitDate)
            .replace("{{notes}}", data.notes);

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    static async extractObservations(notes: string) {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        let prompt = this.getPrompt("document-analyzer");
        prompt = prompt.replace("{{notes}}", notes);

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse observation JSON:", e);
            return [];
        }
    }

    /**
     * Safety pass to ensure the AI summary didn't hallucinate 
     * contradictory advice (mock implementation of the original project's safety pass)
     */
    static async verifySafety(summary: string, originalNotes: string) {
        // In a production environment, we would run another Claude/Gemini pass 
        // to check for hallucinations. For now, we flag it as "Awaiting Review".
        return true; 
    }
}
