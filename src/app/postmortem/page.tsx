'use client';

import type { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/services/api';

const PostmortemPage: NextPage<{ patient?: Patient }> = ({ patient }) => {
  return (
    <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden h-[calc(100vh-var(--top-nav-height,60px))] items-center justify-center">
      <Card className="w-full max-w-lg shadow">
        <CardHeader>
          <CardTitle className="text-center text-xl">Postmortem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Content for this section is not yet implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostmortemPage;
