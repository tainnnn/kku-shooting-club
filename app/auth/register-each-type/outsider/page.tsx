'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Upload, X, Loader2, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const BUCKET = 'avatars'; // ใช้ bucket ที่ตั้ง policy แล้ว (private + RLS)

type FormState = {
  prefix: string;
  prefix_other: string;
  first_name: string;
  last_name: string;
  phone: string;
  job: string;
  address: string;
  applicantPhoto?: File | null;   // avatar
  citizen_card_url?: File | null; // บัตรประชาชน
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
  isTextArea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label, placeholder, value, onChange, type='text', inputMode, pattern, isSelect=false, options, isTextArea=false
}) => (
  <div className="mb-4">
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {isSelect ? (
      <div className="relative">
        <select
          required
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm shadow-sm outline-none transition duration-150 ease-in-out focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white text-gray-400 ${value ? 'text-gray-800' : 'text-gray-400'}`}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options?.map(o => <option key={o} value={o} className="py-2 px-3 text-sm">{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    ) : isTextArea ? (
      <textarea
        required
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm outline-none transition duration-150 ease-in-out focus:border-gray-600 focus:ring-1 focus:ring-gray-600 dark:bg-white dark:text-gray-800"
      />
    ) : (
      <Input
        required
        type={type}
        inputMode={inputMode}
        pattern={pattern}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </div>
);

export default function OutsideRegistrationForm() {
  const router = useRouter();

  // ใช้ client จาก @supabase/ssr เพื่อแนบ apikey + session ให้อัตโนมัติ
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );

  const [submitting, setSubmitting] = useState(false);
  const [applicantPhotoPreview, setApplicantPhotoPreview] = useState<string | null>(null);
  const [citizenPreview, setCitizenPreview] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    prefix:'', prefix_other:'', first_name:'', last_name:'',
    phone:'', job:'', address:'',
    applicantPhoto: null, citizen_card_url: null,
  });

  useEffect(() => {
    return () => {
      if (applicantPhotoPreview) URL.revokeObjectURL(applicantPhotoPreview);
      if (citizenPreview) URL.revokeObjectURL(citizenPreview);
    };
  }, [applicantPhotoPreview, citizenPreview]);

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(s => ({ ...s, [key]: val }));
  }

  function onApplicantPhotoChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null);
    setApplicantPhotoPreview(file ? URL.createObjectURL(file) : null);
  }
  function onCitizenChange(file?: File | null) {
    handleChange('citizen_card_url', file ?? null);
    setCitizenPreview(file ? URL.createObjectURL(file) : null);
  }

  /** อัปโหลดชื่อไฟล์คงที่ + upsert กันการสร้างไฟล์ซ้ำ */
  async function uploadFixed(file: File, userId: string, folder: 'avatar'|'citizen') {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `users/${userId}/${folder}/current.${ext}`; // ไม่มี '/' นำหน้า
    const { data, error } = await supabase.storage.from(BUCKET).upload(key, file, {
      upsert: true,
      cacheControl: '0',
      contentType: file.type || `image/${ext}`,
    });
    if (error) {
      // ดัก error api key เพื่อชี้เป้าปัญหา env
      if (error.message?.toLowerCase().includes('no api key')) {
        throw new Error('ไม่พบ API key: กรุณาเช็ค NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ใน .env.local แล้ว restart dev server');
      }
      throw error;
    }
    return data.path; // เก็บ path ลง DB
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return; // กันกดซ้ำ
    setSubmitting(true);
    const statusEl = document.getElementById('form-status');

    try {
      const prefixResolved = form.prefix === 'อื่น ๆ' ? form.prefix_other.trim() : form.prefix;
      if (!prefixResolved) throw new Error('โปรดระบุคำนำหน้า');
      if (!form.job.trim()) throw new Error('โปรดระบุอาชีพ');
      if (!form.address.trim()) throw new Error('โปรดระบุที่อยู่');

      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');

      // อัปโหลด (จำกัด 1MB/ไฟล์)
      let avatarPath: string | null = null;
      let citizenPath: string | null = null;

      if (form.applicantPhoto) {
        if (form.applicantPhoto.size > 1_000_000) throw new Error('รูปผู้สมัครเกิน 1MB');
        avatarPath = await uploadFixed(form.applicantPhoto, user.id, 'avatar');
      }
      if (form.citizen_card_url) {
        if (form.citizen_card_url.size > 1_000_000) throw new Error('สำเนาบัตรประชาชนเกิน 1MB');
        citizenPath = await uploadFixed(form.citizen_card_url, user.id, 'citizen');
      }

      // payload ตาม schema + กติกา outsider (kku_mail = NULL)
      const payload = {
        id: user.id,
        role: 'outside',
        prefix: prefixResolved,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),

        phone: form.phone.trim() || null,
        job: form.job.trim(),                 // ต้องไม่ว่าง
        address: form.address.trim(),         // ต้องไม่ว่าง

        avatar_url: avatarPath,
        citizen_card_url: citizenPath,
        staff_card_url: null,

        student_id: null,
        year: null,
        faculty: null,
        major: null,
        unit: null,
        unit_position: null,
        kku_mail: null,

        email_login: user.email ?? '',
      };

      // upsert ตาม PK = id (ผ่าน RLS ด้วย check id = auth.uid())
      const { error: upsertErr } = await supabase
        .from('user')
        .upsert(payload, { onConflict: 'id' });

      if (upsertErr) {
        // เผื่อกรณีชน CHECK constraint เก่า
        if (String(upsertErr.message).includes('user_kku_mail_role_check')) {
          throw new Error('ลงทะเบียนไม่ผ่าน: โปรดเช็ค constraint user_kku_mail_role_check ให้ allow role=outside ที่ kku_mail เป็น NULL');
        }
        throw upsertErr;
      }

      statusEl && (statusEl.innerText = 'ส่งข้อมูลสำเร็จ',
                   statusEl.className = 'mt-4 text-center text-green-600 font-bold');

      router.push('/content/profile');
    } catch (err: any) {
      statusEl && (statusEl.innerText =
        err?.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล',
        statusEl.className = 'mt-4 text-center text-red-600 font-bold');
      console.error(err);
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
          <span className="text-sm md:text-base">บุคคลภายนอก</span>
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
                  placeholder="เช่น คุณ, ดร., Mr., Ms." maxLength={20} aria-label="ระบุคำนำหน้าเอง" />
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

            <InputField label="อาชีพ" placeholder="อาชีพ"
              value={form.job} onChange={(v)=>handleChange('job', v)} />

            <InputField label="ที่อยู่"
              placeholder="บ้านเลขที่, หมู่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
              value={form.address} onChange={(v)=>handleChange('address', v)} isTextArea />

            {/* รูปผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${applicantPhotoPreview ? 'border-green-400' : 'border-dashed border-gray-300'} bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                  <div className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-gray-500" />
                    <span className={`truncate ${applicantPhotoPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e)=>onApplicantPhotoChange(e.target.files?.[0])} required />
                </label>
                {applicantPhotoPreview && (
                  <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                    <button type="button" onClick={()=>onApplicantPhotoChange(null)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition" aria-label="ลบรูปภาพ">
                      <X className="h-4 w-4" />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={applicantPhotoPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
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