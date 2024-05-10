import { toTitleCase } from './utils';
import { createClient } from '../utils/supabase';

type Folder = {
  name: string;
  email_count: string;
};

type UserEmail = {
  first_name: string;
  last_name: string;
  email: string;
};

type EmailWithSenderAndRecipient = {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string;
  body: string;
  sent_date: Date;
  sender: UserEmail;
  recipient: UserEmail;
};

export async function getFoldersWithEmailCount() {
  const supabase = createClient();

  const { data } = await supabase
    .from('folders_with_email_count')
    .select()
    .returns<Folder[]>();

  const specialFoldersOrder = ['Inbox', 'Flagged', 'Sent'];

  const specialFolders = (specialFoldersOrder
    .map((name) => data?.find((folder) => folder.name === name))
    .filter(Boolean) ?? []) as Folder[];

  const otherFolders = (data?.filter(
    (folder) => !specialFoldersOrder.includes(folder.name)
  ) ?? []) as Folder[];

  return { specialFolders, otherFolders };
}

export async function getEmailsForFolder(folderName: string, search?: string) {
  const originalFolderName = toTitleCase(decodeURIComponent(folderName));

  const supabase = createClient();

  if (search === undefined) {
    const { data } = await supabase
      .from('emails_with_folder_and_users')
      .select()
      .match({ folder_name: originalFolderName })
      .order('sent_date', { ascending: false })
      .returns<EmailWithSenderAndRecipient[]>();

    return data ?? ([] as EmailWithSenderAndRecipient[]);
  }

  const orFilter = [
    'subject',
    'body',
    'recipient->>first_name',
    'recipient->>last_name',
    'recipient->>email',
    'sender->>first_name',
    'sender->>last_name',
    'sender->>email',
  ]
    .map((filter) => `${filter}.ilike.%${search}%`)
    .join(',');

  const { data } = await supabase
    .from('emails_with_folder_and_users')
    .select()
    .match({ folder_name: originalFolderName })
    .or(orFilter)
    .order('sent_date', { ascending: false })
    .returns<EmailWithSenderAndRecipient[]>();

  return data ?? ([] as EmailWithSenderAndRecipient[]);
}

export async function getEmailInFolder(folderName: string, emailId: string) {
  const originalFolderName = toTitleCase(decodeURIComponent(folderName));

  const supabase = createClient();

  const { data } = await supabase
    .from('emails_with_folder_and_users')
    .select()
    .match({ folder_name: originalFolderName, id: emailId })
    .order('sent_date', { ascending: false })
    .returns<EmailWithSenderAndRecipient[]>()
    .single();

  return data as EmailWithSenderAndRecipient;
}

export async function getAllEmailAddresses() {
  const supabase = createClient();

  const { data } = await supabase
    .from('users')
    .select('first_name, last_name, email');

  return (data ?? []) as UserEmail[];
}
