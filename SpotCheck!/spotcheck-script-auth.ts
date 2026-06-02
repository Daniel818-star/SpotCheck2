import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'spotcheck-secret-key-2024';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export const CATEGORY_SOURCES: Record<string, { name: string; sources: string[]; icon: string; color: string }> = {
  sports: {
    name: 'Sports',
    sources: ['fifa.com', 'espn.com', 'skysports.com'],
    icon: 'Trophy',
    color: 'emerald',
  },
  politics: {
    name: 'Politics',
    sources: ['bbc.com', 'cnn.com', 'reuters.com'],
    icon: 'Landmark',
    color: 'red',
  },
  educational: {
    name: 'Educational',
    sources: ['britannica.com', 'education.gov', 'harvard.edu'],
    icon: 'GraduationCap',
    color: 'blue',
  },
  scientific: {
    name: 'Scientific',
    sources: ['nasa.gov', 'nature.com', 'science.org'],
    icon: 'Microscope',
    color: 'violet',
  },
  companies: {
    name: 'Companies',
    sources: ['bloomberg.com', 'forbes.com', 'reuters.com'],
    icon: 'Building2',
    color: 'amber',
  },
  acting: {
    name: 'Acting & Entertainment',
    sources: ['imdb.com', 'variety.com', 'hollywoodreporter.com'],
    icon: 'Clapperboard',
    color: 'pink',
  },
};
