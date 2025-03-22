'use server';

import { TCreateUserParams } from '@/components/types';
import User, { IUser } from '@/database/user.model';
import { connectToDatabase } from '../mongoose';

export async function createUser(params: TCreateUserParams) {
	try {
		connectToDatabase();
		const newUser = await User.create(params);
		return newUser;
	} catch (error) {
		console.log('error:', error);
	}
}

export async function getUserInfo({
	userId,
}: {
	userId: string;
}): Promise<IUser | null | undefined> {
	try {
		connectToDatabase();
		const findUser = await User.findOne({ clerkId: userId });
		if (!findUser) return null;
		return findUser;
	} catch (error) {
		console.log(' error:', error);
	}
}
