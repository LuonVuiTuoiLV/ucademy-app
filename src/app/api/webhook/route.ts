import { createUser } from '@/lib/actions/user.actions';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(request: Request) {
	const svixId = (await headers()).get('svix-id') ?? '';
	const svixTimestamp = (await headers()).get('svix-timestamp') ?? '';
	const svixSignature = (await headers()).get('svix-signature') ?? '';

	if (!process.env.WEBHOOK_SECRET) {
		throw new Error('WEBHOOK_SECRET is not set');
	}
	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response('Bad Request', { status: 400 });
	}
	const payload = await request.json();
	const body = JSON.stringify(payload);

	const sivx = new Webhook(process.env.WEBHOOK_SECRET);

	let message: WebhookEvent;

	try {
		message = sivx.verify(body, {
			'svix-id': svixId,
			'svix-timestamp': svixTimestamp,
			'svix-signature': svixSignature,
		}) as WebhookEvent;
	} catch {
		return new Response('Bad Request', { status: 400 });
	}

	/**
	 * Sẽ lấy event từ webhook 
	 * user.created
		user.deleted
		user.updated
	 */
	const eventType = message.type;
	if (eventType === 'user.created') {
		// create user to database
		const {
			email_addresses: emailAddress,
			id,
			image_url: imageURL,
			username,
		} = message.data;
		const user = await createUser({
			username: username!,
			name: username!,
			clerkId: id,
			email: emailAddress[0].email_address || '',
			avatar: imageURL,
		});

		return NextResponse.json({
			message: 'OK',
			user,
		});
	}

	return new Response('OK', { status: 200 });
}
