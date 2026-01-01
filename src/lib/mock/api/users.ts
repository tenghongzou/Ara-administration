/**
 * Mock Users API
 */
import type { User, PaginatedData } from '$lib/types';
import { mockUsers } from '../data';

// Simulate network delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockUsersApi = {
	async getUsers(params?: {
		page?: number;
		pageSize?: number;
		search?: string;
		role?: string;
		status?: string;
	}): Promise<PaginatedData<User>> {
		await delay();

		let filtered = [...mockUsers];
		const page = params?.page ?? 1;
		const pageSize = params?.pageSize ?? 10;

		// Apply filters
		if (params?.search) {
			const search = params.search.toLowerCase();
			filtered = filtered.filter(
				(u) =>
					u.name.toLowerCase().includes(search) ||
					u.email.toLowerCase().includes(search) ||
					u.username.toLowerCase().includes(search)
			);
		}

		if (params?.role) {
			filtered = filtered.filter((u) => u.role === params.role);
		}

		if (params?.status) {
			filtered = filtered.filter((u) => u.status === params.status);
		}

		const total = filtered.length;
		const totalPages = Math.ceil(total / pageSize);
		const start = (page - 1) * pageSize;
		const data = filtered.slice(start, start + pageSize);

		return {
			data,
			pagination: {
				page,
				pageSize,
				total,
				totalPages
			}
		};
	},

	async getUser(id: string): Promise<User> {
		await delay();
		const user = mockUsers.find((u) => u.id === id);
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	},

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async createUser(data: any): Promise<User> {
		await delay();
		const newUser: User = {
			id: String(mockUsers.length + 1),
			username: (data.username as string) || '',
			email: (data.email as string) || '',
			name: (data.name as string) || '',
			role: (data.role as User['role']) || 'viewer',
			status: 'pending',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		mockUsers.push(newUser);
		return newUser;
	},

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async updateUser(id: string, data: any): Promise<User> {
		await delay();
		const index = mockUsers.findIndex((u) => u.id === id);
		if (index === -1) {
			throw new Error('User not found');
		}
		const existingUser = mockUsers[index];
		mockUsers[index] = {
			...existingUser,
			username: (data.username as string) ?? existingUser.username,
			email: (data.email as string) ?? existingUser.email,
			name: (data.name as string) ?? existingUser.name,
			role: (data.role as User['role']) ?? existingUser.role,
			status: (data.status as User['status']) ?? existingUser.status,
			updatedAt: new Date().toISOString()
		};
		return mockUsers[index];
	},

	async deleteUser(id: string): Promise<void> {
		await delay();
		const index = mockUsers.findIndex((u) => u.id === id);
		if (index === -1) {
			throw new Error('User not found');
		}
		mockUsers.splice(index, 1);
	}
};
