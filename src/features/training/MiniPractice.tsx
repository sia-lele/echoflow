import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../lib/AppContext';
import { Button, Card } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { randomGenericExpression, expressionToGeneric } from '../../data/expressions';
import type { Episode, TrainingSession } from '../../types';

interface Props {
  episode: Episode;
  showTitle: string;
  focus: 'listening' | 'speaking';
}

export default function MiniPractice({ episode, showTitle }: Props) {
  const { saveSession, completeSession, saveExpression } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [expr] = useState(() => randomGenericExpression());
  const [saved, setSaved] = useState(false);
  const sessionIdRef = useRef(`mini-${Date.now()}`);
  const sessionId = sessionIdRef.current;

  const startSession = () => {
    const session: TrainingSession = {
      id: sessionId,
      episodeId: episode.id,
      showId: episode.showId,
      mode: 'mini',
      currentStep: 1,
      completedSteps: [],
      startedAt: Date.now(),
      completedAt: null,
      status: 'in_progress',
    };
    saveSession(session);
  };

  const finish = () => {
    if (!saved) {
      saveExpression(expressionToGeneric(expr, episode.showId, episode.id));
      setSaved(true);
    }
    completeSession(sessionId);
    showToast('3 分钟练习完成！', '✨');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-xl font-bold text-ink mb-2">3 分钟英语练习</h2>
            <p className="text-ink/60 mb-6">今天只做三件小事，马上就能完成。</p>
            <Button variant="primary" full onClick={() => { startSession(); setStep(2); }}>
              开始 3 分钟练习
            </Button>
          </div>
        );
      case 2:
        return (
          <Card>
            <div className="text-4xl mb-3">🎧</div>
            <h2 className="text-xl font-bold text-ink mb-3">第一步：听一小段英语</h2>
            <p className="text-ink/60 mb-6">
              打开你正在看的剧，随便听一小段对话。不用听清每个词，感受一下语流就好。
            </p>
            <Button variant="primary" full onClick={() => setStep(3)}>我听过了</Button>
          </Card>
        );
      case 3:
        return (
          <Card>
            <div className="text-4xl mb-3">💬</div>
            <h2 className="text-xl font-bold text-ink mb-3">第二步：跟读一个实用表达</h2>
            <div className="bg-soft rounded-xl p-4 mb-4 text-center">
              <div className="text-xs text-ink/40 mb-2">今天的表达</div>
              <div className="text-lg font-semibold">{expr.text}</div>
              <div className="text-sm text-ink/60 mt-1">{expr.meaning}</div>
            </div>
            <p className="text-ink/50 text-sm mb-4">跟读两遍：第一遍听，第二遍自己说。</p>
            <Button variant="primary" full onClick={() => setStep(4)}>我读了两遍</Button>
          </Card>
        );
      case 4:
        return (
          <Card>
            <div className="text-4xl mb-3">🧠</div>
            <h2 className="text-xl font-bold text-ink mb-3">第三步：用这句话表达自己</h2>
            <div className="bg-accent/10 rounded-xl p-4 mb-4">
              <div className="text-xs text-accent mb-1">试着回答：</div>
              <div className="text-ink">{expr.prompt}</div>
            </div>
            <p className="text-ink/50 text-sm mb-4">可以大声说出来，也可以在心里想。2—3 句话就够了。</p>
            <Button variant="done" full onClick={() => { finish(); setStep(5); }}>我完成了</Button>
          </Card>
        );
      case 5:
        return (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-xl font-bold text-ink mb-2">3-Minute Practice Completed!</h2>
            <p className="text-ink/60 mb-6">今天也完成了一次英语练习。</p>
            <div className="space-y-2">
              <Button variant="secondary" full onClick={() => navigate('/')}>返回首页</Button>
              <Button variant="ghost" full onClick={() => navigate('/learning')}>进行完整训练</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="pt-2 pb-1">
        <button onClick={() => navigate(-1)} className="text-sm text-accent">← 返回</button>
      </div>
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors ${
              s === step ? 'bg-accent scale-125' : s < step ? 'bg-accent/60' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {renderStep()}
    </div>
  );
}
