export type Zone = 'silicon' | 'web' | 'client' | 'ml';
export type ProjType = 'original' | 'template-based' | 'ai-builder' | 'fork' | 'coursework';

export interface ProjectLinks {
  repo?: string;
  live?: string;
  demo?: string;
  presentation?: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  zone: Zone;
  type: ProjType;
  tile: boolean; // true → rendered as a 3D compute tile
  featured: boolean; // true → larger tile, leads its zone
  grid?: [number, number]; // [col,row]; REQUIRED when tile===true, omit otherwise
  start: string; // "YYYY-MM"
  lastActive: string; // "YYYY-MM"
  status: string;
  months: number;
  primaryLanguage: string;
  commits: number;
  tech: string[];
  skills: string[];
  bullets: string[];
  links: ProjectLinks;
}

export interface ZoneMeta {
  id: Zone;
  label: string;
  blurb: string;
  accent: string; // hex
  origin: [number, number, number];
}

export interface SkillCategory {
  name: string;
  skills: { label: string; level: string }[];
}

export interface Venture {
  name: string;
  role: string;
  period: string; // e.g. "2024 – Present"
  blurb: string;
  url?: string;
}

export interface Profile {
  name: string;
  headline: string;
  email: string;
  linkedin: string;
  github: string;
  githubAlt: string;
  booking: string;
  languages: string[];
  ventures: Venture[]; // experience entries: founded ventures, lead roles, internships
}
