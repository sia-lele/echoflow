import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { Button, Card } from '../components/ui';
import { exportData, importData as parseImport } from '../lib/storage';
import { useToast } from '../components/Toast';
import type { AppData } from '../types';

export default function SettingsPage() {
  const { data, importData, resetData } = useApp();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'replace' | 'merge'>('replace');

  const handleExport = () => {
    const json = exportData(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echoflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出', '📤');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = parseImport(text) as AppData;
        if (mergeStrategy === 'merge') {
          const merged: AppData = {
            ...data,
            episodes: { ...data.episodes, ...imported.episodes },
            expressions: { ...data.expressions, ...imported.expressions },
            reviews: { ...data.reviews, ...imported.reviews },
            achievements: { ...data.achievements, ...imported.achievements },
            sessions: { ...data.sessions, ...imported.sessions },
          };
          importData(merged);
        } else {
          importData(imported);
        }
        showToast('数据导入成功', '📥');
      } catch (err) {
        showToast('导入失败：文件格式不正确', '⚠️');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('确定要清空所有学习数据吗？此操作不可恢复。建议先导出备份。')) {
      resetData();
      showToast('数据已重置', '🔄');
      navigate('/');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-ink">⚙️ 设置</h1>
      </header>

      <Card>
        <h2 className="font-semibold mb-1">数据备份</h2>
        <p className="text-sm text-ink/50 mb-4">
          第一版数据保存在浏览器本地（localStorage）。Mac 和 iPhone 之间不会自动同步。
          可以通过导出 / 导入 JSON 文件转移数据。
        </p>
        <div className="space-y-2">
          <Button variant="primary" full onClick={handleExport}>
            📤 导出学习记录（JSON）
          </Button>
          <Button variant="secondary" full onClick={handleImportClick}>
            📥 导入学习记录
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="mt-4">
          <p className="text-xs text-ink/50 mb-2">导入策略：</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMergeStrategy('replace')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                mergeStrategy === 'replace' ? 'bg-accent text-white border-accent' : 'bg-card text-ink/70 border-muted'
              }`}
            >
              替换现有数据
            </button>
            <button
              onClick={() => setMergeStrategy('merge')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                mergeStrategy === 'merge' ? 'bg-accent text-white border-accent' : 'bg-card text-ink/70 border-muted'
              }`}
            >
              合并（保留双方）
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-1">关于 EchoFlow</h2>
        <p className="text-sm text-ink/60 space-y-1">
          <div>版本：1.0.0</div>
          <div>数据版本：{data.version}</div>
          <div className="text-ink/50 text-xs mt-2">
            数据存储在浏览器本地。清除浏览器数据会导致进度丢失，请定期导出备份。
          </div>
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold mb-1 text-red-500/80">危险操作</h2>
        <p className="text-sm text-ink/50 mb-4">清空所有观看记录、训练数据、表达收藏和复习记录。</p>
        <Button variant="ghost" full onClick={handleReset} className="text-red-500">
          清空所有数据
        </Button>
      </Card>

      <div className="h-4" />
    </div>
  );
}
