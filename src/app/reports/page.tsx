'use client';

import React from 'react';
import { ReportGeneratorView } from '@/components/reports/ReportGeneratorView';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <ReportGeneratorView />
    </div>
  );
}
