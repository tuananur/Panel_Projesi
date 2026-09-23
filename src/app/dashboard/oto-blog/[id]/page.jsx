import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { can, getRolePermissions } from '@/lib/permissions';
import { parseOtoBlogAiSettings, parseOtoBlogDraft } from '@/lib/oto-blog';
import OtoBlogWizard from '../oto-blog-wizard';

export const metadata = {
  title: 'Blog oluştur | Oto Blog',
};

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function OtoBlogCreatePage({ params }) {
  const session = await getSession();
  const permissions = await getRolePermissions(session);
  if (!session || !can(permissions, session.role, 'page.oto_blog')) {
    redirect('/dashboard');
  }

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id: parseInt(id, 10) },
    select: {
      id: true,
      companyName: true,
      website: true,
      websiteType: true,
      otoBlogAiSettings: true,
      otoBlogDraft: true,
    },
  });

  if (!client || client.websiteType !== 'BEYIN_ATOLYESI') notFound();

  const draft = parseOtoBlogDraft(client.otoBlogDraft);
  const imageUrl = draft.imageToken ? `/api/oto-blog/image/${draft.imageToken}` : '';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 880 }}>
      <OtoBlogWizard
        client={{ id: client.id, companyName: client.companyName }}
        initialDraft={draft}
        initialAi={parseOtoBlogAiSettings(client.otoBlogAiSettings)}
        initialImageUrl={imageUrl}
      />
    </div>
  );
}
