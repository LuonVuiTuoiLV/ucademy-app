'use server';

import { TCreateUserParams } from '@/components/types';
import User from '@/database/user.model';
import { connectToDatabase } from '../mongoose';

export default async function createUser(params: TCreateUserParams) {
	try {
		connectToDatabase();
		const newUser = await User.create(params);
		return newUser;
	} catch (error) {
		console.log('error:', error);
	}
}
