import { PipelineSummary } from '@/components/features/chat/pipeline-step-list';
import { UserQueryBubble } from './user-query-bubble';
import { ReportCard, normalizeReportSteps, type CompletedTurn } from './report-card';

export function CompletedTurnView({ turn }: { turn: CompletedTurn }) {
  return (
    <div className="space-y-4">
      <UserQueryBubble query={turn.query} />
      <div className="space-y-3">
        <PipelineSummary steps={normalizeReportSteps(turn.steps)} />
        <ReportCard turn={turn} />
      </div>
    </div>
  );
}
