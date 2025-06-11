'use client';

import type { NextPage } from 'next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Patient } from '@/services/api';

const reportNavItems = ["Patient Report", "Graph Report"];

type ReportCategory = {
  title: string;
  items: string[];
};

const patientReportCategories: ReportCategory[] = [
  {
    title: "Patient Information",
    items: [
      "Disability",
      "GVCPRS Usage Statistics",
      "Lab Status",
      "Med Admin Log (BCMA)",
      "Med Admin History (BCMA)",
    ],
  },
  {
    title: "Visit/admission",
    items: [
      "Future Clinical",
      "ICD Procedure",
      "ICD Surgery",
      "Discharge Report",
    ],
  },
  {
    title: "Order",
    items: [
      "Daily Order Summary",
      "Order Summary for a Date",
      "Medication Admin. Report",
    ],
  },
  {
    title: "Outpatient Encounter/ GAF Scores",
    items: ["Immunization", "Skin Test"],
  },
  {
    title: "Health Summary",
    items: [
      "Patient Personal Hx",
      "Vital Signs",
      "24 Hrs Patient Record",
      "Compliance Dashboard",
      "Clinical Note Export",
    ],
  },
];


const ReportPage: NextPage<{ patient?: Patient }> = ({ patient }) => {
  const [activeReportTab, setActiveReportTab] = useState<string>(reportNavItems[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--top-nav-height,60px))] bg-background text-sm p-2">
      {/* Horizontal Navigation Bar */}
      <div className="flex items-center space-x-0.5 border-b border-border px-1 pb-1 mb-2 overflow-x-auto no-scrollbar bg-card">
        {reportNavItems.map((item) => (
          <Button
            key={item}
            variant={activeReportTab === item ? "default" : "ghost"}
            size="sm"
            className={`text-xs px-2 py-1 h-7 whitespace-nowrap ${activeReportTab === item ? 'hover:bg-primary hover:text-primary-foreground' : 'hover:bg-accent hover:text-foreground'}`}
            onClick={() => setActiveReportTab(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeReportTab === "Patient Report" && (
        <Card className="flex-1 flex flex-col shadow-sm overflow-hidden border-border">
          <CardContent className="p-2 flex-1 flex space-x-2 overflow-x-auto">
            {patientReportCategories.map((category) => (
              <div key={category.title} className="flex flex-col w-48 shrink-0 border bg-card rounded-md shadow-sm">
                <div className="p-2 text-sm font-semibold text-center bg-accent text-accent-foreground border-b rounded-t-md">
                  {category.title}
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-2 space-y-1.5">
                    {category.items.map((item) => (
                      <Button
                        key={item}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-7 text-xs bg-card hover:bg-muted/80 rounded-md border-border shadow-sm"
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeReportTab === "Graph Report" && (
        <Card className="flex-1 flex items-center justify-center shadow-sm">
          <CardContent className="text-center">
            <CardTitle className="text-xl text-muted-foreground">
              Graph Report
            </CardTitle>
            <p className="text-sm text-muted-foreground">Content for this section is not yet implemented.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportPage;
