import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { Button, Card } from '../components/ui';
import { useToast } from '../components/Toast';
import { genericExpressions } from '../data/expressions';
import type { Expression } from '../types';

export default function ReviewPage() {
  const { data, markReviewed } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const dueExpressions = (() => {
    const now = Date.now();
    return Object.values(data.reviews)
      .filter((r) => r.nextReviewAt <= now)
      .map((r) => data.expressions[r.expressionId])
      .filter(Boolean) as Expression[];
  })();

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (dueExpressions.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <header className="pt-2">
          <h1 className="text-2xl font-bold text-ink">🔁 Quick Review</h1>
          <p className="text-sm text-ink/50 mt-1">每次只看一个表达，主动回忆比反复阅读更有效。</p>
        </header>
        <Card className="text-center py-10">
          <div className="text-4xl mb-3">🌿</div>
          <h2 className="text-lg font-semibold text-ink mb-1">今天没有必须复习的内容。</h2>
          <p className="text-ink/50 text-sm">所有表达都按计划复习过了。休息一下也很好。</p>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </Card>
      </div>
    );
  }

  const expr = dueExpressions[index];
  const generic = genericExpressions.find((g) => g.text === expr.text);
  const prompt = generic?.prompt || `用"${expr.text}"造一个关于你自己的句子。`;

  const handleReviewed = () => {
    markReviewed(expr.id);
    showToast('复习完成', '✓');
    if (index + 1 < dueExpressions.length) {
      setIndex(index + 1);
      setShowAnswer(false);
    } else {
      setIndex(-1); // all done
    }
  };

  if (index === -1) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-xl font-bold text-ink mb-2">复习完成！</h2>
          <p className="text-ink/60">今天的表达都复习过了。</p>
          <div className="mt-6 space-y-2">
            <Button variant="done" full onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-ink">🔁 Quick Review</h1>
        <p className="text-sm text-ink/50 mt-1">
          {index + 1} / {dueExpressions.length} · 每次只看一个
        </p>
      </header>

      <Card>
        {!showAnswer ? (
          <div className="text-center py-6">
            <p className="text-sm text-ink/50 mb-4">还记得这个表达吗？</p>
            <h2 className="text-2xl font-bold text-ink mb-2">{expr.text}</h2>
            {expr.sourceType === 'generic' && (
              <p className="text-xs text-ink/40 mb-4">通用英语练习表达</p>
            )}
            <p className="text-ink/60 mb-6">{expr.meaning}</p>
            <div className="space-y-2">
              <Button variant="primary" full onClick={() => setShowAnswer(true)}>我想起来了</Button>
              <Button variant="ghost" full onClick={() => setShowAnswer(true)}>查看表达</Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div>
              <div className="text-xs text-ink/40 mb-1">表达</div>
              <div className="text-xl font-semibold">{expr.text}</div>
            </div>
            <div>
              <div className="text-xs text-ink/40 mb-1">意思</div>
              <div className="text-ink/70">{expr.meaning}</div>
            </div>
            {expr.example && (
              <div>
                <div className="text-xs text-ink/40 mb-1">例句</div>
                <div className="text-ink/70 italic">{expr.example}</div>
              </div>
            )}
            <div className="bg-accent/10 rounded-xl p-4">
              <div className="text-xs text-accent mb-1">现在试着回答：</div>
              <div className="text-ink">{prompt}</div>
            </div>
            <div className="space-y-2 pt-2">
              <Button variant="done" full onClick={handleReviewed}>我回答出来了 ✓</Button>
              <Button variant="ghost" full onClick={handleReviewed}>稍后复习</Button>
            </div>
          </div>
        )}
      </Card>

      <p className="text-xs text-ink/40 text-center">
        没有完成的复习不会消失，下次打开时还在这里等你。
      </p>
    </div>
  );
}
