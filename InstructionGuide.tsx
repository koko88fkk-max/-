
import React from 'react';
import { Step } from '../types';

const STEPS: Step[] = [
  {
    title: "1. تنظيف الملفات (كلين)",
    description: "فك ملف السبوفر، ادخل مجلد (discord.gg t3n) ثم (كلين). شغل أول 4 ملفات بالترتيب وانتظرها تقفل لحالها. لما يطلب (y/n)، اضغط حرف Y. الملف الخامس شغله وبيطفي لحاله.",
    warning: "اضغط Y فقط في الملفات الأربعة الأولى."
  },
  {
    title: "2. أداة UpdatedApple",
    description: "شغل (UpdatedApple) اللي صورته تفاحة كمسؤول. اضغط رقم 1، ثم أي زر للمتابعة. لما يطلب (y/n)، اختار N (يعني No).",
    isImportant: true,
    warning: "ممنوع تضغط Y في UpdatedApple نهائياً."
  },
  {
    title: "3. تفعيل الكود والسبوفر",
    description: "سو ريستارت للـ PC. شغل ملف الـ exe كمسؤول، حط الـ Key اللي جاك من المتجر. بعد ما يفتح السبوفر اضغط موافق على الاتفاقية."
  },
  {
    title: "4. إعدادات الدرع (Custom)",
    description: "روح لعلامة الدرع وفعل: Permanent Spoof (HWID), EFI Spoof Auto, MAC Spoof Natural, MAC Spoof NIC, Volume ID Spoof, TPM Bypass Fortnite. ثم اضغط EXECUTE على اليمين.",
    isImportant: true
  },
  {
    title: "5. التشغيل واللعب",
    description: "روح لعلامة الصاروخ واضغط perm spoof، اختر اللعبة (أو Others للألعاب غير الموجودة) ثم Start Spoofing. انتظر كلمة Restart this PC ثم سو إعادة تشغيل.",
    warning: "بعد الريستارت ادخل بحساب جديد وشغل هذا البرنامج (https://downloads.cloudflareclient.com/v1/download/windows/ga=) لمدة 3 أيام."
  }
];

interface InstructionGuideProps {
  onClose: () => void;
}

const InstructionGuide: React.FC<InstructionGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d1117] border border-[#1e3a5f]/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#1e3a5f]/10 flex justify-between items-center bg-[#1e3a5f]/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-[#1e3a5f] rounded-full"></span>
            دليل تشغيل السبوفر بالحرف
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative pr-8 border-r border-[#1e3a5f]/20 pb-8 last:pb-0">
              <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[10px] font-bold text-white border-4 border-[#0d1117]">
                {idx + 1}
              </div>
              
              <div className={`p-5 rounded-2xl border transition-all ${step.isImportant ? 'bg-amber-500/5 border-amber-500/30' : 'bg-[#1e3a5f]/5 border-[#1e3a5f]/10'}`}>
                <h3 className={`font-bold mb-2 ${step.isImportant ? 'text-amber-400' : 'text-white'}`}>
                  {step.title}
                </h3>
                <div className="text-sm text-zinc-400 leading-relaxed mb-3 break-words">
                  {step.description}
                </div>
                {step.warning && (
                  <div className="flex items-start gap-2 text-[11px] font-bold text-red-400/80 bg-red-400/5 p-2 rounded-lg border border-red-400/10">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="break-all">{step.warning}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
             <p className="text-xs text-blue-300 text-center font-medium">
               إذا ما فهمت شيء توجه سيرفر الدسكورد بيساعدوك بكل شيء: <br/>
               <a href="https://discord.gg/T3N" target="_blank" className="underline font-bold">discord.gg/T3N</a>
             </p>
          </div>
        </div>
        
        <div className="p-6 bg-[#050505] border-t border-[#1e3a5f]/10">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#1e3a5f] hover:bg-[#2a4f7d] text-white font-bold rounded-xl shadow-lg shadow-[#1e3a5f]/20 transition-all"
          >
            فهمت الشرح، بروح أطبق!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionGuide;
