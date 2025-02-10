'use server';

import mongoose from 'mongoose';

// singleton connection pattern: check xem khi cta kết nối rồi thì nó sẽ ko kết nối nữa - còn chưa knoi sẽ tự động knoi

let isConnected: boolean = false;
export const connectToDatabase = async () => {
	if (!process.env.MONGODB_URL) {
		throw new Error('MONGODB_URL is not set');
	}
	if (isConnected) {
		console.log('Mongodb is already connected');
		return;
	}
	try {
		await mongoose.connect(process.env.MONGODB_URL, { dbName: 'ucademy' });
		isConnected = true;
		console.log('Using new database connection');
	} catch {
		console.log('Error while connecting to database');
	}
};
