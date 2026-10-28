import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { getMyProfile } from '@/server/queries/profile';
import ProfileForm from './profile-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t('nav.profile') };
}

export default async function ProfilePage() {
  const profile = await getMyProfile();
  return <ProfileForm profile={profile} />;
}
