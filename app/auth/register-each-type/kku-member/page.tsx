'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import { Input } from "@/components/ui/input";


type FormState = {
  fullname: string
  phone: string
  affiliation: string
  position: string
  applicantPhoto?: File | null
  idCardCopy?: File | null
  kkuIdCard?: File | null
}


interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    inputMode?: 'text' | 'numeric' | 'tel' | 'email';
    pattern?: string;
    isSelect?: boolean;
    options?: string[];
    isTextArea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    placeholder,
    value,
    onChange,
    type = 'text',
    inputMode,
    pattern,
    isSelect = false,
    options,
    isTextArea = false,
}) => (
    <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
        {isSelect ? (
            <div className="relative">
                <select
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2 text-sm text-gray-800 shadow-sm outline-none transition duration-150 ease-in-out focus:border-black focus:ring-0 dark:bg-white dark:text-gray-800"
                >
                    <option value="" disabled>{placeholder}</option>
                    {options?.map((option) => (
                        <option key={option} value={option} className="py-2 px-3 text-sm">
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
            </div>
        ) : isTextArea ? (
            <textarea
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm outline-none transition duration-150 ease-in-out focus:border-black focus:ring-0 dark:bg-white dark:text-gray-800"
            />
        ) : (
            <Input
                required
                type={type}
                inputMode={inputMode}
                pattern={pattern}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        )}
    </div>
);

// (ปรับปรุง) เปลี่ยนชื่อ Component
export default function KKURegistrationForm() {
    // 2. (ปรับปรุง) เพิ่ม state preview ตัวที่ 3
    const [applicantPhotoPreview, setApplicantPhotoPreview] = useState<string | null>(null)
    const [idCardCopyPreview, setIdCardCopyPreview] = useState<string | null>(null)
    const [kkuIdCardPreview, setKkuIdCardPreview] = useState<string | null>(null) // <-- เพิ่มตัวที่ 3

    const [submitting, setSubmitting] = useState(false)

    // 2. (ปรับปรุง) อัปเดต state เริ่มต้นให้ตรงกับ Type ใหม่
    const [form, setForm] = useState<FormState>({
        fullname: '',
        phone: '',
        affiliation: '', // สังกัด
        position: '',    // ตำแหน่ง
        applicantPhoto: null,
        idCardCopy: null,
        kkuIdCard: null,   // บัตรแสดงตน
  })

  function handleChange<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }))
  }

  // (คงเดิม) Handler สำหรับรูปถ่ายผู้สมัคร
  function onApplicantPhotoChange(file?: File | null) {
    handleChange('applicantPhoto', file ?? null)
    if (file) setApplicantPhotoPreview(URL.createObjectURL(file))
    else setApplicantPhotoPreview(null)
  }

  // (คงเดิม) Handler สำหรับสำเนาบัตรประชาชน
  function onIdCardCopyChange(file?: File | null) {
    handleChange('idCardCopy', file ?? null)
    if (file) setIdCardCopyPreview(URL.createObjectURL(file))
    else setIdCardCopyPreview(null)
  }

  // 3. (เพิ่ม) Handler สำหรับบัตรแสดงตน มข.
  function onKkuIdCardChange(file?: File | null) {
    handleChange('kkuIdCard', file ?? null)
    if (file) setKkuIdCardPreview(URL.createObjectURL(file))
    else setKkuIdCardPreview(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      // จำลองการส่งข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4. (ปรับปรุง) อัปเดต payload และ log
      const payload = {
        ...form,
        applicantPhoto: undefined,
        idCardCopy: undefined,
        kkuIdCard: undefined, // <-- เพิ่มตัวนี้
      }

      console.log('submit (Form Data):', payload)
      console.log('submit (Applicant Photo File):', form.applicantPhoto)
      console.log('submit (ID Card File):', form.idCardCopy)
      console.log('submit (KKU ID Card File):', form.kkuIdCard) // <-- เพิ่มตัวนี้

      // (คงเดิม) ส่วนแสดงผลลัพธ์
      if (document.getElementById('form-status')) {
        document.getElementById('form-status')!.innerText = 'ส่งข้อมูลสำเร็จ (เดโม: โปรดเปลี่ยน flow นี้ภายหลัง)';
        document.getElementById('form-status')!.className = 'mt-4 text-center text-green-600 font-bold';
      }

    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-gray-50 py-10">
      <div className="w-full max-w-xl px-4 md:px-0">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-700">ลงทะเบียนสมัครแข่งขัน</h1>
        </div>

        {/* 4. (ปรับปรุง) เปลี่ยน Divider Text */}
        <div className="mb-12 flex w-full items-center gap-3 text-gray-500">
          <div className="h-px flex-1 bg-gray-300" />
          <span className="text-sm md:text-base">บุคลากรมหาวิทยาลัยขอนแก่น</span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_0_25px_5px_rgba(0,0,0,0.07)] border border-gray-100 sm:p-8">

          <form onSubmit={onSubmit} noValidate>

            {/* (คงเดิม) ชื่อ-สกุล */}
            <InputField
                label="ชื่อ-สกุล (มีคำนำหน้า)"
                placeholder="ชื่อ-สกุล"
                value={form.fullname}
                onChange={(v) => handleChange('fullname', v)}
            />

            {/* (คงเดิม) เบอร์โทร */}
            <InputField
                label="เบอร์โทรติดต่อ"
                placeholder="08X-XXXXXXX"
                value={form.phone}
                type="tel"
                inputMode="tel"
                onChange={(v) => handleChange('phone', v.replace(/[^\d+]/g, ''))}
            />

            {/* 4. (ปรับปรุง) เปลี่ยนเป็น สังกัด */}
            <InputField
                label="สังกัด"
                placeholder="คณะ/หน่วยงาน"
                value={form.affiliation}
                onChange={(v) => handleChange('affiliation', v)}
            />

            {/* 4. (ปรับปรุง) เปลี่ยนเป็น ตำแหน่ง */}
            <InputField
                label="ตำแหน่ง"
                placeholder="เช่น อาจารย์, นักวิชาการคอมพิวเตอร์"
                value={form.position}
                onChange={(v) => handleChange('position', v)}
                // ไม่ต้องใช้ isTextArea={true}
            />


            {/* (คงเดิม) รูปถ่ายผู้สมัคร */}
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-gray-700">รูปถ่ายผู้สมัคร</label>
              <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${
                    applicantPhotoPreview ? 'border-green-400' : 'border-dashed border-gray-300'
                } bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                    <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className={`truncate ${applicantPhotoPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                            {form.applicantPhoto ? form.applicantPhoto.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                        </span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onApplicantPhotoChange(e.target.files?.[0])}
                        required
                    />
                </label>
                {applicantPhotoPreview && (
                    <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                        <button
                            type="button"
                            onClick={() => onApplicantPhotoChange(null)}
                            className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                            aria-label="ลบรูปภาพ"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img src={applicantPhotoPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                    </div>
                )}
              </div>
            </div>

            {/* (คงเดิม) สำเนาบัตรประชาชน */}
            <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</label>
                <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${
                    idCardCopyPreview ? 'border-green-400' : 'border-dashed border-gray-300'
                } bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                    <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className={`truncate ${idCardCopyPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                            {form.idCardCopy ? form.idCardCopy.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'}
                        </span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onIdCardCopyChange(e.target.files?.[0])}
                        required
                    />
                </label>
                {idCardCopyPreview && (
                    <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                        <button
                            type="button"
                            onClick={() => onIdCardCopyChange(null)}
                            className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                            aria-label="ลบรูปภาพ"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img src={idCardCopyPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" />
                    </div>
                )}
                </div>
            </div>

            {/* 4. (เพิ่ม) บัตรแสดงตนว่าเป็นบุคคลากรภายใน */}
            <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">บัตรแสดงตนว่าเป็นบุคคลากรภายใน</label>
                <div className="relative">
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border ${
                    kkuIdCardPreview ? 'border-green-400' : 'border-dashed border-gray-300' // <-- ใช้ kkuIdCardPreview
                } bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition hover:border-gray-400`}>
                    <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className={`truncate ${kkuIdCardPreview ? 'text-gray-800 font-medium' : 'text-gray-500'}`}> {/* <-- ใช้ kkuIdCardPreview */}
                            {form.kkuIdCard ? form.kkuIdCard.name : 'อัพโหลดรูปภาพ (ไม่เกิน 1MB)'} {/* <-- ใช้ form.kkuIdCard */}
                        </span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onKkuIdCardChange(e.target.files?.[0])}
                        required
                    />
                </label>
                {kkuIdCardPreview && ( /* <-- ใช้ kkuIdCardPreview */
                    <div className="mt-4 relative h-40 w-full overflow-hidden rounded-xl border-2 border-green-500 shadow-md">
                        <button
                            type="button"
                            onClick={() => onKkuIdCardChange(null)} /* <-- ใช้ onKkuIdCardChange */
                            className="absolute top-2 right-2 z-10 rounded-full bg-red-600 p-1 text-white shadow-lg hover:bg-red-700 transition"
                            aria-label="ลบรูปภาพ"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img src={kkuIdCardPreview} alt="รูปพรีวิว" className="h-full w-full object-cover" /> {/* <-- ใช้ kkuIdCardPreview */}
                    </div>
                )}
                </div>
            </div>


            {/* (คงเดิม) Submit Button */}
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
  )
}
