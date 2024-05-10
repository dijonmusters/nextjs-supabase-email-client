'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase';

const schema = z.object({
  subject: z.string(),
  recipient_email: z.string().email(),
  body: z.string(),
});

export async function sendEmail(formData: FormData) {
  const parsed = schema.parse({
    subject: formData.get('subject'),
    recipient_email: formData.get('email'),
    body: formData.get('body'),
  });

  const supabase = createClient();

  const { data: newEmailId, error } = await supabase.rpc('send_email', parsed);

  if (error) {
    console.log(error);
  }

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect(`/f/sent?id=${newEmailId}`);
}

export async function deleteEmail(folderName: string, emailId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('emails')
    .delete()
    .match({ id: emailId });

  if (error) {
    console.log(error);
  }

  revalidatePath('/', 'layout'); // Revalidate all data
  redirect(`/f/${folderName}`);
}
