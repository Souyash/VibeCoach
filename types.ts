export interface CorrectionExample {
  what_you_said: string;
  what_you_should_say: string;
}

export interface BodyLanguageFix {
  issue: string;
  instruction: string;
}

export interface ImmediateDrill {
  drill_name: string;
  instructions: string;
  drill_content: string;
}

export interface ImprovementPlan {
  correction_example: CorrectionExample;
  body_language_fix: BodyLanguageFix;
  immediate_drill: ImmediateDrill;
}

export interface AnalysisData {
  score: number;
  primary_issue: string;
}

export interface VibeCoachResponse {
  analysis: AnalysisData;
  improvement_plan: ImprovementPlan;
  next_step: string;
}

export type AppState = 'context' | 'input' | 'analyzing' | 'results';

export interface ContextOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}