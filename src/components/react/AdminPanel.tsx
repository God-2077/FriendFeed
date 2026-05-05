import { useState, useEffect, useContext } from 'react';
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiSaveLine,
  RiFileCopyLine,
} from '@remixicon/react';
import { AppContext } from '../../context/AppContext';
import type { FriendLink } from '@config/type';

function emptyLink(): FriendLink {
  return { name: '', url: '', crawl: { url: '', type: 'rss' } };
}

export default function AdminPanel() {
  const store = useContext(AppContext)!;
  const {
    appData,
    activeGroup,
    setActiveGroup,
    addLink,
    updateLink,
    deleteLink,
    addGroup,
    deleteGroup,
    resetToDefault,
  } = store;

  const [visible, setVisible] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FriendLink>(emptyLink());
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    const handleDblClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.site-title')) {
        setVisible((v) => !v);
      }
    };
    document.addEventListener('dblclick', handleDblClick);
    return () => document.removeEventListener('dblclick', handleDblClick);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLinkModal) {
          setShowLinkModal(false);
        } else {
          setVisible(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showLinkModal]);

  const startAdd = () => {
    setEditForm(emptyLink());
    setEditingIndex(-1);
    setShowLinkModal(true);
  };

  const startEdit = (index: number) => {
    setEditForm({ ...activeGroup.links[index] });
    setEditingIndex(index);
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setEditingIndex(null);
  };

  const saveLink = () => {
    if (editingIndex === -1) {
      addLink(editForm);
    } else if (editingIndex !== null) {
      updateLink(editingIndex, editForm);
    }
    setShowLinkModal(false);
    setEditingIndex(null);
  };

  const doDelete = (index: number) => {
    if (window.confirm('确定删除该友站？')) {
      deleteLink(index);
    }
  };

  const doAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    addGroup(name);
    setNewGroupName('');
  };

  const doDeleteGroup = (index: number) => {
    if (appData.groups.length <= 1) return;
    if (window.confirm(`确定删除分组「${appData.groups[index].name}」？`)) {
      deleteGroup(index);
    }
  };

  const exportConfig = () => {
    let code = '// 粘贴到 src/config/config.ts 中替换 friendLinkGroups 数组\n';
    code += 'export const friendLinkGroups: FriendLinkGroup[] = ';
    code += JSON.stringify(appData.groups, null, 2);
    code += ';\n';

    navigator.clipboard.writeText(code).then(() => {
      alert('配置已复制到剪贴板，可直接粘贴到 config.ts 中');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  };

  const exportCurrentGroup = () => {
    const code = `// 当前组「${activeGroup.name}」配置，粘贴到 friendLinkGroups 中即可
export const friendLinkGroups: FriendLinkGroup[] = [
  ${JSON.stringify(activeGroup, null, 2)}
];
`;

    navigator.clipboard.writeText(code).then(() => {
      alert('当前组配置已复制到剪贴板');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  };

  if (!visible) return null;

  return (
    <div className="admin-overlay" onClick={() => { setVisible(false); }}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel-header">
          <h2 className="admin-title">友站管理</h2>
          <button className="admin-btn admin-btn-close" onClick={() => { setVisible(false); }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="admin-groups">
          <div className="admin-groups-bar">
            <div className="admin-groups-tabs">
              {appData.groups.map((group, i) => (
                <button
                  key={i}
                  className={`admin-group-tab ${i === appData.activeGroupIndex ? 'active' : ''}`}
                  onClick={() => setActiveGroup(i)}
                >
                  {group.name} ({group.links.length})
                  {appData.groups.length > 1 && (
                    <span className="group-tab-delete" onClick={(e) => { e.stopPropagation(); doDeleteGroup(i); }}>
                      <RiCloseLine size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-group-add">
            <input
              className="admin-input"
              placeholder="新分组名称"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doAddGroup(); }}
            />
            <button className="admin-btn admin-btn-sm" onClick={doAddGroup}>
              <RiAddLine size={14} /> 添加组
            </button>
          </div>
        </div>

        <div className="admin-links-header">
          <span>当前组友站列表 ({activeGroup.links.length})</span>
          <button className="admin-btn admin-btn-sm admin-btn-save" onClick={startAdd}>
            <RiAddLine size={14} /> 添加友站
          </button>
        </div>

        <div className="admin-links-list">
          {activeGroup.links.map((link, i) => (
            <div key={i} className="admin-link-item">
              <div className="admin-link-info">
                <span className="admin-link-name">{link.name}</span>
                <span className="admin-link-url">{link.url}</span>
                <span className="admin-link-feed">{link.crawl.url}</span>
              </div>
              <div className="admin-link-actions">
                <button className="admin-btn admin-btn-sm" onClick={() => startEdit(i)}>
                  <RiEdit2Line size={14} />
                </button>
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => doDelete(i)}>
                  <RiDeleteBinLine size={14} />
                </button>
              </div>
            </div>
          ))}
          {activeGroup.links.length === 0 && (
            <div className="admin-empty">暂无友站，点击上方按钮添加</div>
          )}
        </div>

        <div className="admin-footer">
          <button className="admin-btn admin-btn-export" onClick={exportConfig}>
            <RiFileCopyLine size={14} /> 导出全部配置
          </button>
          <button className="admin-btn admin-btn-export" onClick={exportCurrentGroup}>
            <RiFileCopyLine size={14} /> 导出当前组
          </button>
          <button className="admin-btn admin-btn-reset" onClick={() => {
            if (window.confirm('确定重置为默认配置？所有修改将丢失。')) {
              resetToDefault();
            }
          }}>
            重置为默认
          </button>
        </div>
      </div>

      {showLinkModal && (
        <div className="link-modal-overlay" onClick={closeLinkModal}>
          <div className="link-modal" onClick={(e) => e.stopPropagation()}>
            <div className="link-modal-header">
              <h3 className="link-modal-title">
                {editingIndex === -1 ? '添加友站' : '编辑友站'}
              </h3>
              <button className="admin-btn admin-btn-close" onClick={closeLinkModal}>
                <RiCloseLine size={18} />
              </button>
            </div>
            <div className="link-modal-body">
              <div className="link-modal-field">
                <label className="link-modal-label">友站名称</label>
                <input
                  className="admin-input"
                  placeholder="例如：CC米饭"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="link-modal-field">
                <label className="link-modal-label">网站地址</label>
                <input
                  className="admin-input"
                  placeholder="例如：https://www.ccrice.com"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                />
              </div>
              <div className="link-modal-field">
                <label className="link-modal-label">Feed 地址</label>
                <input
                  className="admin-input"
                  placeholder="例如：https://www.ccrice.com/feed/"
                  value={editForm.crawl.url}
                  onChange={(e) => setEditForm({ ...editForm, crawl: { ...editForm.crawl, url: e.target.value } })}
                />
              </div>
            </div>
            <div className="link-modal-footer">
              <button className="admin-btn admin-btn-save" onClick={saveLink}>
                <RiSaveLine size={14} /> 保存
              </button>
              <button className="admin-btn" onClick={closeLinkModal}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
