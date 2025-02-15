import createUser from '@/lib/actions/user.actions';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(request: Request) {
	// Validate headers
	const svixId = (await headers()).get('svix-id') ?? '';
	const svixTimestamp = (await headers()).get('svix-timestamp') ?? '';
	const svixSignature = (await headers()).get('svix-signature') ?? '';

	if (!process.env.WEBHOOK_SECRET) {
		throw new Error('WEBHOOK_SECRET is not set');
	}

	if (!svixId || !svixTimestamp || !svixSignature) {
		return new Response('Missing required headers', { status: 400 });
	}

	// Verify webhook
	const payload = await request.json();
	const body = JSON.stringify(payload);
	const svix = new Webhook(process.env.WEBHOOK_SECRET);

	let message: WebhookEvent;

	try {
		message = svix.verify(body, {
			'svix-id': svixId,
			'svix-timestamp': svixTimestamp,
			'svix-signature': svixSignature,
		}) as WebhookEvent;
	} catch (error) {
		console.error('Webhook verification failed:', error);
		return new Response('Invalid signature', { status: 400 });
	}

	const eventType = message.type;

	if (eventType === 'user.created') {
		const {
			email_addresses: emailAddress,
			id,
			image_url: imageURL,
			username,
		} = message.data;

		// Validate required fields
		if (!username || !id || !emailAddress.length) {
			return new Response('Missing required fields', { status: 400 });
		}

		try {
			const user = await createUser({
				username,
				name: username,
				clerkId: id,
				email: emailAddress[0]?.email_address || '',
				avatar: imageURL || '',
			});

			return NextResponse.json({
				message: 'OK',
				user,
			});
		} catch (error) {
			console.error('Error creating user:', error);
			return new Response('Error creating user', { status: 500 });
		}
	}

	return new Response('OK', { status: 200 });
}
