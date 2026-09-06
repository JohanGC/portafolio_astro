import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false; // Asegura la ejecución en el servidor (SSR/Serverless)

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;

  // 1. Verificación previa de la clave en entorno
  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Falta configurar RESEND_API_KEY en el archivo .env' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const data = await request.json();

    // 2. Control de SPAM (Honeypot)
    if (data.address_verification) {
      return new Response(
        JSON.stringify({ success: false, message: 'Solicitud descartada por filtro de seguridad.' }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // 3. Validación básica de campos requeridos
    if (!data.name || !data.email || !data.subject || !data.message) {
      return new Response(
        JSON.stringify({ success: false, message: 'Todos los campos son obligatorios.' }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const resend = new Resend(apiKey);

    // 4. Despacho del correo
    const sendResult = await resend.emails.send({
      from: 'Portafolio <onboarding@resend.dev>',
      to: 'johandreto123@gmail.com',
      subject: `[Portafolio] ${data.subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px;">
          <h2 style="color: #4f46e5; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Nuevo mensaje recibido desde el Portafolio</h2>
          <p><strong>Nombre:</strong> ${data.name}</p>
          <p><strong>Correo de contacto:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          <p><strong>Asunto:</strong> ${data.subject}</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px; margin-top: 15px;">
            <p style="margin: 0; white-space: pre-wrap;"><strong>Mensaje:</strong><br/>${data.message}</p>
          </div>
        </div>
      `
    });

    if (sendResult.error) {
      throw new Error(sendResult.error.message);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payload procesado correctamente.' }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Error en el servicio de correo.' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};