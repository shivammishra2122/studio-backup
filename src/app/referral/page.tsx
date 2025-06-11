'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/services/api';

const referralSubNavItems = ["New Referral", "Referral Status", "Referral History"];

const ReferralPage: NextPage<{ patient?: Patient }> = ({ patient }) => {
  const [activeSubNav, setActiveSubNav] = useState<string>(referralSubNavItems[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,60px))] bg-background text-sm p-3">
      {/* Horizontal Sub-Navigation Bar */}
      <div className="flex items-center space-x-0.5 border-b border-border px-1 pb-1 mb-3 overflow-x-auto no-scrollbar bg-card">
        {referralSubNavItems.map((item) => (
          <Button
            key={item}
            variant={activeSubNav === item ? "default" : "ghost"}
            size="sm"
            className={`text-xs px-2 py-1 h-7 whitespace-nowrap ${activeSubNav === item ? 'hover:bg-primary hover:text-primary-foreground' : 'hover:bg-accent hover:text-foreground'}`}
            onClick={() => setActiveSubNav(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow">
          <CardHeader>
            <CardTitle className="text-center text-xl">{activeSubNav}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Content for the Referral section is not yet implemented.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReferralPage;
