import React, { useEffect } from 'react';
import { useOrderConfig } from '../hooks/useOrderConfig';
import {
    Palette,
    Save,
    Store,
    GripVertical,
    Trash2,
    Plus,
    Type,
    AlignLeft,
    Calendar,
    ListOrdered,
    CheckSquare,
    ChevronDown,
    Image as ImageIcon,
    Info,
    ArrowUp,
    ArrowDown,
    Upload,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfigPage: React.FC = () => {
    const {
        loading,
        elements,
        basicInfo,
        setBasicInfo,
        loadConfig,
        saveConfig,
        addElement,
        removeElement,
        updateElement,
        moveElement
    } = useOrderConfig();

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('이미지 크기는 5MB 이하여야 합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updateElement(id, { options: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'Text': return '단답형';
            case 'TextArea': return '서술형';
            case 'Radio': return '단일선택';
            case 'Checkbox': return '다중선택';
            case 'Select': return '목록선택';
            case 'Date': return '날짜';
            case 'Image': return '이미지';
            case 'Notice': return '안내문구';
            default: return type;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-white">
                        <Palette className="text-primary" size={40} />
                        주문서 디자인 설정
                    </h1>
                    <p className="text-text-muted font-medium">고객들이 보게 될 온라인 주문서의 항목과 디자인을 관리하세요.</p>
                </div>

                <button
                    onClick={saveConfig}
                    disabled={loading}
                    className="btn btn-primary px-8 py-4 shadow-xl shadow-primary/20 flex items-center gap-2 font-black"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    저장하기
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Editor */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Basic Info */}
                    <section className="glass p-8 border-l-4 border-l-primary bg-primary/5 space-y-6">
                        <h3 className="text-lg font-black flex items-center gap-2"><Store size={20} className="text-primary" /> 기본 정보</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase">상호명</label>
                                <input
                                    className="input-field"
                                    placeholder="예: 소복 베이커리"
                                    value={basicInfo.company_name}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, company_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase">인사말 / 공지</label>
                                <textarea
                                    className="input-field h-24 py-4"
                                    placeholder="예: 안녕하세요! 신선한 재료로 당일 생산합니다."
                                    value={basicInfo.shop_notice}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, shop_notice: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase">입금 계좌 정보</label>
                                <input
                                    className="input-field"
                                    placeholder="예: 카카오뱅크 3333-00-1234567 박일용"
                                    value={basicInfo.bank_account}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, bank_account: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Form Elements */}
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {elements.map((el, index) => (
                                <motion.div
                                    key={el.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="glass group overflow-hidden border border-white/5 active:shadow-2xl active:scale-[1.01] transition-all"
                                >
                                    <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <button onClick={(e) => { e.stopPropagation(); if (index > 0) moveElement(index, index - 1); }} className="p-1 hover:text-white transition-all"><ArrowUp size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); if (index < elements.length - 1) moveElement(index, index + 1); }} className="p-1 hover:text-white transition-all"><ArrowDown size={14} /></button>
                                            </div>
                                            <GripVertical className="text-text-muted cursor-move" size={18} />
                                            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-black uppercase text-white/50 border border-white/10">{getTypeName(el.type)}</span>
                                        </div>
                                        <button onClick={() => removeElement(el.id!)} className="p-2 hover:bg-red-400/10 text-text-muted hover:text-red-400 rounded-lg transition-all"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {el.type === 'Image' && (
                                            <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                                                {el.options ? (
                                                    <img src={el.options} className="max-h-48 rounded-xl shadow-2xl" alt="Preview" />
                                                ) : (
                                                    <ImageIcon size={48} className="text-text-muted" />
                                                )}
                                                <label className="btn btn-primary py-2 px-4 text-xs cursor-pointer">
                                                    <Upload size={14} className="mr-2" /> 이미지 업로드
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, el.id!)} />
                                                </label>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{el.type === 'Notice' ? '안내 문구' : '항목 제목'}</label>
                                            {el.type === 'Notice' ? (
                                                <textarea
                                                    className="input-field h-24 py-4"
                                                    value={el.label}
                                                    onChange={(e) => updateElement(el.id!, { label: e.target.value })}
                                                />
                                            ) : el.type !== 'Image' && (
                                                <input
                                                    className="input-field font-bold"
                                                    value={el.label}
                                                    onChange={(e) => updateElement(el.id!, { label: e.target.value })}
                                                />
                                            )}
                                        </div>

                                        {['Select', 'Radio', 'Checkbox'].includes(el.type) && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                                    옵션 입력 (쉼표로 구분) <Info size={12} className="text-primary" />
                                                </label>
                                                <input
                                                    className="input-field text-sm"
                                                    placeholder="예: 기본, 선물포장 (+1000), 보냉백 (+500)"
                                                    value={el.options}
                                                    onChange={(e) => updateElement(el.id!, { options: e.target.value })}
                                                />
                                                <p className="text-[10px] text-text-muted">Tip: <strong className="text-primary">(+금액)</strong>을 붙이면 자동으로 결제 금액에 추가됩니다.</p>
                                            </div>
                                        )}

                                        {el.type !== 'Notice' && el.type !== 'Image' && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`req-${el.id}`}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                                    checked={el.required}
                                                    onChange={(e) => updateElement(el.id!, { required: e.target.checked })}
                                                />
                                                <label htmlFor={`req-${el.id}`} className="text-xs font-bold text-text-muted cursor-pointer">필수 입력 항목</label>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {elements.length === 0 && (
                            <div className="py-20 text-center glass border-dashed bg-white/0 border-white/10">
                                <AlertCircle className="mx-auto text-text-muted mb-4" size={48} />
                                <p className="text-text-muted font-bold text-lg">아직 디자인된 항목이 없습니다.</p>
                                <p className="text-text-muted text-sm italic">오른쪽 도구상자에서 항목을 추가하세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Toolbox */}
                <div className="lg:col-span-4 h-fit sticky top-24">
                    <div className="glass overflow-hidden border-t-2 border-t-primary">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="font-black flex items-center gap-2"><Plus size={18} className="text-primary" /> 항목 추가</h3>
                        </div>
                        <div className="p-4 space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2">입력 필드</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => addElement('Text', '텍스트 입력')} className="toolbox-btn"><Type size={16} /> 텍스트 (한 줄)</button>
                                    <button onClick={() => addElement('TextArea', '상세 내용 입력')} className="toolbox-btn"><AlignLeft size={16} /> 텍스트 (여러 줄)</button>
                                    <button onClick={() => addElement('Date', '날짜 선택')} className="toolbox-btn"><Calendar size={16} /> 날짜 선택</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2 font-black text-emerald-400">선택 필드 (금액 추가 가능)</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => addElement('Radio', '하나만 선택')} className="toolbox-btn hover:border-emerald-500/30 text-emerald-100"><ListOrdered size={16} /> 단일 선택 (라디오)</button>
                                    <button onClick={() => addElement('Checkbox', '여러개 선택')} className="toolbox-btn hover:border-emerald-500/30 text-emerald-100"><CheckSquare size={16} /> 다중 선택 (체크박스)</button>
                                    <button onClick={() => addElement('Select', '목록에서 선택')} className="toolbox-btn hover:border-emerald-500/30 text-emerald-100"><ChevronDown size={16} /> 드롭다운 (목록 선택)</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2 font-black text-info">꾸미기</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => addElement('Image', '')} className="toolbox-btn hover:border-info/30 text-info"><ImageIcon size={16} /> 이미지 추가</button>
                                    <button onClick={() => addElement('Notice', '공지사항 입력')} className="toolbox-btn hover:border-info/30 text-info"><Info size={16} /> 안내 문구</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .toolbox-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #94A3B8;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toolbox-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(4px);
        }
        .toolbox-btn svg {
          color: inherit;
        }
      `}</style>
        </div>
    );
};

export default ConfigPage;
