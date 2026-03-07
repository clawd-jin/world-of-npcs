import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User, UserRole, CreateUserInput, LoginInput, TokenPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SALT_ROUNDS = 10;

export class AuthService {
  private users: Map<string, User> = new Map();

  async register(email: string, password: string, role: UserRole = UserRole.Guest): Promise<User> {
    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user: User = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch {
      throw new Error('Invalid token');
    }
  }

  generateToken(userId: string): string {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }
}

export const authService = new AuthService();
