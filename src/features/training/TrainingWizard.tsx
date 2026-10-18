import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../lib/AppContext';
import { Button, Card, Chip } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { genericExpressions, randomGenericExpression, expressionToGeneric } from '../../data/expressions';
import type { Episode, TrainingSession, TrainingMode } from '../../types';

interface Props {
  episode: Episode;
  showTitle: string;
  focus: 'listening' | 'speaking';
}

const TOTAL_STEPS = 9;

interface StepState {
  expressionText: string;
  expressionMeaning: string;
  expressionExample: string;
  useGeneric: boolean;
  listenedCount: number;
  answerText: string;
  issues: string[];
}

export default function TrainingWizard({ episode, showTitle, focus }: Props) {
  const { data, saveSession, completeSession, saveExpression } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Find existing in-progress session
  const existingSession = Object.values(data.sessions).find(
    (s) => s.episodeId === episode.id && s.status === 'in_progress',
  );

  const [step, setStep] = useState(existingSession?.currentStep || 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(existingSession?.completedSteps || []);
  const [sessionId] = useState(existingSession?.id || `sess-${Date.now()}`);
  const [state, setState] = useState<StepState>({
    expressionText: '',
    expressionMeaning: '',
    expressionExample: '',
    useGeneric: false,
    listenedCount: 0,
    answerText: '',
    issues: [],
  });

  // Save session progress
  useEffect(() => {
    // Don't overwrite if already completed
    const existing = data.sessions[sessionId];
    if (existing?.status === 'completed') return;
    const session: TrainingSession = {
      id: sessionId,
      episodeId: episode.id,
      showId: episode.showId,
      mode: 'standard',
      currentStep: step,
      completedSteps,
      startedAt: existingSession?.startedAt || Date.now(),
      completedAt: null,
      status: 'in_progress',
    };
    saveSession(session);
  }, [step, completedSteps]);

  const next = (s: number = step) => {
    const nextStep = s + 1;
    if (nextStep > TOTAL_STEPS) {
      finish();
      return;
    }
    setCompletedSteps((prev) => Array.from(new Set([...prev, s])));
    setStep(nextStep);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const finish = () => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, step])));
    completeSession(sessionId);
    showToast('今天的英语训练完成了！', '✨');
  };

  // ---------- Step renderers ----------
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepContent
            icon="🎬"
            title="先享受电视剧"
            desc={
              <div className="space-y-2">
                <p>今天观看：<b>{showTitle}</b></p>
                <p className="text-ink/60">
                  Season {episode.seasonNumber} · Episode {String(episode.episodeNumber).padStart(2,'0')}
                </p>
                <p className="text-ink/50 text-sm">现在只需要正常看剧。建议打开英文字幕。不需要查单词，不需要记笔记，不需要频繁暂停。</p>
              </div>
            }
          >
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => next()}>我看完了</Button>
              {episode.watched && <Button variant="done" onClick={() => next()}>已观看，直接开始训练</Button>}
            </div>
          </StepContent>
        );
      case 2:
        return (
          <StepContent
            icon="🎞️"
            title="选一小段对话"
            desc={
              <div className="space-y-2">
                <p>从刚才看过的内容里选 30—60 秒。</p>
                <p className="text-ink/50 text-sm">不用挑最好的片段。如果不知道选哪一段，直接选刚才看过的最后一段完整日常对话。</p>
              </div>
            }
          >
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => next()}>我选好了</Button>
              <Button variant="secondary" onClick={() => next()}>使用默认选择方法</Button>
            </div>
          </StepContent>
        );
      case 3:
        return (
          <StepContent
            icon="🎧"
            title="关闭字幕，听第一遍"
            desc={
              <div className="space-y-2">
                <p>关闭英文字幕，听完整段对话。</p>
                <p className="text-ink/50 text-sm">重点理解：他们在谈论什么？人物的情绪是什么？不用听清每个单词。</p>
              </div>
            }
          >
            <Button variant="primary" onClick={() => next()}>我听完了</Button>
          </StepContent>
        );
      case 4:
        return (
          <StepContent
            icon="🔍"
            title="打开字幕，核对内容"
            desc={
              <div className="space-y-2">
                <p>打开英文字幕，再听一次。</p>
                <p className="text-ink/50 text-sm">只需要找到最明显的一两个问题。可以选择，也可以跳过。</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['声音没听清', '单词认识，反应太慢', '句子太长', '不理解表达', '没有明显问题'].map((issue) => (
                    <button
                      key={issue}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          issues: s.issues.includes(issue)
                            ? s.issues.filter((i) => i !== issue)
                            : [...s.issues, issue],
                        }))
                      }
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        state.issues.includes(issue)
                          ? 'bg-accent text-white border-accent'
                          : 'bg-card text-ink/70 border-muted'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            <Button variant="primary" onClick={() => next()}>核对完成</Button>
          </StepContent>
        );
      case 5:
        return (
          <StepContent
            icon="🎧"
            title="再听一遍"
            desc={
              <div className="space-y-2">
                <p>现在关闭英文字幕，重新听这段对话。</p>
                <p className="text-ink/50 text-sm">尝试直接理解英语。不需要在脑海中逐词翻译成中文。</p>
                <p className="text-xs text-ink/40">已听次数：{state.listenedCount}</p>
              </div>
            }
          >
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => next()}>我听懂大意了</Button>
              <Button variant="secondary" onClick={() => setState((s) => ({ ...s, listenedCount: s.listenedCount + 1 }))}>
                再听一次
              </Button>
              <Button variant="ghost" onClick={() => next()}>继续下一步</Button>
            </div>
          </StepContent>
        );
      case 6: {
        return (
          <StepContent
            icon="💬"
            title="今天只学两个表达"
            desc={
              <div className="space-y-3">
                <p className="text-ink/50 text-sm">优先学习日常交流中能反复使用的表达、常见句型、情绪表达、解释原因的句式。</p>
                {state.useGeneric ? (
                  <div className="bg-soft rounded-xl p-4 space-y-2">
                    <div className="text-xs text-ink/40">通用英语练习表达（非剧集原台词）</div>
                    <div className="text-lg font-semibold">{state.expressionText}</div>
                    <div className="text-sm text-ink/60">{state.expressionMeaning}</div>
                    <div className="text-sm italic text-ink/50">例：{state.expressionExample}</div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const g = randomGenericExpression();
                          setState((s) => ({ ...s, expressionText: g.text, expressionMeaning: g.meaning, expressionExample: g.example }));
                        }}
                      >
                        换一个
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="粘贴或输入你听到的句子"
                      value={state.expressionText}
                      onChange={(e) => setState((s) => ({ ...s, expressionText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-muted text-sm"
                    />
                    <input
                      type="text"
                      placeholder="这个表达的意思"
                      value={state.expressionMeaning}
                      onChange={(e) => setState((s) => ({ ...s, expressionMeaning: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-muted text-sm"
                    />
                    <input
                      type="text"
                      placeholder="例句（可选）"
                      value={state.expressionExample}
                      onChange={(e) => setState((s) => ({ ...s, expressionExample: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-muted text-sm"
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    if (!state.useGeneric) {
                      const g = randomGenericExpression();
                      setState((s) => ({ ...s, useGeneric: true, expressionText: g.text, expressionMeaning: g.meaning, expressionExample: g.example }));
                    } else {
                      setState((s) => ({ ...s, useGeneric: false }));
                    }
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  {state.useGeneric ? '改为自己输入' : '给我一个练习表达'}
                </button>
              </div>
            }
          >
            <div className="flex gap-2">
              <Button
                variant="done"
                onClick={() => {
                  if (state.expressionText.trim()) {
                    saveExpression(expressionToGeneric({
                      text: state.expressionText,
                      meaning: state.expressionMeaning || '来自剧集的表达',
                      example: state.expressionExample || state.expressionText,
                      prompt: '',
                    }, episode.showId, episode.id));
                    showToast('已保存这个表达', '💬');
                  }
                  next();
                }}
              >
                保存这个表达
              </Button>
              <Button variant="ghost" onClick={() => next()}>跳过</Button>
            </div>
          </StepContent>
        );
      }
      case 7:
        return (
          <StepContent
            icon="🗣️"
            title="模仿角色说话"
            desc={
              <div className="space-y-2">
                {state.expressionText && <p className="bg-soft px-3 py-2 rounded-lg text-sm">"{state.expressionText}"</p>}
                <p>选择刚才的一个表达。做两遍：</p>
                <ol className="text-sm text-ink/60 list-decimal list-inside space-y-1">
                  <li>听角色说，然后模仿。</li>
                  <li>关闭原声，自己说出来。</li>
                </ol>
                <p className="text-ink/50 text-sm">注意句子重音、自然语调、连读、弱读、情绪。</p>
                <p className="text-xs text-ink/40">录音功能可选，不录音也可以直接完成。</p>
              </div>
            }
          >
            <Button variant="primary" onClick={() => next()}>我完成模仿了</Button>
          </StepContent>
        );
      case 8: {
        const generic = genericExpressions.find((g) => g.text === state.expressionText);
        const prompt = generic?.prompt || `用今天学到的表达"${state.expressionText || '...'}"讲一件你自己的事。`;
        return (
          <StepContent
            icon="🧠"
            title="现在，离开台词"
            desc={
              <div className="space-y-3">
                <p>用今天学到的表达，讲讲自己的生活。建议回答 2—3 句话，不要要求复杂表达。</p>
                <div className="bg-accent/10 rounded-xl p-4">
                  <div className="text-xs text-accent mb-1">Try to answer:</div>
                  <div className="text-ink">{prompt}</div>
                </div>
                <textarea
                  value={state.answerText}
                  onChange={(e) => setState((s) => ({ ...s, answerText: e.target.value }))}
                  placeholder="可以打字回答（可选）…"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-muted text-sm resize-none"
                />
              </div>
            }
          >
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => next()}>✅ 我已经说出来了</Button>
              <Button variant="ghost" onClick={() => next()}>跳过</Button>
            </div>
          </StepContent>
        );
      }
      case 9:
        return (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✨</div>
            <h2 className="text-xl font-bold text-ink mb-2">Today's English Practice Completed!</h2>
            <p className="text-ink/60 mb-4">今天你已经：</p>
            <ul className="text-sm text-ink/70 space-y-1.5 max-w-xs mx-auto text-left mb-6">
              <li className={completedSteps.includes(1) ? '' : 'opacity-40'}>✓ 接触了英语原声</li>
              <li className={completedSteps.includes(3) || completedSteps.includes(5) ? '' : 'opacity-40'}>✓ 练习了听力理解</li>
              <li className={completedSteps.includes(6) ? '' : 'opacity-40'}>✓ 学习了实用表达</li>
              <li className={completedSteps.includes(7) ? '' : 'opacity-40'}>✓ 模仿了英语语音</li>
              <li className={completedSteps.includes(8) ? '' : 'opacity-40'}>✓ 尝试独立表达</li>
            </ul>
            <div className="space-y-2">
              <Button variant="done" full onClick={finish}>完成今天的训练</Button>
              <Button variant="secondary" full onClick={() => navigate('/watch-map')}>返回追剧地图</Button>
              <Button variant="ghost" full onClick={() => navigate('/')}>返回首页</Button>
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
        <Link to="/" className="text-sm text-accent hover:underline">← 返回</Link>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors ${
              s === step ? 'bg-done scale-125' : s < step || completedSteps.includes(s) ? 'bg-done/60' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="text-center text-xs text-ink/40 mb-3">
        STEP {String(step).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}
        {focus === 'listening' && <span className="ml-2">· 侧重听力理解</span>}
        {focus === 'speaking' && <span className="ml-2">· 侧重口语表达</span>}
      </div>

      {renderStep()}

      {step > 1 && step < 9 && (
        <div className="mt-4 text-center">
          <button onClick={back} className="text-sm text-ink/50 hover:text-ink">← 返回上一步</button>
        </div>
      )}
    </div>
  );
}

function StepContent({
  icon,
  title,
  desc,
  children,
}: {
  icon: string;
  title: string;
  desc: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="text-xl font-bold text-ink mb-3">{title}</h2>
      <div className="text-ink/70 mb-5">{desc}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </Card>
  );
}

// Fix Button size variant - ui.tsx Button doesn't have size prop but TS may accept extra props via HTML attributes
// Add size to Button props - we'll just omit it here
