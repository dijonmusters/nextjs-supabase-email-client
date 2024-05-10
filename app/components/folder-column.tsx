import Link from 'next/link';
import { getFoldersWithEmailCount } from '@/app/db/queries';
import { FlagIcon } from '@/app/icons/flag';
import { FolderIcon } from '@/app/icons/folder';
import { InboxIcon } from '@/app/icons/inbox';
import { SentIcon } from '@/app/icons/sent';
import { UserIcon } from '@/app/icons/user';
import { createClient } from '../utils/supabase';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';

export async function FolderColumn() {
  const { specialFolders, otherFolders } = await getFoldersWithEmailCount();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const logout = async () => {
    'use server';

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    revalidatePath('/', 'layout');
  };

  return (
    <div className="flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-y-auto p-2 space-y-2">
      <div className="flex-1">
        <ul>
          {specialFolders.map((folder, index) => (
            <Link
              key={index}
              href={`/f/${encodeURIComponent(folder.name.toLowerCase())}`}
            >
              <li className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between rounded-lg">
                <div className="flex items-center space-x-3">
                  {folder.name === 'Inbox' ? (
                    <InboxIcon />
                  ) : folder.name === 'Flagged' ? (
                    <FlagIcon />
                  ) : (
                    <SentIcon />
                  )}
                  <span className="text-sm">{folder.name}</span>
                </div>
                <span className="bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1 text-xs w-6 flex justify-center">
                  {folder.email_count}
                </span>
              </li>
            </Link>
          ))}
        </ul>
        <hr className="my-4 border-gray-200 dark:border-gray-800" />
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {otherFolders.map((folder, index) => (
            <Link
              key={index}
              href={`/f/${encodeURIComponent(folder.name.toLowerCase())}`}
            >
              <li className="px-3 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center space-x-3 rounded-lg">
                <FolderIcon />
                <span className="text-sm">{folder.name}</span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
      <div className="px-3 flex items-center">
        {user ? (
          <>
            <Image
              src={user?.user_metadata.avatar_url}
              height={50}
              width={50}
              alt={`profile picture for ${user?.user_metadata.user_name}`}
              className="rounded-full"
            />
            <div className="ml-3 leading-none">
              <span className="font-medium">
                {user?.user_metadata.user_name}
              </span>
              <form action={logout}>
                <button className="text-sm text-gray-400 hover:underline hover:text-gray-300">
                  Logout
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <UserIcon />
            <Link className="ml-2" href="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
