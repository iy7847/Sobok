import React, { useEffect, useState } from 'react';
import { useOrderConfig } from '../hooks/useOrderConfig';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
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
    Upload,
    AlertCircle,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import type { FormElement } from '../types';

interface ConfigItemProps {
    item: FormElement;
    index: number;
    totalCount: number;
    updateElement: (id: string, updates: Partial<FormElement>) => void;
    removeElement: (id: string) => void;
    moveElement: (from: number, to: number) => void;
    user: any;
}

import { compressImage } from '../utils/image';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GuideButton } from '../components/common/GuideButton';
import { GuideModal } from '../components/common/GuideModal';

const ConfigItem = ({ item, index, totalCount, updateElement, removeElement, moveElement, user }: ConfigItemProps) => {
    const controls = useDragControls();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            const compressed = await compressImage(file, 800, 0.7);
            // Convert base64 to blob
            const res = await fetch(compressed);
            const blob = await res.blob();
            const fileName = `${user.id}/banner_${id}_${Date.now()}.jpg`;

            const { error } = await supabase.storage
                .from('shop-assets')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('shop-assets')
                .getPublicUrl(fileName);

            updateElement(id, { options: publicUrl });
        } catch (error) {
            console.error('Image compression failed:', error);
            alert('이미지 처리 중 오류가 발생했습니다: ' + (error as any).message);
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'Text': return '단답형';
            case 'TextArea': return '서술형';
            case 'Radio': return '단일선택';
            case 'Checkbox': return '다중선택';
            case 'Select': return '목록선택';
            case 'Date': return '날짜';
            case 'Image': return '이미지 (표시)';
            case 'FileUpload': return '사진 첨부 (입력)';
            case 'Notice': return '안내문구';
            default: return type;
        }
    };

    return (
        <Reorder.Item
            value={item}
            id={item.id}
            dragListener={false}
            dragControls={controls}
            whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.3)", zIndex: 10 }}
            transition={{ duration: 0.2 }}
            className="glass group overflow-hidden border border-white/5 relative z-0"
        >
            <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5 select-none">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col mr-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); if (index > 0) moveElement(index, index - 1); }}
                            className={`p-0.5 hover:text-white transition-colors ${index === 0 ? 'text-white/10 cursor-not-allowed' : 'text-text-muted'}`}
                            disabled={index === 0}
                        >
                            <ArrowUp size={12} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); if (index < totalCount - 1) moveElement(index, index + 1); }}
                            className={`p-0.5 hover:text-white transition-colors ${index === totalCount - 1 ? 'text-white/10 cursor-not-allowed' : 'text-text-muted'}`}
                            disabled={index === totalCount - 1}
                        >
                            <ArrowDown size={12} />
                        </button>
                    </div>
                    <div
                        className="p-2 cursor-grab active:cursor-grabbing hover:bg-white/10 rounded transition-colors touch-none"
                        onPointerDown={(e) => controls.start(e)}
                    >
                        <GripVertical className="text-text-muted" size={18} />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-black uppercase text-white/50 border border-white/10">
                        {getTypeName(item.type)}
                    </span>
                </div>
                <button
                    onClick={() => removeElement(item.id!)}
                    className="p-2 hover:bg-red-400/10 text-text-muted hover:text-red-400 rounded-lg transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="p-6 space-y-4">
                {item.type === 'Image' && (
                    <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                        {item.options ? (
                            <img src={item.options} className="max-h-48 rounded-xl shadow-2xl" alt="Preview" />
                        ) : (
                            <ImageIcon size={48} className="text-text-muted" />
                        )}
                        <label className="inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 text-xs px-4 py-2 gap-2 cursor-pointer">
                            <Upload size={14} /> 이미지 업로드
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, item.id!)} />
                        </label>
                    </div>
                )}

                {item.type === 'FileUpload' && (
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 text-text-muted">
                        <div className="p-3 bg-white/5 rounded-lg">
                            <Upload size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold mb-1">파일 업로드 영역</p>
                            <p className="text-[10px] opacity-70">고객이 이미지를 첨부할 수 있는 버튼이 표시됩니다.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {item.type === 'Notice' ? '안내 문구' : '항목 제목'}
                    </label>
                    {item.type === 'Notice' ? (
                        <textarea
                            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-text-main placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 h-24"
                            value={item.label}
                            onChange={(e) => updateElement(item.id!, { label: e.target.value })}
                        />
                    ) : item.type !== 'Image' && (
                        <Input
                            className="font-bold"
                            value={item.label}
                            onChange={(e) => updateElement(item.id!, { label: e.target.value })}
                            containerClassName="!space-y-0"
                        />
                    )}
                </div>

                {['Select', 'Radio', 'Checkbox'].includes(item.type) && (
                    <Input
                        label="옵션 입력 (쉼표로 구분)"
                        className="text-sm"
                        placeholder="예: 기본, 선물포장 (+1000), 보냉백 (+500)"
                        value={item.options}
                        onChange={(e) => updateElement(item.id!, { options: e.target.value })}
                        helperText="Tip: (+금액)을 붙이면 자동으로 결제 금액에 추가됩니다."
                        rightIcon={<Info size={12} className="text-primary" />}
                    />
                )}

                {item.type !== 'Notice' && item.type !== 'Image' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`req-${item.id}`}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                            checked={item.required}
                            onChange={(e) => updateElement(item.id!, { required: e.target.checked })}
                        />
                        <label htmlFor={`req-${item.id}`} className="text-xs font-bold text-text-muted cursor-pointer">
                            필수 입력 항목
                        </label>
                    </div>
                )}
            </div>
        </Reorder.Item>
    );
};

