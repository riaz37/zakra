import { useState, useCallback } from 'react';
import { downloadReportPdf } from '../api/reports';

export function useReportDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(
    async (generationId: string, companyId?: string, filename?: string) => {
      setIsDownloading(true);
      setError(null);

      try {
        const blob = await downloadReportPdf(generationId, companyId);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `report-${generationId.slice(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Download failed';
        setError(msg);
      } finally {
        setIsDownloading(false);
      }
    },
    [],
  );

  return { download, isDownloading, error };
}
