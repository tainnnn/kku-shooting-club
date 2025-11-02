'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Upload, X, Loader2, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const BUCKET = 'avatars'; // ใช้ bucket เดียวตามที่ตั้ง policy ไว้

type FormState = {
  prefix: string;
  prefix_other: string;
  first_name: string;
  last_name: string;

  phone: string;
  unit: string;
  unit_position: string;

  applicantPhoto?: File | null;   // รูปผู้สมัคร (avatar)
  citizen_card_url?: File | null; // บัตรประชาชน
  staff_card_url?: File | null;   // บัตรบุคลากรภายใน
};

const prefixes = ['นาย', 'นาง', 'นางสาว', 'อื่น ๆ'] as const;

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  pattern?: string;
  isSelect?: boolean;
  options?: readonly string[];
}
const InputField: React.FC<InputFieldProps> = ({
  label, placeholder, value, onChange, type='text', inputMode, pattern, isSelect=false, options
}) => (
  <div className="mb-4">
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {isSelect ? (
      <div className="relative">
        <select
          required value={value} onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none transition duration-150 ease-in-out focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white text-gray-400 ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options?.map((option) => (
            <option key={option} value={option} className="py-2 px-3 text-sm text-gray-800">{option}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    ) : (
      <Input required type={type} inputMode={inputMode} pattern={pattern}
             value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}/>
    )}
  </div>
);

export default function KkuMemberForm() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [submitting, setSubmitting] = useState(false);

  const [applicantPreview, setApplicantPreview] = useState<string | null>(null);
  const [citizenPreview, setCitizenPreview] = useState<string | null>(null);
  const [staffPreview, setStaffPreview] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    prefix:'', prefix_other:'', first_name:'', last_name:'',
    phone:'', unit:'', unit_position:'',
    applicantPhoto: null, citizen_card_url: null, staff_card_url: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('SESSION:', !!data.session, data.session?.user?.email);
    });
    return () => {
      if (applicantPreview) URL.revokeObjectURL(applicantPreview);
      if (citizenPreview) URL.revokeObjectURL(citizenPreview);
      if (staffPreview) URL.revokeObjectURL(staffPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  function onApplicantChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null);
    if (applicantPreview) URL.revokeObjectURL(applicantPreview);
    setApplicantPreview(file ? URL.createObjectURL(file) : null);
  }
  function onCitizenChange(file?: File | null) {
    handleChange('citizen_card_url', file ?? null);
    if (citizenPreview) URL.revokeObjectURL(citizenPreview);
    setCitizenPreview(file ? URL.createObjectURL(file) : null);
  }
  function onStaffChange(file?: File | null) {
    handleChange('staff_card_url', file ?? null);
    if (staffPreview) URL.revokeObjectURL(staffPreview);
    setStaffPreview(file ? URL.createObjectURL(file) : null);
  }

  /** อัปโหลดแบบ "ชื่อไฟล์คงที่ + ทับไฟล์เดิม" กันไฟล์ซ้ำ */
  async function uploadFixed(file: File, userId: string, folder: 'avatar'|'citizen'|'staffcard') {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `users/${userId}/${folder}/current.${ext}`; // ชื่อคงที่
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, file, {
      upsert: true,                   // สำคัญ: ทับไฟล์เดิม
      cacheControl: '0',
      contentType: file.type || `image/${ext}`,
    });
    if (error) throw error;
    return data.path; // เก็บ path ลง DB
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const statusEl = document.getElementById('form-status');

    try {
      const prefixResolved = form.prefix === 'อื่น ๆ' ? form.prefix_other.trim() : form.prefix;
      if (!prefixResolved) throw new Error('โปรดระบุคำนำหน้า');
      if (!form.unit.trim()) throw new Error('โปรดระบุสังกัด');
      if (!form.unit_position.trim()) throw new Error('โปรดระบุตำแหน่ง');

      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');

      // uploads (ไฟล์ละ <= 1MB)
      let avatarPath: string | null = null;
      let citizenPath: string | null = null;
      let staffPath: string | null = null;

      if (form.applicantPhoto) {
        if (form.applicantPhoto.size > 1_000_000) throw new Error('รูปผู้สมัครเกิน 1MB');
        avatarPath = await uploadFixed(form.applicantPhoto, user.id, 'avatar');
      }
      if (form.citizen_card_url) {
        if (form.citizen_card_url.size > 1_000_000) throw new Error('สำเนาบัตรประชาชนเกิน 1MB');
        citizenPath = await uploadFixed(form.citizen_card_url, user.id, 'citizen');
      }
      if (form.staff_card_url) {
        if (form.staff_card_url.size > 1_000_000) throw new Error('บัตรบุคลากรเกิน 1MB');
        staffPath = await uploadFixed(form.staff_card_url, user.id, 'staffcard');
      }

      // payload ให้ตรง schema + RLS
      const payload = {
        id: user.id,
        role: 'staff',
        prefix: prefixResolved,
        first_name: form.first_name,
        last_name: form.last_name,

        phone: form.phone || null,
        unit: form.unit,
        unit_position: form.unit_position,

        avatar_url: avatarPath,
        citizen_card_url: citizenPath,
        staff_card_url: staffPath,

        // ช่องของนักศึกษา/คนนอก -> null
        student_id: null,
        year: null,
        faculty: null,
        major: null,
        job: null,
        address: null,

        // member ไม่บังคับ kku_mail
        kku_mail: null,

        email_login: user.email ?? '',
      };

      const { error: upsertErr } = await supabase.from('user').upsert(payload, { onConflict: 'id' });
      if (upsertErr) throw upsertErr;

      statusEl && (statusEl.innerText = 'ส่งข้อมูลสำเร็จ',
                   statusEl.className = 'mt-4 text-center text-green-600 font-bold');

      router.push('/content/profile');
    } catch (err: any) {
      statusEl && (statusEl.innerText = err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล',
                   statusEl.className = 'mt-4 text-center text-red-600 font-bold');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm md:text-base">บุคลากรมหาวิทยาลัยขอนแก่น</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">
          <form onSubmit={onSubmit} noValidate>
            <InputField label="คำนำหน้า" placeholder="เลือกคำนำหน้า"
              value={form.prefix} onChange={(v)=>handleChange('prefix', v)} isSelect options={prefixes} />
            {form.prefix === 'อื่น ๆ' && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-gray-500">ระบุคำนำหน้า</label>
                <Input required value={form.prefix_other}
                  onChange={(e)=>handleChange('prefix_other', e.target.value)}
                  placeholder="เช่น ดร., อาจารย์, คุณ, Mr., Ms." maxLength={20} aria-label="ระบุคำนำหน้าเอง" />
                <p className="mt-[5px] mb-3 px-2 text-[11px] text-gray-400">กำหนดเองได้สูงสุด 20 ตัวอักษร</p>
              </div>
            )}

            <InputField label="ชื่อ" placeholder="ชื่อ (ไม่ต้องใส่คำนำหน้า)"
              value={form.first_name} onChange={(v)=>handleChange('first_name', v)} />
            <InputField label="นามสกุล" placeholder="นามสกุล"
              value={form.last_name} onChange={(v)=>handleChange('last_name', v)} />

            <InputField label="เบอร์โทรติดต่อ" placeholder="08X-XXXXXXX"
              value={form.phone} type="tel" inputMode="tel"
              onChange={(v)=>handleChange('phone', v.replace(/[^\d+]/g, ''))} />

            <InputField label="สังกัด" placeholder="คณะ/หน่วยงาน"
              value={form.unit} onChange={(v)=>handleChange('unit', v)} />
            <InputField label="ตำแหน่ง" placeholder="เช่น อาจารย์, นักวิชาการคอมพิวเตอร์"
              value={form.unit_position} onChange={(v)=>handleChange('unit_position', v)} />

            {/* รูปผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${applicantPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${applicantPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e)=>onApplicantChange(e.target.files?.[0])} required />
                </label>
                {applicantPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button type="button" onClick={()=>onApplicantChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition" aria-label="ลบรูปภาพ">
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={applicantPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* สำเนาบัตรประชาชน */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${citizenPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${citizenPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.citizen_card_url ? form.citizen_card_url.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e)=>onCitizenChange(e.target.files?.[0])} required />
                </label>
                {citizenPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button type="button" onClick={()=>onCitizenChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition" aria-label="ลบรูปภาพ">
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={citizenPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* บัตรบุคลากร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">บัตรแสดงตนว่าเป็นบุคลากรภายใน</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${staffPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${staffPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.staff_card_url ? form.staff_card_url.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e)=>onStaffChange(e.target.files?.[0])} required />
                </label>
                {staffPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button type="button" onClick={()=>onStaffChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition" aria-label="ลบรูปภาพ">
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={staffPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-500 px-5 py-3 text-white text-base font-semibold shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] transition duration-300 hover:bg-green-600 disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังส่งข้อมูล...
                </span>
              ) : (
                'ยืนยันการลงทะเบียน'
              )}
            </button>
            <div id="form-status" className="mt-4 text-center text-sm"></div>
          </form>
        </div>

        <div className="mt-8 text-xs text-gray-500 text-center">
          ระบบลงทะเบียนแข่งขันยิงปืน มหาวิทยาลัยขอนแก่น
        </div>
      </div>
    </div>
  );
}