const ConfigPage: React.FC = () => {
    const { user } = useAuth();
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
        moveElement,
        setElements
    } = useOrderConfig();
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            const compressed = await compressImage(file, 800, 0.7);
            // Convert base64 to blob
            const res = await fetch(compressed);
            const blob = await res.blob();
            const fileName = `${user.id}/logo_${Date.now()}.jpg`;

            const { error } = await supabase.storage
                .from('shop-assets')
                .upload(fileName, blob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('shop-assets')
                .getPublicUrl(fileName);

            // Check if ShopLogo already exists
            const existingLogo = elements.find(el => el.type === 'ShopLogo');

            if (existingLogo) {
                // Update existing
                updateElement(existingLogo.id, { options: publicUrl });
            } else {
                // Create new
                const newLogo: FormElement = {
                    id: Date.now().toString(),
                    type: 'ShopLogo',
                    label: '상점 로고',
                    required: false,
                    options: publicUrl
                };
                setElements(prev => [...prev, newLogo]);
            }
        } catch (error) {
            console.error('Logo upload failed:', error);
            alert('이미지 처리 중 오류가 발생했습니다: ' + (error as any).message);
        }
    };

    const shopLogo = elements.find(el => el.type === 'ShopLogo');

    const toolboxButtonClass = "w-full flex items-center gap-3 px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl text-[13px] font-bold text-text-muted text-left transition-all duration-200 hover:bg-white dark:hover:bg-white/10 hover:shadow-md dark:hover:shadow-none hover:text-primary dark:hover:text-white hover:translate-x-1";

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-text-main">
                        <Palette className="text-primary" size={40} />
                        환경 설정
                        <GuideButton onClick={() => setShowGuide(true)} className="ml-2" />
                    </h1>
                    <p className="text-text-muted font-medium">고객들이 보게 될 온라인 주문서의 항목과 디자인을 관리하세요.</p>
                </div>


            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Editor */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Basic Info */}
                    <section className="glass p-8 border-l-4 border-l-primary bg-primary/5 space-y-6">
                        <h3 className="text-lg font-black flex items-center gap-2 text-text-main"><Store size={20} className="text-primary" /> 기본 정보</h3>
                        <div className="space-y-4">
                            <Input
                                label="상호명"
                                placeholder="예: 소복 베이커리"
                                value={basicInfo.company_name}
                                onChange={(e) => setBasicInfo({ ...basicInfo, company_name: e.target.value })}
                            />
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider pl-1">인사말 / 공지</label>
                                <textarea
                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-text-main placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 h-24"
                                    placeholder="예: 안녕하세요! 신선한 재료로 당일 생산합니다."
                                    value={basicInfo.shop_notice}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, shop_notice: e.target.value })}
                                />
                            </div>
                            <Input
                                label="입금 계좌 정보"
                                placeholder="예: 카카오뱅크 3333-00-1234567 박일용"
                                value={basicInfo.bank_account}
                                onChange={(e) => setBasicInfo({ ...basicInfo, bank_account: e.target.value })}
                            />

                            {/* Logo Upload Section */}
                            <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider pl-1 mb-2">상점 로고</label>
                                <div className="flex items-start gap-4">
                                    <div className="relative group w-24 h-24 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                                        {shopLogo?.options ? (
                                            <>
                                                <img src={shopLogo.options} alt="Shop Logo" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-bold">변경</span>
                                                </div>
                                            </>
                                        ) : (
                                            <ImageIcon className="text-text-muted opacity-50" size={32} />
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                    </div>
                                    <div className="flex-1 text-sm text-text-muted">
                                        <p>주문서 최상단에 표시될 로고를 업로드하세요.</p>
                                        <p className="text-xs opacity-70 mt-1">권장 크기: 200x200px (정사각형)</p>
                                        {shopLogo && (
                                            <button
                                                onClick={() => removeElement(shopLogo.id)}
                                                className="mt-2 text-xs text-red-400 hover:text-red-500 font-bold"
                                            >
                                                로고 삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Form Elements */}
                    <div className="space-y-4">
                        <Reorder.Group axis="y" values={elements} onReorder={setElements} className="space-y-4">
                            {elements.filter(el => el.type !== 'ShopLogo').map((el, index) => (
                                <ConfigItem
                                    key={el.id}
                                    item={el}
                                    index={index}
                                    totalCount={elements.filter(e => e.type !== 'ShopLogo').length}
                                    updateElement={updateElement}
                                    removeElement={removeElement}
                                    moveElement={moveElement}
                                    user={user}
                                />
                            ))}
                        </Reorder.Group>

                        {elements.length === 0 && (
                            <div className="py-20 text-center glass border-dashed bg-white/0 border-gray-300 dark:border-white/10">
                                <AlertCircle className="mx-auto text-text-muted mb-4" size={48} />
                                <p className="text-text-muted font-bold text-lg">아직 디자인된 항목이 없습니다.</p>
                                <p className="text-text-muted text-sm italic">오른쪽 도구상자에서 항목을 추가하세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Toolbox */}
                <div className="lg:col-span-4 h-fit sticky top-24 space-y-4">
                    <Button
                        onClick={saveConfig}
                        disabled={loading}
                        className="w-full py-4 shadow-xl shadow-primary/20 font-black text-lg"
                        leftIcon={!loading ? <Save size={20} /> : undefined}
                        isLoading={loading}
                    >
                        저장하기
                    </Button>
                    <div className="glass overflow-hidden border-t-2 border-t-primary">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                            <h3 className="font-black flex items-center gap-2 text-text-main"><Plus size={18} className="text-primary" /> 항목 추가</h3>
                        </div>
                        <div className="p-4 space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2">입력 필드</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => addElement('Text', '텍스트 입력')} className={toolboxButtonClass}><Type size={16} /> 텍스트 (한 줄)</button>
                                    <button onClick={() => addElement('TextArea', '상세 내용 입력')} className={toolboxButtonClass}><AlignLeft size={16} /> 텍스트 (여러 줄)</button>
                                    <button onClick={() => addElement('Date', '날짜 선택')} className={toolboxButtonClass}><Calendar size={16} /> 날짜 선택</button>
                                    <div className="relative">
                                        <button onClick={() => addElement('FileUpload', '사진 첨부')} className={toolboxButtonClass}><Upload size={16} /> 사진 첨부 (최대 5개)</button>
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded">Limit 5</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2 font-black text-emerald-500">선택 필드 (금액 추가 가능)</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => addElement('Radio', '하나만 선택')} className={`${toolboxButtonClass} hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400`}><ListOrdered size={16} /> 단일 선택 (라디오)</button>
                                    <button onClick={() => addElement('Checkbox', '여러개 선택')} className={`${toolboxButtonClass} hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400`}><CheckSquare size={16} /> 다중 선택 (체크박스)</button>
                                    <button onClick={() => addElement('Select', '목록에서 선택')} className={`${toolboxButtonClass} hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400`}><ChevronDown size={16} /> 드롭다운 (목록 선택)</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-2 font-black text-blue-500">꾸미기</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => addElement('Image', '')} className={`${toolboxButtonClass} hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400`}><ImageIcon size={16} /> 이미지 표시 (배너)</button>
                                    <button onClick={() => addElement('Notice', '공지사항 입력')} className={`${toolboxButtonClass} hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400`}><Info size={16} /> 안내 문구</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GuideModal
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                pageId="config"
                title="환경 설정 가이드"
            />
        </div >
    );
};

export default ConfigPage;
