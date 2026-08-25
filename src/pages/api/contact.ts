import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
    const apiKey = import.meta.env.RESEND_API_KEY;

    // Validación previa para evitar el colapso del constructor de Resend
    if (!apiKey) {
        return new Response(
            JSON.stringify({ success: false, message: 'Falta configurar RESEND_API_KEY en el archivo .env' }), 
            { status: 500 }
        );
    }

    const resend = new Resend(apiKey);
    const data = await request.json();

    if (data.address_verification) {
        return new Response(JSON.stringify({ success: false, message: 'Bot detectado' }), { status: 400 });
    }

    try {
        await resend.emails.send({
            from: 'Portafolio <onboarding@resend.dev>',
            to: 'johandreto123@gmail.com',
            subject: `[Portafolio] ${data.subject}`,
            html: `
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Correo:</strong> ${data.email}</p>
            <p><strong>Mensaje:</strong> ${data.message}</p>
            `
        });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: 'Error en el servicio de correo.' }), 
            { status: 500 }
        );
    }
};